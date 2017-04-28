import kradfile from "../../json_data/kradfile.json";
import radicals_ from "../../json_data/radicals.json";
import { groupBy } from "../util";

export interface IKanjiToRadical {
  [kanj: string]: string[] | undefined
}

export interface IRadicalToKanji {
  [radical: string]: string[] | undefined
}

export interface IRadicalsByStroke {
  [strokeCount: string]: string[] | undefined
}

function makeRadicalToKanji(krad: IKanjiToRadical): IRadicalToKanji {
  const result: IRadicalToKanji = {};
  for (const kanji of Object.keys(krad)) {
    for (const radical of krad[kanji]) {
      let target = result[radical];
      if (!target) {
        target = (result[radical] = []);
      }
      target.push(kanji);
    }
  }
  return result;
}

export const kanjiToRadical: IKanjiToRadical = <IKanjiToRadical>kradfile;
export const radicalToKanji: IRadicalToKanji = makeRadicalToKanji(kanjiToRadical);

// Use the decomposition radicals so our UI always has all used radicals.
const radicals: string[] = Object.keys(radicalToKanji);

type strokeCounts = { [radical: string]: string | undefined };

// But categorise them by radical information from radkfile-u-jis208.txt
export const radicalsByStroke: IRadicalsByStroke =
               groupBy(radicals, (radical) => (<strokeCounts>radicals_)[radical] || '?');
