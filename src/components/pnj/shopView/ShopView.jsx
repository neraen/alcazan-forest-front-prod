import React, {useState} from "react"
import {connect} from "react-redux";
import ShopBuy from "./shopBuy/ShopBuy";
import ShopSell from "./ShopSell/ShopSell";
import styles from "./ShopView.module.scss";

/**
 * Échoppe d'un PNJ marchand : onglets Acheter / Vendre + bourse du joueur.
 * La bourse lit `joueurState.money` (Redux), que ShopBuy met à jour avec le solde
 * renvoyé par le serveur après chaque achat : elle se décrémente en direct.
 */
const ShopView = (props) => {

    const [activeTab, setActiveTab] = useState("buy");

    return(
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    <button type="button"
                            className={`${styles.tab} ${activeTab === "buy" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("buy")}>Acheter</button>
                    <button type="button"
                            className={`${styles.tab} ${activeTab === "sell" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("sell")}>Vendre</button>
                </div>

                <span className={styles.purse} title="Votre or">
                    <img className={styles.purseCoin} src="/img/gui/Money03.png" alt="Or"/>
                    <span className={styles.purseAmount}>{props.joueurState.money}</span>
                </span>
            </div>

            <div className={styles.content}>
                {activeTab === "buy" && <ShopBuy items={props.items} pnjId={props.pnjId}/>}
                {activeTab === "sell" && <ShopSell />}
            </div>
        </div>
    )
}

export default connect((state) => ({joueurState: {...state.data.joueurState}}))(ShopView)
