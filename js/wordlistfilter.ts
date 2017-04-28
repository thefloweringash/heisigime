import { contains, scan } from "./util";

const current = Symbol('current');

interface FilterTree<T> {
  current: Array<[T, string]>,
  children?: { [letter: string]: FilterTree<T> }
}

export class WordListFilter<T> {
  completions: FilterTree<T>;

  constructor(words: Array<[T, string]>, public prefix_size: number) {
    this.completions = { current: words };

    this.prefix_size = prefix_size;

    for (const entry of words) {
      for (const idx of scan(entry[1].toLowerCase(), prefix_size)) {
        this.addCompletion(idx, entry);
      }
    }
  }

  addCompletion(index: string, value: [T, string]) {
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

  mapForQuery(query: string): FilterTree<T> {
    let branch = this.completions;
    for (const step of query.substr(0, this.prefix_size)) {
      if (branch.children[step]) {
        branch = branch.children[step];
      }
      else {
        return;
      }
    }
    return branch;
  }

  fetch(query: string): Array<[T, string]> | undefined {
    const map = this.mapForQuery(query);
    return map && map.current;
  }
}
