import { contains, scan } from "./util";

interface IFilterTree<T> {
  current: [T, string][];
  children?: { [letter: string]: IFilterTree<T> };
}

export class WordListFilter<T> {
  public readonly completions: IFilterTree<T>; // public for test

  constructor(words: [T, string][], private prefixSize: number) {
    this.completions = { current: words };

    this.prefixSize = prefixSize;

    for (const entry of words) {
      for (const idx of scan(entry[1].toLowerCase(), prefixSize)) {
        this.addCompletion(idx, entry);
      }
    }
  }

  public fetch(query: string): [T, string][] | undefined {
    const map = this.mapForQuery(query);
    return map && map.current;
  }

  private addCompletion(index: string, value: [T, string]) {
    let branch = this.completions;
    for (const step of index) {
      let nextbranch = branch.children && branch.children[step];

      if (!nextbranch) {
        let children = branch.children;
        if (!children) {
          children = branch.children = {};
        }
        nextbranch = children[step] = { current: [] };
      }

      branch = nextbranch;

      if (!contains(branch.current, value)) {
        branch.current.push(value);
      }
    }
  }

  private mapForQuery(query: string): IFilterTree<T> | undefined {
    let branch = this.completions;
    for (const step of query.substr(0, this.prefixSize)) {
      if (branch.children && branch.children[step]) {
        branch = branch.children[step];
      }
      else {
        return;
      }
    }
    return branch;
  }

}
