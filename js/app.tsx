import * as Kuromoji from "kuromoji";
import { IpadicFeatures, Tokenizer } from "kuromoji";
import normalize from "normalize.css/normalize.css";
import React, { Component } from "react";
import Wanakana from "wanakana";
import stylesheet from "../css/app.less";
import { IKanjiToRadical } from "./data/radicals";
import { RTKv6Inverse } from "./data/rtkv6";
import { HeisigIME } from "./heisigime";
import { RadicalSearch } from "./radicalsearch";
import { ShowKeyword } from "./showkeyword";
import * as Radicals from './data/radicals';

type IRadicalData = typeof Radicals;

export const css = [normalize, stylesheet];
if (typeof window !== 'undefined') {
  for (const c of css) {
    c._insertCss();
  }
}

interface Dictionary {
  label: string,
  inline: boolean,
  url: (query: string) => string,
}

const Dictionaries: Dictionary[] = [
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

class LazyLoader<T> {
  promise: Promise<T>;

  constructor(public startLoad: () => Promise<T>) {
    this.startLoad = startLoad;
  }

  load(): Promise<T> {
    if (!this.promise) {
      this.promise = this.startLoad();
    }
    return this.promise;
  }
}

const TokenizerLoader = new LazyLoader<Tokenizer<IpadicFeatures>>(() =>
  new Promise<Tokenizer<IpadicFeatures>>((ok, fail) => {
    Kuromoji.builder({ dicPath: "/dict/" }).build(
      (err: Error, tokenizer: Tokenizer<IpadicFeatures>) => {
        if (err) {
          fail(err);
        } else {
          ok(tokenizer);
        }
      }
    );
  })
);

const RadicalDataLoader = new LazyLoader<IRadicalData>(
  () => System.import('./data/radicals'));

const posClasses: { [pos: string]: string } = {
  助詞:  'particle',
  形容詞: 'adjective',
  名詞:  'noun',
  動詞:  'verb',
  副詞:  'adverb',
  助動詞: 'auxiliary-verb',
  記号:  'symbol',
  接頭詞: 'prefix',
};

interface TokenProps extends IpadicFeatures {
  kanjiToRadical: IKanjiToRadical,
  onKanjiClicked: (kanji: string) => void,
}

const Token = ({ surface_form, reading, pos, kanjiToRadical, onKanjiClicked }: TokenProps) => {
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

interface AppProps {
}

interface AppState {
  tokenizer: Tokenizer<IpadicFeatures>;
  result: string;
  selectedRadicals: Array<string>;
  radicalData: IRadicalData;
  showRadicalUI: boolean;
  dictionaryURL?: string;
  dictionary: string;
}

export class App extends Component<AppProps, AppState> {
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

  characterSelected(char: string) {
    this.setState((prev) => ({ result: prev.result + char }));
  }

  showDict(dictionary: Dictionary) {
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

  fakeTokenize(result: string): IpadicFeatures[] {
    return [{
      word_type:       "UNKNOWN",
      surface_form:    result,
      word_id:         -1,
      word_position:   -1,
      pos:             '',
      pos_detail_1:    '',
      pos_detail_2:    '',
      pos_detail_3:    '',
      conjugated_type: '',
      conjugated_form: '',
      basic_form:      '',
    }];
  }

  toggleRadical(radical: string) {
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

  refineRadicals(kanji: string) {
    const { kanjiToRadical } = this.state.radicalData;
    const selectedRadicals   = this.state.selectedRadicals.slice();
    selectedRadicals.unshift(...kanjiToRadical[kanji]);
    this.setState({ selectedRadicals });
  }

  render() {
    const { tokenizer, result }       = this.state;
    const tokenized: IpadicFeatures[] = tokenizer ?
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
                  kanjiToRadical={this.state.radicalData && this.state.radicalData.kanjiToRadical}
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
