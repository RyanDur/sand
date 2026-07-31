export {success, failure} from './lib/result';
export {asyncResult, asyncSuccess, asyncFailure} from './lib/asyncResult';
export {maybe, some, nothing} from './lib/maybe';
export {tryCatch, asyncTryCatch} from './lib/tryCatch';
export {requesting} from './lib/requesting';
export {connecting} from './lib/connecting';
export {foldAll, foldSome} from './lib/kernel';
export {lawsOf} from './lib/laws';
export type {Catamorphism, Functor, Monad} from './lib/kernel';
export {
  not,
  is,
  empty,
  notEmpty,
  has,
  matchOn,
  toError
} from './lib/util';

export * from './lib/types';
