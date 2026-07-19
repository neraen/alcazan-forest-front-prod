import React from "react";
import GameModal from "../../ui/gameModal/GameModal";
import InventoryScreen from "../../inventory/screen/InventoryScreen";

/**
 * Modale d'inventaire (ouverte depuis le rail de la page principale) :
 * superpose la zone de carte via GameModal.
 */
export default function InventoryModal({isDialogInventoryShowed, toggleDialogInventory}){
    return (
        <GameModal isOpen={isDialogInventoryShowed} onClose={toggleDialogInventory}>
            <InventoryScreen onClose={toggleDialogInventory}/>
        </GameModal>
    );
}
