import React from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../../store/actions";
import UserActionApi from "../../../../services/UserActionApi";
import {rarityClass} from "../../../inventory/screen/itemUtils";
import styles from "./ShopBuy.module.scss";

/**
 * Étal du marchand : cartes d'équipement à la vente (bordure de rareté,
 * caractéristiques, prix, niveau requis).
 */
const ShopBuy = (props) => {

    const handleAchat = async (item) => {
        const playerMoneyAfterBuy = +props.joueurState.money - +item.prixAchat;
        if(playerMoneyAfterBuy >= 0){
            const playerMoney = await UserActionApi.buyItem(item.idEquipement)
            props.updateJoueurState({money: playerMoney.money})
        }
    }

    const canAfford = (item) => +props.joueurState.money >= +item.prixAchat;

    return(
        <div className={styles.grid}>
            { props.items.map((item) =>
                <div key={item.idEquipement} className={`${styles.card} ${styles[rarityClass(item.rarityName)]}`}>
                    <div className={styles.cardHeader}>{item.nomEquipement}</div>
                    <div className={styles.cardBody}>
                        <div className={styles.thumb}>
                            <img className={styles.thumbIcon}
                                 src={'../img/equipement/'+item.position+'/'+item.icone} alt={item.nomEquipement}/>
                        </div>
                        <div className={styles.caracs}>
                            {item.caracteristiques.map((caracteristique) =>
                                <span key={'caracteristique'+caracteristique.id} className={styles.carac}>
                                    +{caracteristique.valeur} {caracteristique.nom}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={styles.cardMeta}>
                        <span className={styles.price}>
                            <img className={styles.coin} src="/img/gui/Money03.png" alt="Or"/>
                            {item.prixAchat} Pièces d'or
                        </span>
                        <span className={styles.levelMin}>Niveau requis : {item.levelMinEquipement}</span>
                    </div>
                    <button type="button" className={styles.buy} disabled={!canAfford(item)}
                            onClick={() => handleAchat(item)}>
                        Acheter
                    </button>
                </div>
            )}
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(ShopBuy)
