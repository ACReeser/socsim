import React from "react";
import { World, TraitIcon } from "../World";
import { IPolicy } from "../simulation/Politics";
import { PrimaryBeliefData } from "../simulation/Beliefs";
import { ILaw, ILawData, LawAxis, LawAxisData, LawData, LawGroup, LawKey } from "../simulation/Government";
import { RenderIdealBadges } from "../widgets/UniversalWidgets";
import { groupBy } from "../simulation/Utils";

export interface PartyOverviewPS{
    world: World;
    setPolicy(axis: LawAxis, policy: IPolicy): void;
}
interface PartyOverviewS{
    overView: 'laws'|'leadership'|'finances',
    detailView: 'none'|'group_add'|'law_view',
    detailGroup?: LawGroup,
    detailLaw?: ILaw,
    collapsedGroups: {[key in LawGroup]: boolean},
    collapsedAxis: {[key in LawAxis]: boolean},
}

export class PartyOverview extends React.Component<PartyOverviewPS, PartyOverviewS> {
    constructor(props: any) {
        super(props);
        this.state = {
            overView: 'laws',
            detailView: 'none',
            collapsedGroups: {
                Crime: false,
                Taxation: false,
                Welfare: false,
                Culture: false,
                Economics: false,
            },
            collapsedAxis: {
                'wel_food': false,'wel_house': false,'wel_health': false,'tax_basic': false,'tax_second': false,'econ_sub': false,'cul_rel': false,'cul_theo': false,'crime_theo': false
            }
        }
    }
    renderDetailLaw(law: LawKey, view: 'edit'|'add', partOfGroup: boolean = false){
        const ldata = LawData[law];
        const incompatibilities = Object.values(LawData).filter(
            (x) => x.key != law && x.axis === ldata.axis
        );
        const rowClassName = view === 'add' ? 'border-b-1 pad-bt-8' : '';
        return  <div key={law} className={rowClassName+(partOfGroup ? ' pad-l-40': '')}>
        <div className="horizontal">
            <strong className="f-size-15em">
                {ldata.name}
            </strong>
            <span>
                {RenderIdealBadges(ldata.idealPro || [], 'pos')}
            </span>
            {
                view === 'add' ? 
                <button className="callout marg-0">
                    Adopt for 3 🗳️ 
                </button> : null
            }
        </div>
        {
            (partOfGroup ? null : <div>
                <i>Government Policy for&nbsp;{LawAxisData[ldata.axis].name}
                </i>
            </div>)
        }
        <div>
            <p>
                {ldata.description}
            </p>
            {
                view === 'edit' ? 
                <div className="horizontal">
                    <span>
                        <strong>Subjects Fed:</strong> 1
                    </span>
                    <span>
                        <strong>Last Monthly Cost:</strong> $1
                    </span>
                </div> : null
            }
            <div className="horizontal">
                <span>
                    <strong>Max. Monthly Cost:</strong> <input type="number" />
                </span>
            </div>
            <strong>Incompatible with</strong>
            {
                incompatibilities.map((x, i) => <i key={x.name}>{i > 0 ? <span>,</span>: null} {x.name}</i>
                )
            }
        </div>
    </div>;
    }
    renderDetailGroup(group: LawGroup): JSX.Element[]{
        const divs: JSX.Element[] = [];
        groupBy(Object.values(LawData).filter(x => x.group === group), (y: ILawData) => {
            return y.axis;
        }).forEach((val) => {
            const isGroup = (val.length > 1);
            if (isGroup){
                divs.push(<div>
                    <h3>
                        {LawAxisData[val[0].axis].name}
                        <button className="callout marg-0 pull-r" onClick={() => {
                            this.state.collapsedAxis[val[0].axis] = !this.state.collapsedAxis[val[0].axis];
                            this.setState({collapsedAxis: this.state.collapsedAxis});
                        }}>📁</button>
                    </h3>
                </div>);
            }
            if (!isGroup || !this.state.collapsedAxis[val[0].axis]){
                val.forEach((z) => {
                    divs.push(this.renderDetailLaw(z.key, 'add', isGroup))
                });
            }
        });
        return divs;
    }
    toggleGroup(group: LawGroup){
        this.state.collapsedGroups[group] = !this.state.collapsedGroups[group];
        this.setState({collapsedGroups: this.state.collapsedGroups});
    }
    renderHeader(group: LawGroup){
        return <tr>
            <td>
                <strong>{group}</strong>
            </td>
            <td>
                <button className="callout marg-0" onClick={() => this.setState({detailView: 'group_add', detailGroup: group})}>Add ➕</button>
                <button className="callout marg-0" onClick={() => this.toggleGroup(group)}>📁</button>
            </td>
        </tr>
    }
    renderRows(group: LawGroup, laws: ILaw[]): React.ReactNode{
        if (this.state.collapsedGroups[group])
            return null;
        return laws.map((x) => {
            const data = LawData[x.key];
            return <tr key={x.key}>
            <td>
                <i>{data.name}</i> 
                {
                    (data.idealPro || []).map((x) => TraitIcon[x])
                }
            </td>
            <td>
                <button onClick={() => this.setState({detailView: 'law_view', detailLaw: x})} className="callout marg-0">View 🔍</button>
            </td>
        </tr>
        });
    }
    render(){
        return <div>
            <div className="col-2">
                <h2 className="marg-b-0">Utopia Government</h2>
                <div>
                    <div className="horizontal blue-orange cylinder f-size-125em marg-t-20">
                        <button type="button" onClick={() => this.setState({overView: 'laws'})} className={this.state.overView === 'laws' ? 'active': ''}>
                            📜 Laws
                        </button>
                        <button type="button" onClick={() => this.setState({overView: 'leadership'})} className={this.state.overView === 'leadership' ? 'active': ''}>
                            {this.props.world.party.leadership} 🗳️ Leadership
                        </button>
                        <button type="button" onClick={() => this.setState({overView: 'finances'})} className={this.state.overView === 'finances' ? 'active': ''}>
                            💰 Funding
                        </button>
                    </div>
                </div>
            </div>
            <div className="pad-4p">
                {this.props.world.party.name} is a&nbsp;
                {PrimaryBeliefData[this.props.world.party.community].adj} {PrimaryBeliefData[this.props.world.party.community].icon}&nbsp; 
                {PrimaryBeliefData[this.props.world.party.ideals].adj} {PrimaryBeliefData[this.props.world.party.ideals].icon}&nbsp;
                Utopia
            </div>
            {this.renderOver()}
        </div>
    }
    renderOver(): React.ReactNode {
        switch(this.state.overView){
            case 'leadership':
                return this.renderLeadership();
            case 'finances':
                return this.renderFinances();
            default:
                return this.renderLaws();
        }
    }
    renderLaws(){  
        const groups = this.props.world.law.getLawsByGroup();
        return <div className="col-2-30-60">
        <div className="max-h-365">
            <table className="full">
                <tbody>
                    {this.renderHeader('Taxation')}
                    {this.renderRows('Taxation', groups.Taxation)}
                    {this.renderHeader('Welfare')}
                    {this.renderRows('Welfare', groups.Welfare)}
                    {this.renderHeader('Economics')}
                    {this.renderRows('Economics', groups.Economics)}
                    {this.renderHeader('Crime')}
                    {this.renderRows('Crime', groups.Crime)}
                    {this.renderHeader('Culture')}
                    {this.renderRows('Culture', groups.Culture)}
                </tbody>
            </table>
        </div>
        <div className="border max-h-365">
            {this.renderLawDetail()}
        </div>
    </div>
    }
    renderLawDetail(){      
        if (this.state.detailView === 'group_add' && this.state.detailGroup){
            return this.renderDetailGroup(this.state.detailGroup);
        } else if (this.state.detailView === 'law_view' && this.state.detailLaw){
            return this.renderDetailLaw(this.state.detailLaw.key, 'edit')
        }
        return <div className="text-center">
            Add ➕ or View 🔍 a Law
        </div>;

    }
    renderFinances(): React.ReactNode {
        return <div>

        </div>
    }
    renderLeadership(): React.ReactNode {
        return <div>
            
        </div>
    }
}