import { css, StyleSheet } from "aphrodite";
import React from "react";
import { IKanjiToRadical, IRadicalsByStroke, IRadicalToKanji } from "./data/radicals";

function refineKanji(radicalToKanji: IRadicalToKanji, radicalList: string[]): string[] {
  if (radicalList.length === 0) {
    return [];
  }

  const base = radicalToKanji[radicalList[0]] as string[];

  if (radicalList.length === 1) {
    return base;
  }
  else {
    const restrictors = radicalList.slice(1);
    return base.filter((kanji) =>
      restrictors.every((x) => (radicalToKanji[x] as string[]).indexOf(kanji) !== -1)
    );
  }
}

function refineRadicals(kanjiToRadical: IKanjiToRadical, kanji: string[]): string[] {
  return kanji.reduce((radicals: string[], kanji) => {
    const contents = kanjiToRadical[kanji];
    if (contents) {
      radicals.unshift(...contents);
    }
    return radicals;
  }, []);
}

interface StrokeBoxProps {
  selected: string[],
  strokes: string,
  contents: string[],
  onToggle: (radical: string) => void,
  possibleRadicals?: string[],
}

const StrokeBox = ({ selected, strokes, contents, onToggle, possibleRadicals }: StrokeBoxProps) =>
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

interface RadicalSearchProps {
  selected: string[],
  onToggle: (radical: string) => void,
  onComplete: (kanji: string) => void,
  radicalToKanji: IRadicalToKanji,
  kanjiToRadical: IKanjiToRadical,
  radicalsByStroke: IRadicalsByStroke,
}

export const RadicalSearch = ({
  selected, onToggle, onComplete,
  radicalToKanji, kanjiToRadical, radicalsByStroke
}: RadicalSearchProps) => {
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
              contents={radicalsByStroke[strokes] as string[]}
              selected={selected}
              onToggle={onToggle}
              possibleRadicals={selected.length !== 0 ? possibleRadicals : undefined}
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
