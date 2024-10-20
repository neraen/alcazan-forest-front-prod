import React, {useEffect, useState} from "react";
import InventaireApi from "../../../services/InventaireApi";
import EquipementHover from "../equipementHover/EquipementHover";
import EquipementCase from "../equipementCase/EquipementCase";

export default function EquipementCharacter ({equipements, shouldRefreshInventory}) {

    const [equipementsByPosition, setEquipementsByPosition] = useState({});

    useEffect(() => {
        setEquipementsByPosition({
            "brasDroit": equipements.find(equipement => equipement.position === "bras-droit"),
            "brasGauche": equipements.find(equipement => equipement.position === "bras-gauche"),
            "tete": equipements.find(equipement => equipement.position === "tete"),
            "jambes": equipements.find(equipement => equipement.position === "jambes"),
            "corps": equipements.find(equipement => equipement.position === "bras-droit"),
            "cou": equipements.find(equipement => equipement.position === "cou"),
            "pieds": equipements.find(equipement => equipement.position === "pieds")
        })

        console.log(equipementsByPosition)
    }, []);

    const handleTakeOffEquipement = async (idEquipement) => {
        await InventaireApi.unwearEquipement(idEquipement);
    }

    return (
        <div className="equipements-character-container">
            <div className="equipements-character-left-items">

            </div>
            <div className="equipements-character-bottom-items">

            </div>
            <div className="equipements-character-right-items">

            </div>
            {equipements && equipements.map((equipement) =>
                <div onDoubleClick={() => {handleTakeOffEquipement(equipement.idEquipement); shouldRefreshInventory()}} className={"item-case "+equipement.position}>
                    <img className="icone-equipement" src={"../img/equipement/"+equipement.position+"/"+equipement.imageEquipement} alt="" />
                    <EquipementHover equipement={equipement}/>
                </div>
            )}

        </div>
    )

}