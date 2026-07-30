import {caseOf} from '../../..';
import {Maybe} from '../../types';

type Delta =
  | {domain: 'stories'; stories: number[]}
  | {domain: 'removed'; id: number};

test('each arm receives the member already narrowed — no casts at the call site', () => {
  const fold = (delta: Delta): number =>
    caseOf('domain')<Delta, number>(delta, {
      stories: (member) => {
        expectTypeOf(member).toEqualTypeOf<{domain: 'stories'; stories: number[]}>();
        return member.stories.length;
      },
      removed: (member) => {
        expectTypeOf(member).toEqualTypeOf<{domain: 'removed'; id: number}>();
        return member.id;
      }
    }).orElse(0);
  expectTypeOf(fold).toEqualTypeOf<(delta: Delta) => number>();
});

test('arms are partial by design and the miss rides a Maybe', () => {
  const partial = (delta: Delta): Maybe<number> =>
    caseOf('domain')<Delta, number>(delta, {stories: (member) => member.stories.length});
  expectTypeOf(partial).returns.toEqualTypeOf<Maybe<number>>();
});

test('caseOf.all demands every case and drops the Maybe — growth in the union breaks every total site', () => {
  const total = (delta: Delta): number =>
    caseOf.all('domain')<Delta, number>(delta, {
      stories: (member) => member.stories.length,
      removed: (member) => member.id
    });
  expectTypeOf(total).toEqualTypeOf<(delta: Delta) => number>();

  // @ts-expect-error -- a missing arm is a compile error in a total analysis
  caseOf.all('domain')<Delta, number>({domain: 'removed', id: 1}, {
    stories: (member) => member.stories.length
  });
});
