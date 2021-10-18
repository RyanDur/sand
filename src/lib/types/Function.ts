export type Predicate<QUESTION> = (question: QUESTION) => boolean;
export type Supplier<SUPPLY> = () => SUPPLY;
export type Consumer<CONSUME> = (consume: CONSUME) => void;