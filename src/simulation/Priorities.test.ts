import { DefaultDifficulty } from "../Game";
import { GenerateBean, GenerateCity } from "../WorldGen";
import { GetPriorities, IBean } from "./Agent";
import { ICity } from "./City";


test('hungry beans want to buy food', () => {
    const city: ICity = GenerateCity();
    const bean: IBean = GenerateBean({beans: {nextID: 0}, date: {year: 0, season: 0, hour: 0, day: 0}, seed: 'abc'}, city);
    bean.discrete_food = 0;
    const ps = GetPriorities(bean, 'abcdef', city, DefaultDifficulty);
    const top = ps.dequeue();
    expect(top?.value?.act).toBe('buy');
    expect(top?.value?.good).toBe('food');
});