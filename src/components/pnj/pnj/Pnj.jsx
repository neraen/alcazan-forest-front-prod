import React, {useEffect, useState} from "react";
import useModal from "../../../hooks/useModal";
import pnjApi from "../../../services/pnjApi";
import UserActionApi from "../../../services/UserActionApi";
import PnjModal from "../pnjModal/PnjModal";
import {connect} from "react-redux";
import distanceCalculator from "../../../services/distanceCalculator";


const Pnj = (props) => {

    const { isShowing: isDialogShowed, toggle: toggleDialogPnj } = useModal();
    const [sequence, setSequence] = useState();
    const [pnjInfo, setPnjInfo] = useState({
        typepnj: "",
        typeShop: "",
        items: []
    })

    useEffect(() => {
        //getSequence()
        getPnjInfos()
    }, []);

    const getSequence = async () =>  {

        const sequenceData = await pnjApi.getSequence(props.pnj.pnjId);
        setSequence(sequenceData);
    }

    const handleAction = async (link, params) => {
        await UserActionApi.applyUserAction(link, params)
    }

    const getPnjInfos = async () => {
        const pnjInfos = await pnjApi.getPnjInfos(props.pnj.pnjId)
        setPnjInfo(pnjInfos);
        console.log(pnjInfos)
    }

    const isDialogAvailable = () => {
        return isDialogShowed && isPlayerNearPnj();
    }

    const isPlayerNearPnj = () => {
        console.log(props);
        return distanceCalculator.computeDistance(props.abscisse, props.ordonnee, props.positionJoueur.abscisse, props.positionJoueur.ordonnee) < 2;
    }

    const controlToggleDialogPnj = () => {
        if(isPlayerNearPnj()){
            toggleDialogPnj()
        }
    }

    return <>
        <div className="pnj" style={{backgroundImage: "url(../../../img/pnj/"+props.pnj.pnjSkin+".png)"}} onClick={controlToggleDialogPnj}>
            <div className="pnj-hover d-none flex-column">
                <div className="pnj-name">{props.pnj.pnjName}</div>
                <div className="pnj-description">{props.pnj.pnjDescription}</div>
            </div>
        </div>


        <PnjModal toggleDialogPnj={toggleDialogPnj}
                  isDialogShowed={isDialogAvailable()}
                  pnj={pnjInfo}/>
    </>
}

export default connect((state, ownProps) => {
    return {positionJoueur: state.data.positionJoueur, ownProps};
}, {})(Pnj);