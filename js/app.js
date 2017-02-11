import React, { Component } from 'react';
import Kuromoji from 'kuromoji';
import Wanakana from 'wanakana';
import { HeisigIME } from './heisigime';
import { RadicalSearch } from './radicalsearch';
import { RTKv6Inverse } from './data/rtkv6';
import { ShowKeyword } from './showkeyword';
import normalize from 'normalize.css/normalize.css';
import stylesheet from '../css/app.less';

export const css = [normalize, stylesheet];
if (typeof window !== 'undefined') {
  for (const c of css) {
    c._insertCss();
  }
}

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

class LazyLoader {
  constructor(startLoad) {
    this.startLoad = startLoad;
  }

  load() {
    if (!this.promise) {
      this.promise = this.startLoad();
    }
    return this.promise;
  }
}

const TokenizerLoader = new LazyLoader(() =>
  new Promise((ok, fail) => {
    Kuromoji.builder({ dicPath: "/dict/" }).build(
      (err, tokenizer) => {
        if (err) {
          fail(err);
        } else {
          ok(tokenizer);
        }
      }
    );
  })
);

const RadicalDataLoader = new LazyLoader(() =>
  require.ensure([], (require) => require('./data/radicals.js'), 'radicals'));

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

const Token = ({ surface_form, reading, pos, kanjiToRadical, onKanjiClicked }) => {
  const posClass = posClasses[pos] || '';
  if (surface_form === reading || Wanakana.isKana(surface_form)) {
    return <span className={`token ${posClass}`}>{surface_form}</span>;
  }
  else {
    return (
      <ruby className={`token ${posClass}`}>
        <rb>
          <ShowKeyword
            dictionary={RTKv6Inverse}
            kanjiToRadical={kanjiToRadical}
            phrase={surface_form}
            onKanjiClicked={onKanjiClicked}
          />
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
      result:           '',
      dictionary:       null,
      tokenizer:        null,
      radicalData:      null,
      selectedRadicals: [],
      showRadicalUI:    false,
    };

    this.characterSelected = this.characterSelected.bind(this);

    this.closeDict       = this.closeDict.bind(this);
    this.toggleTokenizer = this.toggleTokenizer.bind(this);
    this.toggleRadicalUI = this.toggleRadicalUI.bind(this);

    this.toggleRadical  = this.toggleRadical.bind(this);
    this.refineRadicals = this.refineRadicals.bind(this);
    this.clearRadicals  = this.clearRadicals.bind(this);
  }

  toggleTokenizer() {
    if (this.state.tokenizer) {
      this.setState({ tokenizer: null });
    } else {
      TokenizerLoader.load().then((tokenizer) => {
        this.setState({ tokenizer });
      });
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

  toggleRadical(radical) {
    const selectedRadicals = this.state.selectedRadicals.slice();
    let index              = selectedRadicals.indexOf(radical);
    if (index === -1) {
      selectedRadicals.push(radical);
    }
    else {
      selectedRadicals.splice(index, 1);
    }
    this.setState({ selectedRadicals });
  }

  toggleRadicalUI() {
    const showRadicalUI = !this.state.showRadicalUI;
    this.setState({ showRadicalUI });
    if (showRadicalUI) {
      RadicalDataLoader.load().then((radicalData) => {
        this.setState({ radicalData });
      })
    }
  }

  clearRadicals() {
    this.setState({ selectedRadicals: [] });
  }

  refineRadicals(kanji) {
    const { kanjiToRadical } = this.state.radicalData;
    const selectedRadicals   = this.state.selectedRadicals.slice();
    selectedRadicals.unshift(...kanjiToRadical[kanji]);
    this.setState({ selectedRadicals });
  }

  render() {
    const { tokenizer, result } = this.state;
    const tokenized             = tokenizer ?
      tokenizer.tokenize(result) :
      this.fakeTokenize(result);
    return (
      <div className="app">
        <div className="imePane">
          <div className="outButtons">
            {Dictionaries.map((dict) =>
              <button key={dict.label} onClick={() => this.showDict(dict)}>{dict.label}</button>)}
            <button key="kuromoji" onClick={this.toggleTokenizer}>Kuromoji</button>
            <button key="radicals" onClick={this.toggleRadicalUI}>Radicals</button>
          </div>

          <div className="inputs">
            <div className="reverse">
              {tokenized.map((token, i) => (
                <Token
                  key={i}
                  {...token}
                  onKanjiClicked={this.state.radicalData && this.refineRadicals}
                />
              ))}
            </div>
            <input
              className="result"
              value={this.state.result}
              onChange={(evt) => this.setState({ result: evt.target.value })}
              placeholder="Result"
            />
            <HeisigIME
              onInput={this.characterSelected}
            />
            {this.state.showRadicalUI && this.state.radicalData && (
              <div>
                <button
                  onClick={this.clearRadicals}
                >
                  Reset
                </button>
                <RadicalSearch
                  onToggle={this.toggleRadical}
                  selected={this.state.selectedRadicals}
                  onComplete={this.characterSelected}
                  {...this.state.radicalData}
                />
              </div>
            )}
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
