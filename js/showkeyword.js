import React, { Component } from 'react';

function splitPhrase(dictionary, phrase) {
  const result = [];
  let partial  = null;
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

export const ShowKeyword = ({ phrase, dictionary, onKanjiClicked }) => {
  const split = splitPhrase(dictionary, phrase);
  return (
    <span>
      {
        split.map((w, i) => {
          const keyword = dictionary[w[0]];
          if (keyword) {
            return (
              <ruby key={i}>
                <rb onClick={() => onKanjiClicked(w)}>{w}</rb>
                <rp>(</rp>
                <rt>{keyword}</rt>
                <rp>)</rp>
              </ruby>
            );
          }
          else {
            return <span key={i} className="boring">{w}</span>
          }
        })
      }
      </span>
  );
};
