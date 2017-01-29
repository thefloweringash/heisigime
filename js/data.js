import kradfile from '../json_data/kradfile.json';
import keywords from '../json_data/keywords.json';

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

function makeRadicalsByStroke(radicals) {
  const result = {};
  for (const radical of Object.keys(radicals)) {
    const strokes = radicals[radical];
    let target    = result[strokes];
    if (!target) {
      target = (result[strokes] = []);
    }
    target.push(radical);
  }
  return result;
}

export const RTKv6        = keywords;
export const RTKv6Inverse = reverseLookupMap(RTKv6);

export const kanjiToRadical = kradfile;
export const radicalToKanji = makeRadicalToKanji(kanjiToRadical);

export const radicals         = Object.keys(radicalToKanji);
export const radicalsByStroke = {'?': radicals};
