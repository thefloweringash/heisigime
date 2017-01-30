import { scan, contains } from './util';

const current = Symbol('current');

export class WordListFilter {
  constructor(words, prefix_size) {
    this.completions = { [current]: words };
    this.prefix_size = prefix_size;

    for (const entry of words) {
      for (const idx of scan(entry[1].toLowerCase(), prefix_size)) {
        this.addCompletion(idx, entry);
      }
    }
  }

  addCompletion(index, value) {
    let map = this.completions;
    for (const step of index) {
      if (!map[step]) {
        map[step] = {};
      }
      map = map[step];

      if (!map[current]) {
        map[current] = [];
      }
      if (!contains(map[current], value, ([k1], [k2]) => k1 === k2)) {
        map[current].push(value);
      }
    }
  }

  mapForQuery(query) {
    let map = this.completions;
    for (const step of query.substr(0, this.prefix_size)) {
      if (map[step]) {
        map = map[step];
      }
      else {
        return;
      }
    }
    return map;
  }

  fetch(query) {
    const map = this.mapForQuery(query);
    return map && map[current];
  }
}
