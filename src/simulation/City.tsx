import { Trait } from "../World";
import { Bean } from "../Bean";


export function reportIdeals(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'ego' as Trait, (b) => b.ideals);
}
export function reportCommunity(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'state' as Trait, (b) => b.community);
}
export function reportEthno(beans: Bean[]): {avg: number, winner: Trait}{
    return _report(beans, 'circle' as Trait, (b) => b.ethnicity);
}
export function _report(beans: Bean[], defWin: Trait, beanPropGet: (bean: Bean) => Trait): {avg: number, winner: Trait}{
    const result = { avg: 0, winner: defWin };
    const all = beans.reduce((stash: any, bean) => {
        const value = beanPropGet(bean);
        if (stash[value] == null) { stash[value] = 1;}
        else { stash[value]++}
        return stash;
    }, {});
    Object.keys(all).forEach((trait) => {
        if (all[trait] > result.avg) {
            result.avg = all[trait];
            result.winner = trait as Trait;
        }
    });
    result.avg /= beans.length;
    return result;
}