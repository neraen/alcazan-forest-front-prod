import React from 'react'
import StatBar from "../statBar/StatBar";
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import Loader from "../../loader/Loader";

const UsernameBlock = (props) => {
    let barWidth = 0;
    const windowWidth = window.innerWidth;
    if(windowWidth > 1700){
        barWidth = windowWidth / 10;
    }else{
        barWidth = windowWidth / 6
    }
    return <>
        {(props.joueurState.level && props.joueurState.lifeJoueur) && (
            <div className="username-block">


                <img className="avatar-player" src="/img/gui/CharacterPlayer/Avatar.png" alt=""/>
                <div className="player-bars">
                    <h3 className="player-pseudo">{props.user.pseudo}</h3>
                    <StatBar value={props.joueurState.lifeJoueur} max={props.user.maxLife} maxWidth={barWidth} classN="lifeBar"/>
                    <StatBar value={props.user.currentMana} max={props.user.maxMana} maxWidth={barWidth} classN="manaBar"/>
                    <div className="player-level">{props.joueurState.level}</div>
                </div>
                {/*<NavLink className="nav-link text-center" to="/">Messagerie</NavLink>*/}
            </div>
        ) || <Loader maxWidth={200} maxHeight={200}/>}
    </>
}

export default connect((state, ownProperties) =>{
    return {joueurState: state.data.joueurState, ownProperties}
}, {updateJoueurState})(UsernameBlock)
