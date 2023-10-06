declare module "wanakana" {
  export const toHiragana: (input: string) => string;
  export const toKatakana: (input: string) => string;
  export const toRomaji: (input: string) => string;
  export const isKana: (input: string) => boolean;
}
