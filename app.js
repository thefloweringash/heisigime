// -*- mode: web -*-

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { words as RTKv6 } from './words';
import './app.css';

function reverseLookupMap() {
  let reverse = {};
  for (const [kanji, keyword] of RTKv6) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

const RTKv6Inverse = reverseLookupMap(RTKv6);

function *scan(str, n) {
  for (let i = 0; i < str.length - n; i++) {
    yield str.substring(i, i + n);
  }
}

function contains(collection, element, equal) {
  for (const cand of collection) {
    if (equal(element, cand)) {
      return true;
    }
  }
  return false;
}

class Rubifier extends React.Component {
  splitPhrase(dictionary, phrase) {
    const result = [];
    let partial = null;
    for (const x of phrase) {
      if (dictionary[x]) {
        if (partial) {
          result.push(partial);
          partial = null;
        }
        result.push(x);
      }
      else {
        partial = partial ? partial + x : x;
      }
    }
    if (partial) {
      result.push(partial);
      partial = null;
    }
    return result;
  }

  render() {
    const { phrase, dictionary } = this.props;
    const split = this.splitPhrase(dictionary, phrase);
    return (
      <div className="reverse">
      {
        split.map((w) => {
          const keyword = dictionary[w[0]];
          if (keyword) {
            return <ruby><rb>{w}</rb><rp>(</rp><rt>{keyword}</rt><rp>)</rp></ruby>;
          }
          else {
            return <span className="boring">{w}</span>
          }
        })
      }
      </div>
    );
  }
}

const current = Symbol('current');

class WordListFilter {
  constructor(words, prefix_size) {
    this.completions = {[current]: words};
    this.prefix_size = prefix_size;

    for (const entry of words) {
      for (const idx of scan(entry[1], prefix_size)) {
        this.addCompletion(idx, entry);
      }
    }
  }

  addCompletion(index, value) {
    let map = this.completions;
    for (const step of index) {
      if (!map[step]) {
        map[step] = {};
      }
      map = map[step];

      if (!map[current]) {
        map[current] = [];
      }
      if (!contains(map[current], value, ([k1], [k2]) => k1 === k2)) {
        map[current].push(value);
      }
    }
  }

  mapForQuery(query) {
    let map = this.completions;
    for (const step of query.substr(0, this.prefix_size)) {
      if (map[step]) {
        map = map[step];
      }
      else {
        return;
      }
    }
    return map;
  }

  fetch(query) {
    const map = this.mapForQuery(query);
    return map && map[current];
  }
}


class HeisigIME extends Component {
  constructor() {
    super();

    this.wordlist = new WordListFilter(RTKv6, 2);

    this.state={query: '', candidates: [] };
  }

  completed(character) {
    this.props.onInput(character);
    this.setQuery('');
  }

  renderItem(item, hilighted) {
    let classes = 'completion';
    if (hilighted) {
      classes += ' hilighted'
    }
    return (
      <div
      key={item[0]}
      title={item[1]}
      className={classes}
      onClick={() => this.completed(item[0])}>
      {item[0]}
      </div>
    );
  }

  setQuery(query) {
    this.setState({
      query,
      candidates: this.refineCandidates(query, 50),
    });
  }

  refineCandidates(query, max) {
    query = query.toLowerCase();
    const result = [];

    const candidates = this.wordlist.fetch(query);
    if (candidates) {
      for (const candidate of candidates) {
        if (candidate[1].startsWith(query)) {
          result.unshift(candidate);
        }
        else if (candidate[1].indexOf(query) !== -1) {
          result.push(candidate);
        }
        if (max && result.length === max)
          break;
      }
    }
    return result;
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      const result = this.state.candidates[0];
      if (result) {
        this.completed(result[0]);
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
      autoComplete="off" autoCorrect="off" autoCapitalize="off" />
      <div className="completions">
        {this.state.candidates.map((c) => this.renderItem(c))}
      </div>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {result: ''};

    this.characterSelected = this.characterSelected.bind(this);
  }

  characterSelected(char) {
    this.setState((prev) => ({result: prev.result + char}));
  }
  
  render() {
    return (
      <div className="app">
      <Rubifier dictionary={RTKv6Inverse} phrase={this.state.result} />
      <input className="result"
      value={this.state.result}
      onChange={(evt) => this.setState({result: evt.target.value})} placeholder="Result"/>
      <HeisigIME onInput={this.characterSelected}/>
      </div>
    );
  }
}

function main() {
  ReactDOM.render(<App />, document.getElementById('appcontainer'));
};

main();
