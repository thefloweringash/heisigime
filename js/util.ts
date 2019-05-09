import Heap from "heap";

export function *scan(str: string, n: number) {
  if (str.length <= n) {
    yield str;
    return;
  }
  for (let i = 0; i <= str.length - n; i++) {
    yield str.substring(i, i + n);
  }
}

export function contains<T>(
  collection: Iterable<T>,
  element: T,
  equal: (x: T, y: T) => boolean = (x, y) => x === y,
): boolean {
  for (const cand of collection) {
    if (equal(element, cand)) {
      return true;
    }
  }
  return false;
}

export function takeHeap<T>(heap: Heap<T>, n: number): T[] {
  const result = [];
  for (let i = 0; i < n; i++) {
    const element = heap.pop();
    if (!element) {
      break;
    }
    result.push(element);
  }
  return result;
}

export function groupBy<T>(xs: Iterable<T>, keyfn: (t: T) => string) {
  const result: { [x: string]: T[] | undefined } = {};
  for (const x of xs) {
    const key  = keyfn(x);
    let target = result[key];
    if (!target) {
      target = (result[key] = []);
    }
    target.push(x);
  }
  return result;
}

export class LazyLoader<T> {
  private promise: Promise<T> | undefined;

  constructor(public startLoad: () => Promise<T>) {
    this.startLoad = startLoad;
  }

  public load(): Promise<T> {
    if (!this.promise) {
      this.promise = this.startLoad();
    }
    return this.promise;
  }
}
