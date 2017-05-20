import keywords from "../../json_data/keywords.json"; // tslint:disable-line

export type IKanjiDetails = Array<[string, string]>;
export interface IKanjiLookup {
  [k: string]: string | undefined;
}

function reverseLookupMap(details: IKanjiDetails): IKanjiLookup {
  const reverse: IKanjiLookup = {};
  for (const [kanji, keyword] of details) {
    reverse[kanji] = keyword;
  }
  return reverse;
}

export const RTKv6: IKanjiDetails       = keywords as IKanjiDetails;
export const RTKv6Inverse: IKanjiLookup = reverseLookupMap(RTKv6);
