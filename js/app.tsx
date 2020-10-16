import * as Kuromoji from "kuromoji";
import { IpadicFeatures, Tokenizer } from "kuromoji";
import React, { FunctionComponent, useState } from "react";
import * as Wanakana from "wanakana";
import { IKanjiToRadical } from "./data/radicals";
import { RTKv6Inverse } from "./data/rtkv6";
import { HeisigIME } from "./heisigime";
import { IRadicalData, RadicalDataLoader } from "./radicals";
import { RadicalSearch } from "./radicalsearch";
import { ShowKeyword } from "./showkeyword";
import { LazyLoader } from "./util";

interface IDictionary {
  label: string;
  url: (query: string) => string;
}

// These operate on a word or phrase, and will typically receive the entire
// input.
const Dictionaries: IDictionary[] = [
  {
    label: "Jisho",
    url(query) {
      return `http://jisho.org/search/${query}`;
    },
  },
  {
    label: "Google",
    url(query) {
      return `https://google.com/search?q=${query}`;
    },
  },
  {
    label: "Translate",
    url(query) {
      return `https://translate.google.com/#ja/en/${query}`;
    },
  },
];

// These operate on a single character only
const enum KanjiDictionaryName {
  Hochanh = 'hochanh',
  Koohii = 'koohii',
};

const KanjiDictionaries: { [name in KanjiDictionaryName]: IDictionary } = {
  [KanjiDictionaryName.Hochanh]: {
    label: "Hochanh",
    url(kanji) {
      return `https://hochanh.github.io/rtk/${kanji}/index.html`;
    },
  },
  [KanjiDictionaryName.Koohii]: {
    label: 'Koohii',
    url(kanji) {
      return `https://kanji.koohii.com/study/kanji/${kanji}`;
    },
  },
};

const TokenizerLoader = new LazyLoader<Tokenizer<IpadicFeatures>>(() =>
  new Promise<Tokenizer<IpadicFeatures>>((ok, fail) => {
    Kuromoji.builder({ dicPath: "/" }).build(
      (err: Error, tokenizer: Tokenizer<IpadicFeatures>) => {
        if (err) {
          fail(err);
        }
        else {
          ok(tokenizer);
        }
      },
    );
  }),
);

const posClasses: { [pos: string]: string } = {
  助詞:  "particle",
  形容詞: "adjective",
  名詞:  "noun",
  動詞:  "verb",
  副詞:  "adverb",
  助動詞: "auxiliary-verb",
  記号:  "symbol",
  接頭詞: "prefix",
};

interface ITokenProps extends IpadicFeatures {
  kanjiToRadical?: IKanjiToRadical;
  onKanjiClicked?: (kanji: string) => void;
}

const Token = ({ surface_form, reading, pos, kanjiToRadical, onKanjiClicked }: ITokenProps) => {
  const posClass = posClasses[pos] || "";
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

const FakeTokenizer = {
  tokenize(result: string): IpadicFeatures[] {
    const tokens: IpadicFeatures[] = [];
    for (const x of result) {
      tokens.push({
        word_type:       "UNKNOWN",
        surface_form:    x,
        word_id:         -1,
        word_position:   -1,
        pos:             "",
        pos_detail_1:    "",
        pos_detail_2:    "",
        pos_detail_3:    "",
        conjugated_type: "",
        conjugated_form: "",
        basic_form:      "",
      });
    }
    return tokens;
  },
};

const toggleRadical = (selectedRadicals: string[], radical: string): string[] => {
  const index               = selectedRadicals.indexOf(radical);
  const newSelectedRadicals = selectedRadicals.slice();

  if (index === -1) {
    newSelectedRadicals.push(radical);
  }
  else {
    newSelectedRadicals.splice(index, 1);
  }
  return newSelectedRadicals;
};

const addRadicals = (selectedRadicals: string[], newRadicals: string[]): string[] => {
  const newSelectedRadicals = selectedRadicals.slice();
  for (const newRadical of newRadicals) {
    if (newSelectedRadicals.indexOf(newRadical) === -1) {
      newSelectedRadicals.push(newRadical);
    }
  }
  return newSelectedRadicals;
};

export const App: FunctionComponent = () => {
  const [result, setResult]               = useState("");
  const [tokenizer, setTokenizer]         = useState<Tokenizer<IpadicFeatures> | null>(null);
  const [radicals, setRadicals]           = useState<string[]>([]);
  const [showRadicalUI, setShowRadicalUI] = useState(false);
  const [radicalData, setRadicalData]     = useState<IRadicalData | null>(null);

  const characterSelected = (character: string) => {
    setResult(result + character);
  };

  const toggleTokenizer = async () => {
    if (tokenizer) {
      setTokenizer(null);
    }
    else {
      setTokenizer(await TokenizerLoader.load());
    }
  };

  const toggleRadicalUI = async () => {
    const shouldShow = !showRadicalUI;
    setShowRadicalUI(shouldShow);
    if (shouldShow && !radicalData) {
      setRadicalData(await RadicalDataLoader.load());
    }
  };

  const showDict = (dictionary: IDictionary) => {
    window.open(dictionary.url(result), '_blank');
  };

  const [kanjiDictionaryName, setKanjiDictionaryName] = useState(KanjiDictionaryName.Hochanh);
  const openKanjiDictionary = (kanji: string) => {
    const dictionary = KanjiDictionaries[kanjiDictionaryName];
    window.open(dictionary.url(kanji), '_blank');
  };

  const rotateKanjiDictionary = () => {
    const options = Object.keys(KanjiDictionaries) as KanjiDictionaryName[];
    const currentIndex = options.indexOf(kanjiDictionaryName);
    const next = options[(currentIndex + 1) % options.length];
    setKanjiDictionaryName(next);
  };

  const addRadicalsFromKanji = (kanji: string) => {
    if (radicalData) {
      const { kanjiToRadical } = radicalData;
      setRadicals(addRadicals(radicals, kanjiToRadical[kanji] || []));
    }
  };

  const tokenized: IpadicFeatures[] = (tokenizer ?? FakeTokenizer).tokenize(result);

  return (
    <div className="app">
      <div className="imePane">
        <div className="outButtons">
          {Dictionaries.map((dict) =>
            <button key={dict.label} onClick={() => showDict(dict)}>{dict.label}</button>)}
          <button key="kuromoji" onClick={toggleTokenizer}>Kuromoji</button>
          <button key="radicals" onClick={toggleRadicalUI}>Radicals</button>
          <button key="kanji_dictionary" onClick={rotateKanjiDictionary}>{KanjiDictionaries[kanjiDictionaryName].label}</button>
        </div>

        <div className="inputs">
          <div className="reverse">
            {tokenized.map((token, i) => (
              <Token
                key={i}
                {...token}
                onKanjiClicked={showRadicalUI ? addRadicalsFromKanji : openKanjiDictionary}
                kanjiToRadical={radicalData ? radicalData.kanjiToRadical : undefined}
              />
            ))}
          </div>
          <input
            className="result"
            value={result}
            onChange={(evt) => setResult(evt.target.value)}
            placeholder="Result"
          />
          <HeisigIME
            onInput={characterSelected}
            autoFocus
          />
          {showRadicalUI && radicalData && (
            <div>
              <button
                onClick={() => setRadicals([])}
              >
                Reset
              </button>
              <RadicalSearch
                onToggle={(r) => setRadicals(toggleRadical(radicals, r))}
                selected={radicals}
                onComplete={characterSelected}
                radicalData={radicalData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
