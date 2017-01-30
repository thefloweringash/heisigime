export function *scan(str, n) {
  if (str.length <= n) {
    yield str;
    return;
  }
  for (let i = 0; i <= str.length - n; i++) {
    yield str.substring(i, i + n);
  }
}

export function contains(collection, element, equal) {
  for (const cand of collection) {
    if (equal(element, cand)) {
      return true;
    }
  }
  return false;
}

export function takeHeap(heap, n) {
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

export function groupBy(xs, keyfn) {
  const result = {};
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
