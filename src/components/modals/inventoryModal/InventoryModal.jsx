import React, {useEffect, useState} from "react";
import Modal from "../../modal/Modal";
import EquipementCharacter from "../../equipement/equipementCharacter/EquipementCharacter";
import InventaireApi from "../../../services/InventaireApi";
import InventoryMinified from "../../inventory/inventoryMinified/InventoryMinified";
import Loader from "../../loader/Loader";

export default function InventoryModal({isDialogInventoryShowed, toggleDialogInventory}){

    const [modalPosition, setModalPosition] = useState({});
    const [items, setItems] = useState({});
    const [equipementWeared, setEquipementWeared] = useState({});

    useEffect(() => {
        computeModalPosition()
        fetchEquipementEquipe();
        fetchAllPlayerItems();
    }, [])



    const fetchEquipementEquipe = async () => {
        const dataEquipementEquipe = await InventaireApi.getEquipementEquipe();
        setEquipementWeared(dataEquipementEquipe)
    }

    const fetchAllPlayerItems = async () => {
        const allInventoryItems = await InventaireApi.getPlayerInventaire();
        setItems(allInventoryItems)
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

    const getIsDialogInventoryShowed = () => {
        console.log('ca passe ici et ', isDialogInventoryShowed)
        return isDialogInventoryShowed;
    }

    return (
        <>
        {modalPosition && equipementWeared && items && (
            <Modal isShowing={getIsDialogInventoryShowed()} hide={toggleDialogInventory} title="Inventaire" modalPosition={modalPosition}>
                <div className="inventaire-modal-container">
                    <InventoryMinified items={items}/>
                    <EquipementCharacter equipements={equipementWeared} />
                </div>
            </Modal>
        ) || <Loader />}
        </>
    )
}