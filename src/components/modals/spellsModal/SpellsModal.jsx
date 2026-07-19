import React from "react";
import GameModal from "../../ui/gameModal/GameModal";
import SpellsScreen from "../../spells/screen/SpellsScreen";

/**
 * Modale Sortilèges (ouverte depuis le rail de la page principale) :
 * superpose la zone de carte via GameModal.
 */
export default function SpellsModal({isShowing, toggle}){
    return (
        <GameModal isOpen={isShowing} onClose={toggle}>
            <SpellsScreen onClose={toggle}/>
        </GameModal>
    );
}
