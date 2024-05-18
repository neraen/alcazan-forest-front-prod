import React, {useEffect, useState} from "react";
import Modal from "../../modal/Modal";
import EquipementCharacter from "../../equipement/equipementCharacter/EquipementCharacter";
import InventaireApi from "../../../services/InventaireApi";

export default function InventoryModal({isDialogInventoryShowed, toggleDialogInventory, title}){

    const [modalPosition, setModalPosition] = useState({})

    useEffect(() => {
        computeModalPosition()
        fetchEquipementEquipe();
    }, [isDialogInventoryShowed])

    const [equipementWeared, setEquipementWeared] = useState({});

    const fetchEquipementEquipe = async () => {
        const dataEquipementEquipe = await InventaireApi.getEquipementEquipe();
        setEquipementWeared(dataEquipementEquipe)
    }

    const computeModalPosition = () => {
        const element = document.querySelector('.inventory-btn');
        const rect = element.getBoundingClientRect();
        const right = rect.right;
        const top = rect.top;
        const width = rect.width;
        const height = rect.height;

        let distanceFromLeftEdge =  888;
        let distanceFromTopEdge =  150;

        if(window.innerWidth < 1700){
             distanceFromLeftEdge = 600;
             distanceFromTopEdge =  120;
        }

        setModalPosition({
            position: "absolute",
            left: distanceFromLeftEdge,
            top: distanceFromTopEdge
        })
    }

    return (
        <>
        {modalPosition && equipementWeared && (
            <Modal isShowing={isDialogInventoryShowed} toggle={toggleDialogInventory} title="Inventaire" modalPosition={modalPosition}>
                <div className="inventaire-modal-container">
                    <InventoryMinified />
                    <EquipementCharacter equipements={equipementWeared} />
                </div>
            </Modal>
        )}
        </>
    )
}