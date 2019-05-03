import Heap from "heap";
import Levenshtein from "levenshtein";
import React, { Component, KeyboardEvent } from "react";
import * as Wanakana from "wanakana";
import { RTKv6 } from "./data/rtkv6";
import { takeHeap } from "./util";
import { WordListFilter } from "./wordlistfilter";

interface IProps {
  onInput: (character: string) => void;
  autoFocus: boolean | undefined;
}

interface IState {
  query: string;
  candidates: ICandidate[];
}

interface ICandidate {
  kanji: string;
  keyword: string;
  distance: number;
}

export class HeisigIME extends Component<IProps, IState> {
  private readonly wordlist: WordListFilter<string> = new WordListFilter(RTKv6, 2);

  constructor(initialProps) {
    super(initialProps);
    this.state = { query: "", candidates: [] };
  }

  public render() {
    return (
      <div className="ime">
        <input
          value={this.state.query}
          onChange={(event) => this.setQuery(event.target.value)}
          placeholder="Keyword"
          onKeyDown={(evt) => this.handleKeyDown(evt)}
          autoComplete="off" autoCorrect="off" autoCapitalize="off"
          autoFocus={this.props.autoFocus}
          />
        <div className="completions">
          {this.state.candidates.map((c) => this.renderItem(c, false))}
        </div>
      </div>
    );
  }

  private completed(character: string) {
    this.props.onInput(character);
    this.setQuery("");
  }

  private renderItem({ kanji, keyword, distance }: ICandidate, hilighted: boolean) {
    let classes = "completion";
    if (hilighted) {
      classes += " hilighted";
    }
    classes += distance <= 2 ? " close" : " far";
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

  private setQuery(query: string) {
    const candidates = query !== "" ? this.search(query, 50) : [];
    this.setState({ query, candidates });
  }

  private search(query: string, max: number): ICandidate[] {
    query = query.toLowerCase();

    const sorted     = new Heap<ICandidate>((x, y) => x.distance - y.distance);
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

  private handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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
}
