import * as faker from 'faker';
import {not} from '../util';
import {err, ok} from '../result';
import {maybe} from '../maybe';

describe('The Result', () => {
  const data = {t: faker.lorem.sentence()};
  const reason = faker.lorem.sentence();

  const aResult = (isSomething: boolean) =>
    maybe(data, isSomething).toResult().or(() => err(reason));

  test('when Ok', () => {
    const anOkResult = aResult(true);

    expect(anOkResult.orNull()).toEqual(data);

    expect(anOkResult.onSuccess(value => expect(value).toEqual(data)).orElse(reason)).toEqual(data);

    expect(anOkResult.onFailure(() => fail('this should not happen')).orElse(reason)).toEqual(data);

    expect(anOkResult.orElse(reason)).toEqual(data);

    expect(anOkResult.map(value => value + reason).orElse(reason)).toEqual(data + reason);

    expect(anOkResult.mBind(value => ok(value + reason)).orElse(reason)).toEqual(data + reason);
    expect(anOkResult.mBind(value => err(value + reason)).orElse(reason)).toEqual( reason);

    expect(anOkResult.or(() => fail('this should not happen')).orElse(reason)).toEqual(data);

    const actual = anOkResult.either(
      value => err({t: value.t + reason}),
      value => ok({t: value})
    ).value;
    expect(actual).toEqual({t: data.t + reason});

    expect(anOkResult.toMaybe().inspect()).toBe(`Some(${data})`);

    if (anOkResult.isSuccess) expect(anOkResult.value).toEqual(data);
    else fail('This should not happen');
  });

  test('when Err', () => {
    const anErrResult = aResult(false);

    expect(anErrResult.orNull()).toBeNull();

    expect(anErrResult.onSuccess(() => fail('this should not happen')).orElse(data)).toEqual(data);

    expect(anErrResult.onFailure(value => expect(value).toEqual(reason)).isSuccess).toBe(false);

    expect(anErrResult.orElse(data)).toEqual(data);

    expect(anErrResult.map(() => 'this should not happen').orElse(data)).toEqual(data);

    expect(anErrResult.mBind(() => err('this will not happen')).orElse(data)).toEqual(data);
    expect(anErrResult.mBind(() => ok('this will not happen')).orElse(data)).toEqual(data);

    expect(anErrResult.or(explanation => err(explanation + data)).orElse(data)).toEqual(data);
    expect(anErrResult.or(explanation => ok(explanation + data)).orElse(data)).toEqual(reason + data);

    expect(anErrResult.either(
      () => ok('This should not happen'),
      value => err(value + data),
    ).value).toEqual(reason + data);

    const actual = anErrResult.either(
      () => err('This should not happen'),
      value => ok(value + data),
    ).value;
    expect(actual).toEqual(reason + data);

    expect(anErrResult.toMaybe().inspect()).toBe('Nothing');

    if (not(anErrResult.isSuccess)) expect(anErrResult.value).toEqual(reason);
    else fail('This should not happen');
  });
});
