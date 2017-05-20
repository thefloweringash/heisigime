declare module "wanakana" {
  interface IWanakana {
    toHiragana(input: string): string;
    toKatakana(input: string): string;
    isKana(input: string): boolean;
  }

  const Wanakana: IWanakana;
  export default Wanakana;
}
