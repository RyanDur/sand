export type Mapping<A, B> = (a: A) => B
export type Consumer<A> = Mapping<A, void>
export * from './Result';
export * from './Maybe';