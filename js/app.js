// -*- mode: web -*-

import React, { Component } from 'react';
import Heap from 'heap';
import Levenshtein from 'levenshtein';
import Kuromoji from 'kuromoji';
import Wanakana from 'wanakana';

import { words as RTKv6 } from './words';
import 'normalize.css/normalize.css';
import '../css/app.css';

function reverseLookupMap() {
  let reverse = {};
  for (const [kanji, keyword] of RTKv6) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

const RTKv6Inverse = reverseLookupMap(RTKv6);

export function *scan(str, n) {
  if (str.length <= n) {
    yield str;
    return;
  }
  for (let i = 0; i <= str.length - n; i++) {
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

function takeHeap(heap, n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    const element = heap.pop();
    if (!element) {
      break;
    }
    result.push(element);
  }
  return result;
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
      <span>
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
      </span>
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

  renderItem({kanji, keyword, distance}, hilighted) {
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
      candidates: this.search(query, 50),
    });
  }

  search(query, max) {
    query = query.toLowerCase();
    const result = [];

    const sorted = new Heap((x, y) => x.distance - y.distance);
    const candidates = this.wordlist.fetch(query);
    if (candidates) {
      for (const candidate of candidates) {
        const [kanji, keyword] = candidate;
        const distance = new Levenshtein(query, keyword).distance;
        sorted.push({kanji, keyword, distance});
      }
    }
    return takeHeap(sorted, 50);
  }

  handleKeyDown(event) {
    if (event.getModifierState("Control")) {
      if (event.keyCode === 74) {
        this.completed(Wanakana.toHiragana(this.state.query));
      }
      else if (event.keyCode === 75) {
        this.completed(Wanakana.toKatakana(this.state.query));
      }
    }
    else {
      if (event.keyCode === 13) {
        const result = this.state.candidates[0];
        if (result) {
          this.completed(result.kanji);
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
      autoComplete="off" autoCorrect="off" autoCapitalize="off" />
      <div className="completions">
        {this.state.candidates.map((c) => this.renderItem(c))}
      </div>
      </div>
    );
  }
}

const Dictionaries = [
  {
    label: 'Jisho',
    inline: true,
    url(query) {
      return `http://jisho.org/search/${query}`;
    },
  },
  {
    label: 'Google',
    inline: false,
    url(query) {
      return `https://google.com/search?q=${query}`;
    },
  },
  {
    label: 'Translate',
    inline: false,
    url(query) {
      return `https://translate.google.com/#ja/en/${query}`
    }
  },
];

const TokenizerLoader = {
  load() {
    if (!this.promise) {
      this.promise = new Promise((ok, fail) => {
        Kuromoji.builder({ dicPath: "/dict/" }).build(
          (err, tokenizer) => {
            if (err) {
              fail(err);
            } else {
              ok(tokenizer);
            }
          }
        );
      });
      this.promise.then((tokenizer) => {
        this.tokenizer = tokenizer;
      });
    }
    return this.promise;
  },
  isLoaded() {
    return !!this.tokenizer;
  }
};

export class App extends Component {
  constructor() {
    super();
    this.state = {
      result: '',
      dictionary: null,
      haveTokenizer: TokenizerLoader.isLoaded(),
      useTokenizer: false,
    };

    this.characterSelected = this.characterSelected.bind(this);
    this.closeDict = this.closeDict.bind(this);
    this.toggleTokenizer = this.toggleTokenizer.bind(this);
  }

  toggleTokenizer() {
    if (!this.state.useTokenizer) {
      this.setState({useTokenizer: true});
      TokenizerLoader.load().then((tokenizer) => {
        this.tokenizer = tokenizer;
        this.setState({haveTokenizer: true});
      });
    }
    else {
      this.setState({useTokenizer: false});
    }
  }

  characterSelected(char) {
    this.setState((prev) => ({result: prev.result + char}));
  }

  showDict(dictionary) {
    const dictionaryURL = dictionary.url(this.state.result);
    if (dictionary.inline) {
      this.setState({dictionaryURL});
    }
    else {
      window.open(dictionaryURL);
    }
  }

  closeDict() {
    this.setState({dictionaryURL: null});
  }

  fakeTokenize(result) {
    return [{word_type: "UNKNOWN", surface_form: result}];
  }

  render() {
    const tokenized = (this.state.useTokenizer && this.tokenizer) ?
                      this.tokenizer.tokenize(this.state.result) :
                      this.fakeTokenize(this.state.result);
    return (
      <div className="app">
      <div className="imePane">
      <div className="outButtons">
       {Dictionaries.map((dict) =>
         <button key={dict.label} onClick={() => this.showDict(dict)}>{dict.label}</button>)}
         <button key="kuromoji" onClick={this.toggleTokenizer}>Kuromoji</button>
      </div>
      <div className="inputs">
          <div className="reverse">
              {tokenized.map(({surface_form, reading}) => {
                 if (surface_form === reading || Wanakana.isKana(surface_form)) {
                   return <span className="token">{surface_form}</span>;
                 }
                 else {
                   return (
                     <ruby className="token">
                         <rb>
                             <Rubifier dictionary={RTKv6Inverse} phrase={surface_form} />
                         </rb>
                         <rp>(</rp>
                         <rt>{reading && Wanakana.toHiragana(reading)}</rt>
                         <rp>)</rp>
                     </ruby>
                   )
                 }})}
          </div>
      <input className="result"
      value={this.state.result}
      onChange={(evt) => this.setState({result: evt.target.value})} placeholder="Result"/>
      <HeisigIME onInput={this.characterSelected}/>
      </div>
      </div>
      {this.state.dictionaryURL &&
       <div className="obscurePane" onClick={this.closeDict}>
       <div className="dictPane">
        <iframe width="100%" height="100%" className="dictFrame" src={this.state.dictionaryURL}/>
       </div>
       </div>}
      </div>
    );
  }
}


