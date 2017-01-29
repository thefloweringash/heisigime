import React, { Component } from 'react';
import { kanjiToRadical } from './data';

function splitPhrase(dictionary, phrase) {
  const result = [];
  let partial  = null;
  for (const x of phrase) {
    if (dictionary[x] || kanjiToRadical.hasOwnProperty(x)) {
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

export const ShowKeyword = ({ phrase, dictionary, onKanjiClicked }) => {
  const split = splitPhrase(dictionary, phrase);
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
                  <rb onClick={() => onKanjiClicked(character)}>{character}</rb>
                  <rp>(</rp>
                  <rt>{keyword}</rt>
                  <rp>)</rp>
                </ruby>
              );
            }
            else if (kanjiToRadical.hasOwnProperty(character)) {
              return (
                <span
                  key={i}
                  onClick={() => onKanjiClicked(character)}
                >
                  {character}
                </span>
              );
            }
          }
          else {
            return <span key={i} className="boring">{w}</span>;
          }
        })
      }
      </span>
  );
};
