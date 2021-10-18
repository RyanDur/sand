export type Predicate<SUBJECT> = (subject: SUBJECT) => boolean;
export type Supplier<SUPPLY> = () => SUPPLY;
export type Consumer<CONSUMABLE> = (consumable: CONSUMABLE) => void;