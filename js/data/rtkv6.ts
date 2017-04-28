import keywords from "../../json_data/keywords.json";

export type KanjiDetails = Array<[string, string]>;
export type KanjiLookup = { [k: string]: string | undefined };

function reverseLookupMap(details: KanjiDetails): KanjiLookup {
  let reverse: KanjiLookup = {};
  for (const [kanji, keyword] of details) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

export const RTKv6: KanjiDetails       = <KanjiDetails>keywords;
export const RTKv6Inverse: KanjiLookup = reverseLookupMap(RTKv6);
