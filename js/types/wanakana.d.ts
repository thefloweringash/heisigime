declare module "wanakana" {
  interface Wanakana {
    toHiragana(input: string): string;
    toKatakana(input: string): string;
    isKana(input: string): boolean;
  }

  const module : Wanakana;
  export = module;
}
