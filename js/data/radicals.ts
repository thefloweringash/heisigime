import kradfile from "../../json_data/kradfile.json"; // tslint:disable-line
import radicals_ from "../../json_data/radicals.json"; // tslint:disable-line
import { groupBy } from "../util";

export interface IKanjiToRadical {
  [kanj: string]: string[] | undefined;
}

export interface IRadicalToKanji {
  [radical: string]: string[] | undefined;
}

export interface IRadicalsByStroke {
  [strokeCount: string]: string[] | undefined;
}

function makeRadicalToKanji(krad: IKanjiToRadical): IRadicalToKanji {
  const result: IRadicalToKanji = {};
  for (const kanji of Object.keys(krad)) {
    for (const radical of krad[kanji] as string[]) {
      let target = result[radical];
      if (!target) {
        target = (result[radical] = []);
      }
      target.push(kanji);
    }
  }
  return result;
}

export const kanjiToRadical: IKanjiToRadical = kradfile as IKanjiToRadical;
export const radicalToKanji: IRadicalToKanji = makeRadicalToKanji(kanjiToRadical);

// Use the decomposition radicals so our UI always has all used radicals.
const radicals: string[] = Object.keys(radicalToKanji);

interface IStrokeCounts {
  [radical: string]: string | undefined;
}

// But categorise them by radical information from radkfile-u-jis208.txt
export const radicalsByStroke: IRadicalsByStroke =
               groupBy(radicals, (radical) => (radicals_ as IStrokeCounts)[radical] || "?");
