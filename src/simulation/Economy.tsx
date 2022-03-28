import { TraitGood, TraitJob, GoodToJob, Trait } from "../World";
import { IEnterprise } from "./Institutions";
import { GovCanPayWelfare, GovPurchaseQualifiesForWelfare, IGovernment, IGovPolicy, IsLaw, SalesTaxPercentage } from "./Government";
import { IBean } from "./Agent";
import { DistrictKind } from "./Geography";
import { BeanBelievesIn } from "./Bean";
import { DefaultBuildingStorageCount, IBuilding, UpgradedBuildingStorageCount } from "./RealEstate";

export interface IEconomicAgent{
    cash: number;
}
export interface ISeller extends IEconomicAgent{
    ticksSinceLastSale: number;
}
export function BeanDistrictIdeologyBonus(b: IBean, kind: DistrictKind): number{
    if (kind === 'rural')
        return BeanBelievesIn(b, 'Parochialism') ? 1 : BeanBelievesIn(b, 'Cosmopolitanism') ? -1 : 0;
    else if (kind === 'urban')
        return BeanBelievesIn(b, 'Parochialism') ? -1 : BeanBelievesIn(b, 'Cosmopolitanism') ? 1 : 0;
    return 0;
}
export interface IListing{
    sellerCityKey?: number;
    sellerBeanKey?: number;
    sellerEnterpriseKey?: number;
    price: number;
    seller?: ISeller;
    quantity: number;
}
const AllGoods: TraitGood[] = ['food', 'medicine', 'fun'];

export interface IEconomy{
    unfulfilledMonthlyDemand: {[key in TraitGood]: number};
    monthlyDemand: {[key in TraitGood]: number};
    monthlySupply: {[key in TraitGood]: {totalQty: number, avgUnitPrice: number}};
    market: IMarket;
}
export interface IMarket{
    listings: {[key in TraitGood]: IListing[]};
}
export interface IMarketReceipt{
    bought: number, 
    price: number, 
    tax: number
}
export function MarketTransact(
    market: IMarket, 
    listing: IListing, 
    good: TraitGood, 
    demand: number, 
    buyer: IEconomicAgent, 
    seller: ISeller, 
    salesTaxPercentage: number){    
    MarketListingSubtract(market, listing, good, demand);
    const listPrice = listing.price * demand;
    const tax = listPrice * salesTaxPercentage;
    const grossPrice = listPrice + tax;
    buyer.cash -= grossPrice;
    seller.cash += listPrice;
    seller.ticksSinceLastSale = 0;
    return {
        bought: demand,
        price: listPrice,
        tax: tax
    }
}
export function MarketGovernmentTransact(market: IMarket, gov: IGovernment, listing: IListing, good: TraitGood, demand: number, seller: ISeller){
    MarketListingSubtract(market, listing, good, demand);
    const listPrice = listing.price * demand;
    const grossPrice = listPrice;
    gov.cash -= grossPrice;
    seller.cash += listPrice;
    seller.ticksSinceLastSale = 0;
    return {
        bought: demand,
        price: listPrice,
        tax: 0
    }
}
export function MarketListingSubtract(market: IMarket, listing: IListing, good: TraitGood, demand: number){     
    listing.quantity -= demand;
    if (listing.quantity <= 0){
        market.listings[good].splice(0, 1);
    }
}

export function EconomyTryTransact(
    economy: IEconomy,
    gov: IGovernment,
    buyer: IEconomicAgent, 
    good: TraitGood,
    getSeller: (l: IListing) => ISeller,
    minDemand: number = 1,
    maxDemand: number = 1
    ): IMarketReceipt|undefined {
    economy.monthlyDemand[good] += maxDemand;
    const listing = MarketLowestPriceListing(economy.market, good, minDemand);
    if (listing == null){
        //console.log('agent could not find '+good);
        economy.unfulfilledMonthlyDemand[good] += maxDemand;
        return undefined;
    }
    const actualDemand = Math.min(listing.quantity, maxDemand);
    const salesTaxPercent = IsLaw(gov, 'sales_tax') ? SalesTaxPercentage : 0;
    if ((listing.price * (1 + salesTaxPercent)) <= buyer.cash * actualDemand){ 
        const receipt = MarketTransact(economy.market, listing, good, actualDemand, buyer, getSeller(listing), salesTaxPercent);
        if (receipt.tax){
            gov.cash += receipt.tax;
        }
        return receipt;
    } else {
        if (GovPurchaseQualifiesForWelfare(gov, buyer, good) && GovCanPayWelfare(gov, listing.price)){
            return MarketGovernmentTransact(economy.market, gov, listing, good, actualDemand, getSeller(listing));
        }
    }
    economy.unfulfilledMonthlyDemand[good] += actualDemand;
    return undefined;
}
export function EconomyMostInDemandJob(economy: IEconomy){
    const goods: TraitGood[] = AllGoods;
    const max = goods.reduce((last, good) => {
        if (economy.unfulfilledMonthlyDemand[good] > last.max){
            last.max = economy.unfulfilledMonthlyDemand[good];
            last.job = GoodToJob(good);
        }
        return last;
    }, {max: 0, job: null as TraitJob|null})

    return max.job;
}
const MaximumListingQuantity = 20;
export function EconomyProduceAndPrice(econ: IEconomy, seller: IBean, good: TraitGood, quantity: number, price: number) {
    for (let i = 0; i < quantity; i++) {
        econ.monthlySupply[good].totalQty +=1;
        econ.monthlySupply[good].avgUnitPrice = econ.monthlySupply[good].avgUnitPrice + (price - econ.monthlySupply[good].avgUnitPrice) / Math.min(econ.monthlySupply[good].totalQty, 3);
    }
    const existing = econ.market.listings[good].find((x) => x.sellerBeanKey == seller.key);
    if (existing){
        existing.quantity += quantity;
        existing.price = price;
        existing.quantity = Math.min(existing.quantity, MaximumListingQuantity);
    } else {
        econ.market.listings[good].push({
            sellerBeanKey: seller.key,
            sellerCityKey: seller.cityKey,
            price: price,
            quantity: quantity
        });
    }
    econ.market.listings[good].sort((a, b) => a.price - b.price);
}
export function EconomyEmployAndPrice(econ: IEconomy, seller: IEnterprise, building: IBuilding, good: TraitGood, quantity: number, price: number) {
    if (seller.enterpriseType === 'commune')
        price = 0;
    const storage = building.upgradedStorage ? UpgradedBuildingStorageCount : DefaultBuildingStorageCount;
    for (let i = 0; i < quantity; i++) {
        econ.monthlySupply[good].totalQty +=1;
        econ.monthlySupply[good].avgUnitPrice = econ.monthlySupply[good].avgUnitPrice + (price - econ.monthlySupply[good].avgUnitPrice) / Math.min(econ.monthlySupply[good].totalQty, 3);
    }
    const existing = econ.market.listings[good].find((x) => x.sellerEnterpriseKey == seller.key);
    if (existing){
        existing.quantity += quantity;
        existing.price = price;
        existing.quantity = Math.min(existing.quantity, storage);
    } else {
        econ.market.listings[good].push({
            sellerEnterpriseKey: seller.key,
            price: price,
            quantity: quantity
        });
    }
    econ.market.listings[good].sort((a, b) => a.price - b.price);
}
export function GetFairGoodPrice(econ: IEconomy, good: TraitGood){
    return econ.monthlySupply[good].avgUnitPrice;
}
export function EconomyGetCostOfLiving(econ: IEconomy){
    return GetFairGoodPrice(econ, 'food')+GetFairGoodPrice(econ,'medicine');
}
export function EconomyCanBuy(econ: IEconomy, gov: IGovernment, buyer: IEconomicAgent, good: TraitGood,
    minDemand: number = 1,
    maxDemand: number = 1): 'yes'|'nosupply'|'pricedout'{
    const listing = MarketLowestPriceListing(econ.market, good, minDemand);
    if (listing == null){
        return 'nosupply';
    }
    const actualDemand = Math.min(listing.quantity, maxDemand);
    if (listing.price <= buyer.cash * actualDemand)
        return 'yes';
    if (GovPurchaseQualifiesForWelfare(gov, buyer, good) && GovCanPayWelfare(gov, listing.price)){
        return 'yes';
    }
    return 'pricedout';

}

function MarketLowestPriceListing(market: IMarket, good: TraitGood, demand: number): IListing|null{
    const fullListings =  market.listings[good].filter((l) => {
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