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
