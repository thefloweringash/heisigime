import * as Radicals from "./data/radicals";
import { LazyLoader } from "./util";

export type IRadicalData = typeof Radicals;

export const RadicalDataLoader = new LazyLoader<IRadicalData>(
  () => import("./data/radicals"));
