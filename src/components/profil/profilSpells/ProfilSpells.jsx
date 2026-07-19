import React from 'react'
import SpellsScreen from "../../spells/screen/SpellsScreen";
import styles from "./ProfilSpells.module.scss";

/**
 * Onglet Sorts de la page /personnage : l'écran Sortilèges en pleine page.
 */
const ProfilSpells = (props) => {
    return (
        <div className={styles.body}>
            <div className={styles.frame}>
                <SpellsScreen/>
            </div>
        </div>
    )
}

export default ProfilSpells
