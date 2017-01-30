import kradfile from '../json_data/kradfile.json';
import keywords from '../json_data/keywords.json';
import radicals_ from '../json_data/radicals.json';
import { groupBy } from './util';

function reverseLookupMap() {
  let reverse = {};
  for (const [kanji, keyword] of RTKv6) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

function makeRadicalToKanji(krad) {
  const result = {};
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

export const RTKv6        = keywords;
export const RTKv6Inverse = reverseLookupMap(RTKv6);

export const kanjiToRadical = kradfile;
export const radicalToKanji = makeRadicalToKanji(kanjiToRadical);

// Use the decomposition radicals so our UI always has all used radicals.
export const radicals         = Object.keys(radicalToKanji);

// But categorise them by radical information from radkfile-u-jis208.txt
export const radicalsByStroke = groupBy(radicals, (radical) => radicals_[radical] || '?');
