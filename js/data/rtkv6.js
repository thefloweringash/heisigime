import keywords from '../../json_data/keywords.json';

function reverseLookupMap() {
  let reverse = {};
  for (const [kanji, keyword] of RTKv6) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

export const RTKv6        = keywords;
export const RTKv6Inverse = reverseLookupMap(RTKv6);
