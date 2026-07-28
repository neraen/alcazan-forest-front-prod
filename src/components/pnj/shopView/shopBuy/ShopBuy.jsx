import React, {useState} from "react"
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../../store/actions";
import UserActionApi from "../../../../services/UserActionApi";
import ItemCard from "../itemCard/ItemCard";
import styles from "./ShopBuy.module.scss";

/**
 * Étal du marchand : cartes d'équipement à la vente (bordure de rareté,
 * caractéristiques, prix, niveau requis).
 */
const ShopBuy = (props) => {

    // Id de l'objet dont l'achat est en cours : neutralise les boutons le temps de
    // l'aller-retour serveur (sinon un double clic débite deux fois).
    const [achatEnCours, setAchatEnCours] = useState(null);

    const handleAchat = async (item) => {
        if(achatEnCours !== null){
            return;
        }
        setAchatEnCours(item.idEquipement);
        try {
            const achat = await UserActionApi.buyItem(item.idEquipement, props.pnjId);
            // Le serveur fait foi sur l'or restant : on rafraîchit la bourse avec sa réponse.
            props.updateJoueurState({money: achat.money});
            toast.success(achat.message || `${item.nomEquipement} acheté.`);
        } catch (error) {
            const reponse = error.response?.data;
            if(reponse?.money !== undefined){
                props.updateJoueurState({money: reponse.money});
            }
            toast.error(reponse?.error || "L'achat n'a pas pu aboutir.");
        } finally {
            setAchatEnCours(null);
        }
    }

    const canAfford = (item) => +props.joueurState.money >= +item.prixAchat;

    const items = props.items || [];
    if(items.length === 0){
        return <div className={styles.grid}><p>Cet étal est vide pour le moment.</p></div>;
    }

    return(
        <div className={styles.grid}>
            { items.map((item) =>
                <ItemCard key={item.idEquipement}
                          name={item.nomEquipement}
                          img={'../img/equipement/' + item.position + '/' + item.icone}
                          rarity={item.rarityName}
                          caracteristiques={item.caracteristiques}
                          price={item.prixAchat}
                          meta={`Niveau requis : ${item.levelMinEquipement}`}
                          actionLabel="Acheter"
                          pendingLabel="Achat…"
                          pending={achatEnCours === item.idEquipement}
                          disabled={!canAfford(item) || achatEnCours !== null}
                          disabledLabel={canAfford(item) ? undefined : "Or insuffisant"}
                          onAction={() => handleAchat(item)}/>
            )}
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(ShopBuy)
