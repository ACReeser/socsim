import { TraitGood, TraitJob, GoodToJob, City } from "./World";
import { Bean } from "./Bean";

export interface Listing{
    sellerCityKey: number;
    sellerBeanKey: number;
    price: number;
    seller: Bean;
    quantity: number;
}
const AllGoods: TraitGood[] = ['food', 'shelter', 'medicine', 'fun'];
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
    public getLowestPriceListing(good: TraitGood, demand: number): Listing|null{
        const fullListings =  this.book[good].filter((l) => {
            return l.quantity >= demand;
        });
        if (fullListings.length > 0){
            let numberOfSamePriceListings = 1;
            const lowPrice = fullListings[0].price;
            for (let i = 1; i < fullListings.length; i++) {
                const list = fullListings[i];
                if (list.price > lowPrice)
                    break;
                numberOfSamePriceListings++;
            }
            const i = Math.floor(Math.random() * numberOfSamePriceListings);
            if (i >= fullListings.length)
                throw "invalid index";
            return fullListings[i];
        }
        return null;
    }
    tryTransact(buyer: Bean, good: TraitGood): {bought: number, price: number}|null {
        const demand = 1;
        this.totalSeasonalDemand[good] += demand;
        const listing = this.getLowestPriceListing(good, demand);
        if (listing == null){
            console.log('bean could not find '+good);
        }
        else if (listing.price <= buyer.cash){
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
        } else {
            console.log('bean couldnot afford '+good+" @ $"+listing?.price)
        }
        this.unfulfilledSeasonalDemand[good] += demand;
        return null;
    }
    produceAndPrice(seller: Bean, good: TraitGood, quantity: number, price: number) {
        this.totalSeasonalSupply[good] += quantity;
        const existing = this.book[good].find((x) => x.sellerBeanKey == seller.key && x.sellerCityKey == seller.cityKey);
        if (existing){
            existing.quantity += quantity;
            existing.price = price;
            existing.quantity = Math.min(existing.quantity, 6);
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
    public mostInDemandJob(): TraitJob|null{
        const goods: TraitGood[] = AllGoods;
        const max = goods.reduce((last, good) => {
            if (this.unfulfilledSeasonalDemand[good] > last.max){
                last.max = this.unfulfilledSeasonalDemand[good];
                last.job = GoodToJob(good);
            }
            return last;
        }, {max: 0, job: null as TraitJob|null})

        return max.job;
    }
    public onBeanDie = (deadBean: Bean, city: City) => {
        AllGoods.forEach((g) => {
            const existing = this.book[g].find((x) => x.sellerBeanKey == deadBean.key && x.sellerCityKey == deadBean.cityKey);
            if (existing){
                const lucky = city.getRandomCitizen();
                if (lucky) {
                    existing.sellerBeanKey = lucky.key;
                }
            }
        });
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