// -*- mode: web -*-
import React, { Component } from 'react';
import Kuromoji from 'kuromoji';
import Wanakana from 'wanakana';
import { HeisigIME } from './heisigime';
import { words as RTKv6 } from './words';
import { ShowKeyword } from './showkeyword';
import 'normalize.css/normalize.css';
import '../css/app.less';

function reverseLookupMap() {
  let reverse = {};
  for (const [kanji, keyword] of RTKv6) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

const RTKv6Inverse = reverseLookupMap(RTKv6);

const Dictionaries = [
  {
    label:  'Jisho',
    inline: true,
    url(query) {
      return `http://jisho.org/search/${query}`;
    },
  },
  {
    label:  'Google',
    inline: false,
    url(query) {
      return `https://google.com/search?q=${query}`;
    },
  },
  {
    label:  'Translate',
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

const posClasses = {
  助詞:  'particle',
  形容詞: 'adjective',
  名詞:  'noun',
  動詞:  'verb',
  副詞:  'adverb',
  助動詞: 'auxiliary-verb',
  記号:  'symbol',
  接頭詞: 'prefix',
};

const Token = ({ surface_form, reading, pos }) => {
  const posClass = posClasses[pos] || '';
  if (surface_form === reading || Wanakana.isKana(surface_form)) {
    return <span className={`token ${posClass}`}>{surface_form}</span>;
  }
  else {
    return (
      <ruby className={`token ${posClass}`}>
        <rb>
          <ShowKeyword dictionary={RTKv6Inverse} phrase={surface_form}/>
        </rb>
        <rp>(</rp>
        <rt>{reading && Wanakana.toHiragana(reading)}</rt>
        <rp>)</rp>
      </ruby>
    );
  }
};

export class App extends Component {
  constructor() {
    super();
    this.state = {
      result:        '',
      dictionary:    null,
      haveTokenizer: TokenizerLoader.isLoaded(),
      useTokenizer:  false,
    };

    this.characterSelected = this.characterSelected.bind(this);
    this.closeDict         = this.closeDict.bind(this);
    this.toggleTokenizer   = this.toggleTokenizer.bind(this);
  }

  toggleTokenizer() {
    if (!this.state.useTokenizer) {
      this.setState({ useTokenizer: true });
      TokenizerLoader.load().then((tokenizer) => {
        this.tokenizer = tokenizer;
        this.setState({ haveTokenizer: true });
      });
    }
    else {
      this.setState({ useTokenizer: false });
    }
  }

  characterSelected(char) {
    this.setState((prev) => ({ result: prev.result + char }));
  }

  showDict(dictionary) {
    const dictionaryURL = dictionary.url(this.state.result);
    if (dictionary.inline) {
      this.setState({ dictionaryURL });
    }
    else {
      window.open(dictionaryURL);
    }
  }

  closeDict() {
    this.setState({ dictionaryURL: null });
  }

  fakeTokenize(result) {
    return [{ word_type: "UNKNOWN", surface_form: result }];
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
              {tokenized.map((token, i) => <Token key={i} {...token} />)}
            </div>
            <input className="result"
                   value={this.state.result}
                   onChange={(evt) => this.setState({ result: evt.target.value })}
                   placeholder="Result"/>
            <HeisigIME onInput={this.characterSelected}/>
          </div>
        </div>

        {this.state.dictionaryURL &&
         <div className="obscurePane" onClick={this.closeDict}>
           <div className="dictPane">
             <iframe width="100%"
                     height="100%"
                     className="dictFrame"
                     src={this.state.dictionaryURL}/>
           </div>
         </div>}
      </div>
    );
  }
}


