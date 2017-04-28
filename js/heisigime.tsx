import Heap from "heap";
import Levenshtein from "levenshtein";
import React, { Component, KeyboardEvent } from "react";
import Wanakana from "wanakana";
import { RTKv6 } from "./data/rtkv6";
import { takeHeap } from "./util";
import { WordListFilter } from "./wordlistfilter";

interface Props {
  onInput: (character: string) => void,
}

interface State {
  query: string,
  candidates: Candidate[],
}

interface Candidate {
  kanji: string,
  keyword: string,
  distance: number,
}

export class HeisigIME extends Component<Props, State> {

  wordlist: WordListFilter<string>;

  constructor() {
    super();

    this.wordlist = new WordListFilter(RTKv6, 2);

    this.state = { query: '', candidates: [] };
  }

  completed(character: string) {
    this.props.onInput(character);
    this.setQuery('');
  }

  renderItem({ kanji, keyword, distance }: Candidate, hilighted: boolean) {
    let classes = 'completion';
    if (hilighted) {
      classes += ' hilighted'
    }
    classes += distance <= 2 ? ' close' : ' far';
    return (
      <div
        key={kanji}
        title={keyword}
        className={classes}
        onClick={() => this.completed(kanji)}
      >
        {kanji}
      </div>
    );
  }

  setQuery(query: string) {
    const candidates = query !== '' ? this.search(query, 50) : [];
    this.setState({ query, candidates });
  }

  search(query: string, max: number): Candidate[] {
    query = query.toLowerCase();

    const sorted     = new Heap<Candidate>((x, y) => x.distance - y.distance);
    const candidates = this.wordlist.fetch(query);
    if (candidates) {
      for (const candidate of candidates) {
        const [kanji, keyword] = candidate;
        const distance         = new Levenshtein(query, keyword.toLowerCase()).distance;
        sorted.push({ kanji, keyword, distance });
      }
    }
    return takeHeap(sorted, max);
  }

  handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.getModifierState("Control")) {
      if (event.keyCode === 74) {
        this.completed(Wanakana.toHiragana(this.state.query));
        event.preventDefault();
      }
      else if (event.keyCode === 75) {
        this.completed(Wanakana.toKatakana(this.state.query));
        event.preventDefault();
      }
    }
    else {
      if (event.keyCode === 13) {
        const result = this.state.candidates[0];
        if (result) {
          this.completed(result.kanji);
          event.preventDefault();
        }
      }
    }
  }

  render() {
    return (
      <div className="ime">
        <input
          value={this.state.query}
          onChange={(event) => this.setQuery(event.target.value)}
          placeholder="Keyword"
          onKeyDown={(evt) => this.handleKeyDown(evt)}
          autoComplete="off" autoCorrect="off" autoCapitalize="off"/>
        <div className="completions">
          {this.state.candidates.map((c) => this.renderItem(c, false))}
        </div>
      </div>
    );
  }
}
