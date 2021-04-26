import { TraitGood, TraitJob, GoodToJob, Trait } from "../World";
import { Bean, LibertarianTaxUnhappyChance, ProgressivismTaxHappyChance } from "./Bean";
import { IOrganization, Charity, IEnterprise } from "./Institutions";
import { City } from "./City";
import { GetRandom } from "../WorldGen";
import { IEvent, IEventBus, Live } from "../events/Events";
import { Government } from "./Government";

export interface IEconomicAgent{
    cash: number;
}
export interface ISeller extends IEconomicAgent{
    ticksSinceLastSale: number;
}
export interface Listing{
    sellerCityKey?: number;
    sellerBeanKey?: number;
    sellerEnterpriseKey?: number;
    price: number;
    seller: ISeller;
    quantity: number;
}
const AllGoods: TraitGood[] = ['food', 'shelter', 'medicine', 'fun'];

export class Economy {
    market = new OrderBook();
    charity = new OrderBook();
    unfulfilledMonthlyDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    monthlyDemand: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    monthlySupply: {[key in TraitGood]: number} = { food: 0, shelter: 0, medicine: 0, fun: 0, }
    law?: Government;
    constructor(){
    }
    public resetMonthlyDemand(){
        this.unfulfilledMonthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.monthlyDemand = { food: 0, shelter: 0, medicine: 0, fun: 0, };
        this.monthlySupply = { food: 0, shelter: 0, medicine: 0, fun: 0, };
    }
    tryTransact(
        buyer: IEconomicAgent, 
        good: TraitGood,
        minDemand: number = 1,
        maxDemand: number = 1
        ): {bought: number, price: number, tax: number}|null {
        this.monthlyDemand[good] += maxDemand;
        const listing = this.market.getLowestPriceListing(good, minDemand);
        if (listing == null){
            //console.log('agent could not find '+good);
            this.unfulfilledMonthlyDemand[good] += maxDemand;
            return null;
        }
        const actualDemand = Math.min(listing.quantity, maxDemand);
        if ((listing.price * (1 + this.salesTaxPercentage)) <= buyer.cash * actualDemand){ 
            const receipt = this.market.transact(listing, good, actualDemand, buyer, this.salesTaxPercentage);
            if (receipt.tax && this.law){
                this.law.treasury.set(this.law.treasury.get+receipt.tax);
                if (buyer instanceof Bean){
                    buyer.ifBelievesInMaybeEmote('Libertarianism', 'unhappiness', LibertarianTaxUnhappyChance);
                    buyer.ifBelievesInMaybeEmote('Progressivism', 'happiness', ProgressivismTaxHappyChance);
                }
            }
            return receipt;
        } else if (buyer instanceof Bean) {
            if (this.law?.PurchaseQualifiesForWelfare(buyer, good) && this.law?.CanPayWelfare(listing.price)){
                return this.market.governmentTransact(listing, good, actualDemand, this.law.treasury);
            }
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
        this.unfulfilledMonthlyDemand[good] += actualDemand;
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
        if (buyer instanceof Bean && this.law?.PurchaseQualifiesForWelfare(buyer, good) && this.law?.CanPayWelfare(listing.price)){
            return 'yes';
        }
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
        this.monthlySupply[good] += quantity;
        const existing = this.market.getBeansListings(seller.cityKey, seller.key, good);
        if (existing){
            existing.quantity += quantity;
            existing.price = price;
            existing.quantity = Math.min(existing.quantity, 6);
        } else {
            this.market.addNewPersonalListing(good, quantity, price, seller);
        }
        this.market.sort(good);
    }
    employAndPrice(seller: IEnterprise, good: TraitGood, quantity: number, price: number) {
        this.monthlySupply[good] += quantity;
        const existing = this.market.getEnterpriseListings(seller, good);
        if (existing){
            existing.quantity += quantity;
            existing.price = price;
            existing.quantity = Math.min(existing.quantity, 6);
        } else {
            this.market.addNewEnterpriseListing(good, quantity, price, seller);
        }
        this.market.sort(good);
    }
    public mostInDemandJob(): TraitJob|null{
        const goods: TraitGood[] = AllGoods;
        const max = goods.reduce((last, good) => {
            if (this.unfulfilledMonthlyDemand[good] > last.max){
                last.max = this.unfulfilledMonthlyDemand[good];
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
        const supply = this.monthlySupply[good] || 1;
        const demand = this.monthlyDemand[good];
        return 0.25 + (0.75 * Math.min(demand/supply, 1));
    }
    public getCostOfLiving(){
        return this.getFairGoodPrice('food')+this.getFairGoodPrice('shelter')+this.getFairGoodPrice('medicine');
    }
    get salesTaxPercentage(): number{
        return this.law?.salesTaxPercentage || 0;
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
    public getStakeListings(bKey: number, enterpriseKey: number|undefined, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerBeanKey == bKey || x.sellerEnterpriseKey == enterpriseKey);
    }
    public getBeansListings(cKey: number, bKey: number, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerBeanKey == bKey && x.sellerCityKey == cKey);
    }
    public getEnterpriseListings(b: IEnterprise, g: TraitGood): Listing|undefined{
        return this.listings[g].find((x) => x.sellerEnterpriseKey == b.key);
    }
    public transact(listing: Listing, good: TraitGood, demand: number, buyer: IEconomicAgent, salesTaxPercentage: number){    
        this.subtractFromListing(listing, good, demand);
        const listPrice = listing.price * demand;
        const tax = listPrice * salesTaxPercentage;
        const grossPrice = listPrice + tax;
        buyer.cash -= grossPrice;
        listing.seller.cash += listPrice;
        listing.seller.ticksSinceLastSale = 0;
        return {
            bought: demand,
            price: listPrice,
            tax: tax
        }
    }
    public governmentTransact(listing: Listing, good: TraitGood, demand: number, treasury: Live<number>){    
        this.subtractFromListing(listing, good, demand);
        const listPrice = listing.price * demand;
        const grossPrice = listPrice;
        treasury.set(treasury.get - grossPrice);
        listing.seller.cash += listPrice;
        listing.seller.ticksSinceLastSale = 0;
        return {
            bought: demand,
            price: listPrice,
            tax: 0
        }
    }
    public subtractFromListing(listing: Listing, good: TraitGood, demand: number){     
        listing.quantity -= demand;
        if (listing.quantity <= 0){
            this.listings[good].splice(0, 1);
        }
    }
    public addNewPersonalListing(good: TraitGood, quantity: number, price: number, bean: Bean){
        this.listings[good].push({
            sellerCityKey: bean.cityKey,
            sellerBeanKey: bean.key,
            price: price,
            seller: bean,
            quantity: quantity
        });
    }
    public addNewEnterpriseListing(good: TraitGood, quantity: number, price: number, enterprise: IEnterprise){
        this.listings[good].push({
            sellerEnterpriseKey: enterprise.key,
            price: price,
            seller: enterprise,
            quantity: quantity
        });
    }
    public sort(good: TraitGood){        
        this.listings[good].sort((a, b) => a.price - b.price);
    }
}