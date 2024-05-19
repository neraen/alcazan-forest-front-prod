import React from "react";
import InventaireApi from "../../../services/InventaireApi";
import EquipementHover from "../equipementHover/EquipementHover";

export default function EquipementCharacter ({equipements, shouldRefreshInventory}) {

    const handleTakeOffEquipement = async (idEquipement) => {
        await InventaireApi.unwearEquipement(idEquipement);
    }

    return (
        <div className="equipements-character-container">
            {equipements && equipements.map((equipement) =>
                <div onDoubleClick={() => {handleTakeOffEquipement(equipement.idEquipement); shouldRefreshInventory()}} className={"item-case "+equipement.position}>
                    <img className="icone-equipement" src={"../img/equipement/"+equipement.position+"/"+equipement.imageEquipement} alt="" />
                    <EquipementHover equipement={equipement}/>
                </div>
            )}
            <img className="equipements-character-class" src="../../../img/silouhette.png"/>
        </div>
    )

}