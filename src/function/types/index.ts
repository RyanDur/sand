export type Func<T, NewT> = (value: T) => NewT;
export type Predicate<QUESTION> = Func<QUESTION, boolean>;
export type Supplier<SUPPLY> = Func<void, SUPPLY>
export type Consumer<CONSUME> = Func<CONSUME, void>
export type MapFunc = <T, NewT>(func: Func<T, NewT>) => Func<T[], NewT[]>;
export type ReducerFunc<T, NewT> = (acc: NewT, value: T) => NewT;
export type Head = {
    (a: string): string;
    <T>(a: T[]): T;
}

export type Tail = {
    (a: string): string;
    <T>(a: T[]): T[];
}