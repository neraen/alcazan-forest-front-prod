import React from "react";
import InventaireApi from "../../../services/InventaireApi";
import EquipementHover from "../equipementHover/EquipementHover";

export default function EquipementCase ({equipement, shouldRefreshInventory}) {

     const handleEquipEquipement = async (idEquipement) => {
         console.log(idEquipement);
        await InventaireApi.wearEquipement(idEquipement);
    }

    return (
        <div onDoubleClick={() => {handleEquipEquipement(equipement.idEquipement); shouldRefreshInventory()}}  className="inventaire-item" key={equipement.idEquipement}>
            <img className="inventaire-item-img" src={'../img/equipement/'+equipement.position+'/'+equipement.imageEquipement}/>
            <div className="inventaire-item-quantity">{equipement.quantity}</div>
            <EquipementHover equipement={equipement}/>
        </div>
    );
}