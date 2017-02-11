import React from 'react';
import { StyleSheet, css } from 'aphrodite';

function refineKanji(radicalToKanji, radicalList) {
  if (radicalList.length === 0) {
    return [];
  }
  else if (radicalList.length === 1) {
    return radicalToKanji[radicalList[0]];
  }
  else {
    const restrictors = radicalList.slice(1);
    return radicalToKanji[radicalList[0]].filter((kanji) =>
      restrictors.every((x) => radicalToKanji[x].indexOf(kanji) !== -1)
    );
  }
}

function refineRadicals(kanjiToRadical, kanji) {
  return kanji.reduce((radicals, kanji) => {
    radicals.unshift(...kanjiToRadical[kanji]);
    return radicals;
  }, []);
}

const StrokeBox = ({ selected, strokes, contents, onToggle, possibleRadicals }) =>
  <span>
    <div className={css(styles.strokeDivider)}>{strokes}</div>
    {contents.map((radical) => (
      <div
        key={radical}
        className={css(
          styles.radical,
          selected && selected.indexOf(radical) !== -1 && styles.selected,
          possibleRadicals && possibleRadicals.indexOf(radical) === -1 && styles.diminished,
        )}
        onClick={() => onToggle(radical)}
      >
        {radical}
      </div>
    ))}
  </span>;

export const RadicalSearch = ({
  selected, onToggle, onComplete,
  radicalToKanji, kanjiToRadical, radicalsByStroke
}) => {
  const kanjiCandidates  = refineKanji(radicalToKanji, selected);
  const possibleRadicals = refineRadicals(kanjiToRadical, kanjiCandidates);
  return (
    <div>
      <div>
        {
          Object.keys(radicalsByStroke).map((strokes) => (
            <StrokeBox
              key={`strokes${strokes}`}
              strokes={strokes}
              contents={radicalsByStroke[strokes]}
              selected={selected}
              onToggle={onToggle}
              possibleRadicals={selected.length !== 0 && possibleRadicals}
            />
          ))
        }
      </div>
      <div>
        {
          kanjiCandidates.map((kanji) =>
            <div
              key={kanji}
              className={css(styles.candidate)}
              onClick={() => onComplete(kanji)}
            >
              {kanji}
            </div>
          )
        }
      </div>
    </div>
  )
};

const styles = StyleSheet.create({
  radical:       {
    display: 'inline-block',
    border:  '2px solid transparent',
  },
  diminished:    {
    color: '#aaa',
  },
  selected:      {
    border: '2px solid green',
  },
  strokeDivider: {
    background: '#0080c0',
    padding:    '0.3em 0.5em',
    display:    'inline-block',
    textAlign:  'center',
  },
  candidate:     {
    display: 'inline-block',
  }
});
