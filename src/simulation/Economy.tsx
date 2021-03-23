import { TraitGood, TraitJob, GoodToJob, Trait } from "../World";
import { Bean } from "./Bean";
import { IOrganization, Charity } from "./Institutions";
import { City } from "./City";
import { GetRandom } from "../WorldGen";
import { IEvent, IEventBus } from "../events/Events";

export interface IEconomicAgent{
    cash: number;
}
export interface ISeller extends IEconomicAgent{
    ticksSinceLastSale: number;
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
    market = new OrderBook();
    charity = new OrderBook();
    unfulfilledSeasonalDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    totalSeasonalDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    totalSeasonalSupply: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    constructor(public eventBus: IEventBus){
    }
    public resetSeasonalDemand(){
        this.unfulfilledSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.totalSeasonalDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.totalSeasonalSupply = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    }
    tryTransact(
        buyer: IEconomicAgent, 
        good: TraitGood,
        minDemand: number = 1,
        maxDemand: number = 1
        ): {bought: number, price: number}|null {
        this.totalSeasonalDemand[good] += maxDemand;
        const listing = this.market.getLowestPriceListing(good, minDemand);
        if (listing == null){
            //console.log('agent could not find '+good);
            this.unfulfilledSeasonalDemand[good] += maxDemand;
            return null;
        }
        const actualDemand = Math.min(listing.quantity, maxDemand);
        if (listing.price <= buyer.cash * actualDemand){
            return this.market.transact(listing, good, actualDemand, buyer);
        } else if (buyer instanceof Bean) {
            // console.log('bean couldnot afford '+good+" @ $"+listing?.price);
            // const charityTicket = this.charity.getLowestPriceListing(good, minDemand);
            // if (charityTicket && charityTicket.seller instanceof Charity) {
            //     // console.log('bean got '+good+" from charity");
            //     const actualDemand = Math.min(charityTicket.quantity, maxDemand);
            //     buyer.partyLoyalty += PartyLoyaltyPerCharityUse;
            //     charityTicket.seller.beansHelped++;
            //     charityTicket.seller.inventory -= actualDemand;
            //     return this.charity.transact(charityTicket, good, actualDemand, buyer);
            // }
        }
        this.unfulfilledSeasonalDemand[good] += actualDemand;
        return null;
    }
    canBuy(buyer: IEconomicAgent, good: TraitGood,
        minDemand: number = 1,
        maxDemand: number = 1): 'yes'|'nosupply'|'pricedout'{
        const listing = this.market.getLowestPriceListing(good, minDemand);
        if (listing == null){
            return 'nosupply';
        }
        const actualDemand = Math.min(listing.quantity, maxDemand);
        if (listing.price <= buyer.cash * actualDemand)
            return 'yes';
        return 'pricedout';
    }
    steal(
        good: TraitGood,
        maxDemand: number = 1
        ): number|null {
        const listing = GetRandom(this.market.listings[good]);
        if (listing == null){
            return null;
        }
        const actualDemand = Math.min(listing.quantity, maxDemand);
        this.market.subtractFromListing(listing, good, actualDemand);
        
        return actualDemand;
    }
    produceAndPrice(seller: Bean, good: TraitGood, quantity: number, price: number) {
        this.totalSeasonalSupply[good] += quantity;
        const existing = this.market.getBeansListings(seller.cityKey, seller.key, good);
        if (existing){
            existing.quantity += quantity;
            existing.price = price;
            existing.quantity = Math.min(existing.quantity, 6);
        } else {
            this.market.addNewListing(good, quantity, price, seller);
        }
        this.market.sort(good);
    }
    addCharity(seller: Charity, good: TraitGood, quantity: number) {
        const existing = this.charity.getOrgsListings(seller, good);
        if (existing){
            existing.quantity += quantity;
            existing.quantity = Math.min(existing.quantity, 10);
            seller.inventory = existing.quantity;
        } else {
            this.charity.addNewOrgListing(good, quantity, 0, seller);
            seller.inventory = quantity;
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
    public onBeanDie(bean: Bean){
        AllGoods.forEach((g) => {
            const existing = this.market.getBeansListings(bean.cityKey, bean.key, g);
            if (existing){
                const lucky = bean.city?.getRandomCitizen();
                if (lucky) {
                    existing.sellerCityKey = lucky.cityKey;
                    existing.sellerBeanKey = lucky.key;
                    existing.seller = lucky;
                }
            }
        });
    }
    public getFairGoodPrice(good: TraitGood){
        const supply = this.totalSeasonalSupply[good] || 1;
        const demand = this.totalSeasonalDemand[good];
        return 0.25 + (0.75 * Math.min(demand/supply, 1));
    }
    public getCostOfLiving(){
        return this.getFairGoodPrice('food')+this.getFairGoodPrice('shelter')+this.getFairGoodPrice('medicine');
    }
}

export class OrderBook{
    public readonly listings: {[key in TraitGood]: Listing[]} = {
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
    public getBeansListings(cKey: number, bKey: number, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerBeanKey == bKey && x.sellerCityKey == cKey);
    }
    public getOrgsListings(b: IOrganization, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerOrganizationKey == b.key);
    }
    public transact(listing: Listing, good: TraitGood, demand: number, buyer: IEconomicAgent){    
        this.subtractFromListing(listing, good, demand);
        const sale = listing.price * demand;
        buyer.cash -= sale;
        listing.seller.cash += sale;
        listing.seller.ticksSinceLastSale = 0;
        return {
            bought: demand,
            price: sale
        }
    }
    public subtractFromListing(listing: Listing, good: TraitGood, demand: number){     
        listing.quantity -= demand;
        if (listing.quantity <= 0){
            this.listings[good].splice(0, 1);
        }
    }
    public addNewListing(good: TraitGood, quantity: number, price: number, bean: Bean){
        this.listings[good].push({
            sellerCityKey: bean.cityKey,
            sellerBeanKey: bean.key,
            price: price,
            seller: bean,
            quantity: quantity
        });
    }
    public addNewOrgListing(good: TraitGood, quantity: number, price: number, org: IOrganization){
        this.listings[good].push({
            sellerOrganizationKey: org.key,
            price: price,
            seller: org,
            quantity: quantity
        });
    }
    public sort(good: TraitGood){        
        this.listings[good].sort((a, b) => a.price - b.price);
    }
}