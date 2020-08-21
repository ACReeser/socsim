import { TraitGood } from "./World";
import { Bean } from "./Bean";

export interface Listing{
    sellerCityKey: number;
    sellerBeanKey: number;
    price: number;
    seller: Bean;
    quantity: number;
}
export class Economy {
    book: {[key in TraitGood]: Listing[]} = {
        food: [] as Listing[],
        shelter: [] as Listing[],
        medicine: [] as Listing[],
        fun: [] as Listing[],
    }
    unfulfilledSeasonalDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    constructor(){

    }
    public resetSeasonalDemand(){
        this.unfulfilledSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    }
    tryTransact(buyer: Bean, good: TraitGood): {bought: number, price: number}|null {
        const demand = 1;
        if (this.book[good].length > 0){
            if (this.book[good][0].price <= buyer.cash){
                const purchase = this.book[good].splice(0, 1)[0];
                buyer.cash -= purchase.price;
                purchase.seller.cash += purchase.price;
                purchase.seller.seasonSinceLastSale--;
                return {
                    bought: demand,
                    price: purchase.price
                }
            }
        }
        this.unfulfilledSeasonalDemand[good] += demand;
        return null;
    }
    addList(seller: Bean, good: TraitGood, price: 1) {
        this.book[good].push({
            sellerCityKey: seller.cityKey,
            sellerBeanKey: seller.key,
            price: 1,
            seller: seller,
            quantity: 1
        });
        //todo: sort book[good] by price
    }
}

export class OrderBook{
    listings: {[key in TraitGood]: Listing[]} = {
        food: [] as Listing[],
        shelter: [] as Listing[],
        medicine: [] as Listing[],
        fun: [] as Listing[],
    };
}