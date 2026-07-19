import React from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../../store/actions";
import styles from "./ShopSell.module.scss";

/**
 * Vente au marchand — fonctionnalité pas encore implémentée côté jeu.
 */
const ShopSell = () => {
    return(
        <p className={styles.placeholder}>
            Le marchand n'achète rien pour le moment. Revenez plus tard !
        </p>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(ShopSell)
