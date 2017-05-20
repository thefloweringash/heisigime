import { expect } from "chai";
import { scan } from "./util";

describe("scan", () => {
  it("always returns a window, even if the string is too short", () => {
    expect(Array.from(scan("12", 10))).to.eql(["12"]);
  });
  it("returns just the string on same sized window", () => {
    expect(Array.from(scan("12", 2))).to.eql(["12"]);
  });
  it("scans an array with a window", () => {
    expect(Array.from(scan("abcdefg", 2))).to.eql([
      "ab", "bc", "cd", "de", "ef", "fg",
    ]);
  });
});
