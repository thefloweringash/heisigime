import React from "react";
import { IKanjiToRadical } from "./data/radicals";

interface IDictionary {
  [k: string]: any;
}

function splitPhrase(dictionary: IDictionary, kanjiToRadical: IKanjiToRadical | undefined, phrase: string) {
  const result = [];
  let partial  = null;
  for (const x of phrase) {
    if (dictionary[x] || (kanjiToRadical && kanjiToRadical.hasOwnProperty(x))) {
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

interface IShowKeywordProps {
  phrase: string;
  dictionary: IDictionary;
  kanjiToRadical?: IKanjiToRadical;
  onKanjiClicked?: (kanji: string) => void;
}

export const ShowKeyword = ({ phrase, dictionary, kanjiToRadical, onKanjiClicked }: IShowKeywordProps) => {
  const split = splitPhrase(dictionary, kanjiToRadical, phrase);
  return (
    <span>
      {
        split.map((w, i) => {
          if (w.length === 1) {
            const character = w[0];
            const keyword   = dictionary[character];
            if (keyword) {
              return (
                <ruby key={i}>
                  <rb onClick={onKanjiClicked && (() => onKanjiClicked(character))}>{character}</rb>
                  <rp>(</rp>
                  <rt>{keyword}</rt>
                  <rp>)</rp>
                </ruby>
              );
            }
            else if (kanjiToRadical && kanjiToRadical.hasOwnProperty(character)) {
              return (
                <span
                  key={i}
                  onClick={onKanjiClicked && (() => onKanjiClicked(character))}
                >
                  {character}
                </span>
              );
            }
          }

          // fallthrough
          return <span key={i} className="boring">{w}</span>;
        })
      }
      </span>
  );
};
