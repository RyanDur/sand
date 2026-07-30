import {caseOf} from '../../..';

type Shape =
  | {kind: 'circle'; radius: number}
  | {kind: 'square'; side: number}
  | {kind: 'line'; length: number};

const area = caseOf('kind');

describe('caseOf — the case analysis of a sum type', () => {
  test('the matching arm receives the member and produces the value', () => {
    expect(area<Shape, number>({kind: 'circle', radius: 2}, {
      circle: ({radius}) => Math.PI * radius * radius,
      square: ({side}) => side * side
    }).orElse(0)).toBeCloseTo(Math.PI * 4);

    expect(area<Shape, number>({kind: 'square', side: 3}, {
      circle: ({radius}) => Math.PI * radius * radius,
      square: ({side}) => side * side
    }).orElse(0)).toEqual(9);
  });

  test('a case without an arm is Nothing — the miss is the caller\'s decision', () => {
    const result = area<Shape, number>({kind: 'line', length: 5}, {
      circle: ({radius}) => radius
    });
    expect(result.isNothing).toBe(true);
    expect(result.orElse(-1)).toEqual(-1);
  });

  test('the curried field matcher is reusable across values of the union', () => {
    const label = (shape: Shape): string =>
      area<Shape, string>(shape, {
        circle: () => 'round',
        square: () => 'cornered',
        line: () => 'flat'
      }).orElse('unknown');
    expect(['round', 'cornered', 'flat']).toEqual([
      label({kind: 'circle', radius: 1}),
      label({kind: 'square', side: 1}),
      label({kind: 'line', length: 1})
    ]);
  });
});
