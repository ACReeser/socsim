import { DefaultDifficulty } from "../Game";
import { GenerateBean, GenerateCity } from "../WorldGen";
import { GetPriorities, IBean } from "./Agent";
import { ICity } from "./City";


test('hungry beans want to buy food', () => {
    const city: ICity = GenerateCity();
    const bean: IBean = GenerateBean({beans: {nextID: 0}, date: {year: 0, season: 0, hour: 0, day: 0}, seed: 'abc'}, city);
    bean.discrete_food = 0;
    const ps = GetPriorities(bean, 'abcdef', city, DefaultDifficulty);
    const top = ps[0];
    expect(top?.act).toBe('buy');
    expect(top?.good).toBe('food');
});

test('homeless beans want to buy shelter', () => {
    const city: ICity = GenerateCity();
    const bean: IBean = GenerateBean({beans: {nextID: 0}, date: {year: 0, season: 0, hour: 0, day: 0}, seed: 'abc'}, city);
    bean.discrete_stamina = 0;
    const ps = GetPriorities(bean, 'abcdef', city, DefaultDifficulty);
    const top = ps[0];
    expect(top?.act).toBe('buy');
    expect(top?.good).toBe('shelter');
});

test('sick beans want to buy meds', () => {
    const city: ICity = GenerateCity();
    const bean: IBean = GenerateBean({beans: {nextID: 0}, date: {year: 0, season: 0, hour: 0, day: 0}, seed: 'abc'}, city);
    bean.discrete_health = 0;
    const ps = GetPriorities(bean, 'test', city, DefaultDifficulty);
    const top = ps[0];
    expect(top?.act).toBe('buy');
    expect(top?.good).toBe('medicine');
});