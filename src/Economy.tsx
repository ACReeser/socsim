import { TraitGood, TraitJob, GoodToJob } from "./World";
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
    totalSeasonalDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    totalSeasonalSupply: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    constructor(){

    }
    public resetSeasonalDemand(){
        this.unfulfilledSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.totalSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.totalSeasonalSupply = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    }
    tryTransact(buyer: Bean, good: TraitGood): {bought: number, price: number}|null {
        const demand = 1;
        this.totalSeasonalDemand[good] += demand;
        if (this.book[good].length > 0){
            if (this.book[good][0].quantity >= demand && this.book[good][0].price <= buyer.cash){
                const listing = this.book[good][0];
                listing.quantity -= demand;
                if (listing.quantity <= 0){
                    this.book[good].splice(0, 1);
                }
                buyer.cash -= listing.price;
                listing.seller.cash += listing.price;
                listing.seller.seasonSinceLastSale--;
                return {
                    bought: demand,
                    price: listing.price
                }
            }
        }
        this.unfulfilledSeasonalDemand[good] += demand;
        return null;
    }
    addList(seller: Bean, good: TraitGood, quantity: number, price: number) {
        const existing = this.book[good].find((x) => x.sellerBeanKey == seller.key && seller.cityKey == seller.cityKey);
        if (existing){
            existing.quantity += quantity;
        } else {
            this.book[good].push({
                sellerCityKey: seller.cityKey,
                sellerBeanKey: seller.key,
                price: price,
                seller: seller,
                quantity: quantity
            });
        }
        //todo: sort book[good] by price
    }
    public mostInDemandJob(): TraitJob{
        const goods: TraitGood[] = ['food', 'shelter', 'medicine', 'fun'];
        const max = goods.reduce((last, good) => {
            if (this.unfulfilledSeasonalDemand[good] > last.max){
                last.max = this.unfulfilledSeasonalDemand[good];
                last.job = GoodToJob(good);
            }
            return last;
        }, {max: 0, job: 'farmer' as TraitJob})

        return max.job;
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