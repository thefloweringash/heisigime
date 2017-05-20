import { expect } from "chai";
import { WordListFilter } from "./wordlistfilter";

describe("wordlistfilter", () => {
  it("makes a coherent filter tree", () => {
    const w1: [string, string] = ["word1", "abcd"];
    const w2: [string, string] = ["word2", "abce"];
    expect(
      new WordListFilter<string>([w1, w2], 2).completions,
    ).to.eql(
      {
        current:  [w1, w2],
        children: {
          a: {
            current:  [w1, w2],
            children: {
              b: {
                current: [w1, w2],
              },
            },
          },
          b: {
            current:  [w1, w2],
            children: {
              c: {
                current: [w1, w2],
              },
            },
          },
          c: {
            current:  [w1, w2],
            children: {
              d: {
                current: [w1],
              },
              e: {
                current: [w2],
              },
            },
          },
        },
      },
    );
  });
});
