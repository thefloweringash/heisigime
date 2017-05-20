/* tslint:disable */

declare namespace JSX {
  interface IntrinsicElements {
    rb: any;
  }
}

declare module "*.css" {
  interface CSS {
    _insertCss(): void;
  }
  const contents: CSS;
  export default contents;
}

declare module "*.less" {
  interface CSS {
    _insertCss(): void;
  }
  const contents: CSS;
  export default contents;
}
