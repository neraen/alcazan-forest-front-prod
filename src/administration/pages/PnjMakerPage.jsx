import React from 'react';
import CreatePnjForm from "../components/forms/CreatePnjForm";
import PnjApi from "../../services/pnjApi";
import MapMakerApi from "../services/MapMakerApi";
import Select from "../../components/forms/select/Select";

class PnjMakerPage extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            pnjInfos: [],
            pnjId: 0,
            pnj: {}
        }
    }

    async componentDidMount (){
        const pnjInfos = await MapMakerApi.getPnjInfoForSelect();
        this.setState({pnjInfos: pnjInfos, pnj: this.setPnj(0)})
    }

    handleChangePnj(event){
        const pnjId = event.target.value;
        this.setState({pnjId, pnj: this.setPnj(pnjId)} )
    }

    setPnj(pnjId){
        let pnj = this.state.pnjInfos.find(pnj => pnj.id == pnjId)
        console.log(pnj)
        if(pnj === undefined){
            pnj = {
                name : "",
                avatar : "",
                skin : "",
                description : "",
                type : "",
            }
        }
        return pnj;
    }

    render(){
        return <>
            <h1>Créer / éditer un pnj</h1>
            <Select name="pnjs"  value={this.state.pnjId} onChange={(event) => this.handleChangePnj(event)}>
                <option value={0}>Créer un pnj</option>
                {this.state.pnjInfos && this.state.pnjInfos.map(pnj =>
                    <option key={pnj.id} value={pnj.id}>{pnj.name}</option>
                )}
            </Select>
            <div className="map-maker-container">
                {this.state.pnj && <CreatePnjForm pnj={this.state.pnj}/>}
            </div>
        </>
    };

}

export default PnjMakerPage;