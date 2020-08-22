import { TraitGood, TraitJob, GoodToJob, City } from "./World";
import { Bean } from "./Bean";
import { IOrganization, Charity } from "./simulation/Institutions";
export interface IEconomicAgent{
    cash: number;
}
export interface ISeller extends IEconomicAgent{
    seasonSinceLastSale: number;
}
export interface Listing{
    sellerCityKey?: number;
    sellerBeanKey?: number;
    sellerOrganizationKey?: number;
    price: number;
    seller: ISeller;
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
    charity: {[key in TraitGood]: Listing[]} = {
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
    tryTransact(buyer: IEconomicAgent, good: TraitGood): {bought: number, price: number}|null {
        const demand = 1;
        this.totalSeasonalDemand[good] += demand;
        const listing = this.getLowestPriceListing(good, demand);
        if (listing == null){
            console.log('agent could not find '+good);
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
            console.log('bean couldnot afford '+good+" @ $"+listing?.price);
            if (this.charity[good].length > 0){

            }
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
        this.book[good].sort((a, b) => a.price - b.price);
    }
    addCharity(seller: Charity, good: TraitGood, quantity: number) {
        const existing = this.charity[good].find((x) => x.sellerOrganizationKey == seller.key);
        if (existing){
            existing.quantity += quantity;
            existing.quantity = Math.min(existing.quantity, 10);
        } else {
            this.charity[good].unshift({
                sellerOrganizationKey: seller.key,
                price: 0,
                seller: seller,
                quantity: quantity
            });
        }
        //this.book[good].sort((a, b) => a.price - b.price);
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
    public getLowestPriceListing(good: TraitGood, demand: number): Listing|null{
        const fullListings =  this.listings[good].filter((l) => {
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
    public getBeansListings(b: Bean, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerBeanKey == b.key && x.sellerCityKey == b.cityKey);
    }
}