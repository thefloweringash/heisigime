import React, { Component } from 'react';
import Wanakana from 'wanakana';
import Levenshtein from 'levenshtein';
import Heap from 'heap';
import { takeHeap } from './util';
import { WordListFilter } from './wordlistfilter';
import { words as RTKv6 } from './words';

export class HeisigIME extends Component {
  constructor() {
    super();

    this.wordlist = new WordListFilter(RTKv6, 2);

    this.state = { query: '', candidates: [] };
  }

  completed(character) {
    this.props.onInput(character);
    this.setQuery('');
  }

  renderItem({ kanji, keyword, distance }, hilighted) {
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
        onClick={() => this.completed(kanji)}>
        {kanji}
      </div>
    );
  }

  setQuery(query) {
    this.setState({
      query,
      candidates: query !== '' ? this.search(query, 50) : [],
    });
  }

  search(query, max) {
    query        = query.toLowerCase();
    const result = [];

    const sorted     = new Heap((x, y) => x.distance - y.distance);
    const candidates = this.wordlist.fetch(query);
    if (candidates) {
      for (const candidate of candidates) {
        const [kanji, keyword] = candidate;
        const distance         = new Levenshtein(query, keyword).distance;
        sorted.push({ kanji, keyword, distance });
      }
    }
    return takeHeap(sorted, 50);
  }

  handleKeyDown(event) {
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
          {this.state.candidates.map((c) => this.renderItem(c))}
        </div>
      </div>
    );
  }
}
