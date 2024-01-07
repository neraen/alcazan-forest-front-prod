import React from 'react'

import {connect} from "react-redux";

const UserStatsBlock = (props) => {

    return <>
        <div className="user-stats-block">
            <span className="po"><img className="img-stat-icon" src="/img/gui/Money03.png" /> {props.joueurState.money} Or</span>
            <span className="pm"><img className="img-stat-icon" src="/img/gui/10.png"/> {props.joueurState.pa} PA</span>
            <span className="pa"><img className="img-stat-icon" src="/img/gui/36.png"/> {props.joueurState.pm} PM</span>
        </div>

    </>
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
})(UserStatsBlock)