import React from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../../store/actions";


const ShopSell = () => {

    const handleSell = async (item) => {

    }

    return(
        <div className="shop-player-items">
            Items du joueur
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(ShopSell)