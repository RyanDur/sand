export const shallowFreeze = <T>(obj: T): T => Object.freeze(obj);

export const typeOf = (type: unknown): string => {
    if (Number.isNaN(type)) return 'NaN';
    if (type === null) return 'null';
    return typeof type;
};