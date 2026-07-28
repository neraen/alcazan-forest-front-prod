import React from 'react'
import {Link} from "react-router-dom";
import useModal from "../../../hooks/useModal";
import AtelierModal from "../../modals/atelierModal/AtelierModal";
import InventoryModal from "../../modals/inventoryModal/InventoryModal";
import ProfilModal from "../../modals/profilModal/ProfilModal";
import SpellsModal from "../../modals/spellsModal/SpellsModal";
import Panel from "../../ui/panel/Panel";
import styles from "./SideMenu.module.scss";

/**
 * Rail de navigation de la colonne gauche : icône ronde + label + chevron.
 * Inventaire et Profil s'ouvrent en modale au-dessus de la carte ; les autres
 * items naviguent (les pages pleines existent toujours via le header).
 */
const SideMenu = (props) => {
    const { isShowing: isDialogInventoryShowed, toggle: toggleDialogInventory } = useModal();
    const { isShowing: isProfilShowed, toggle: toggleProfil } = useModal();
    const { isShowing: isSpellsShowed, toggle: toggleSpells } = useModal();
    const { isShowing: isAtelierShowed, toggle: toggleAtelier } = useModal();

    const linkItems = [
        {label: "Artisanat", to: "/artisanat", icon: "/img/menu/buches.png"},
        {label: "Guilde", to: "/guilde", icon: "/img/icons/flag.png"},
        {label: "Journal", to: "/historique", icon: "/img/icons/book.png"},
        {label: "Classement", to: "#", icon: "/img/icons/shild.png"},
    ];

    const itemContent = (item) => <>
        <img className={styles.icon} src={item.icon} alt=""/>
        <span className={styles.label}>{item.label}</span>
    </>;

    return (
        <Panel padding="sm" className={styles.rail}>
            <Link to="/carte" className={styles.item}>
                {itemContent({label: "Carte", icon: "/img/icons/map.png"})}
            </Link>
            <button type="button" onClick={toggleDialogInventory} className={`${styles.item} inventory-btn`}>
                {itemContent({label: "Inventaire", icon: "/img/icons/bag.png"})}
            </button>
            <InventoryModal isDialogInventoryShowed={isDialogInventoryShowed} toggleDialogInventory={toggleDialogInventory}/>
            <button type="button" onClick={toggleProfil} className={styles.item}>
                {itemContent({label: "Profil", icon: "/img/icons/people.png"})}
            </button>
            <ProfilModal isShowing={isProfilShowed} toggle={toggleProfil}/>
            <button type="button" onClick={toggleSpells} className={styles.item}>
                {itemContent({label: "Sorts", icon: "/img/menu/livre.png"})}
            </button>
            <SpellsModal isShowing={isSpellsShowed} toggle={toggleSpells}/>
            <button type="button" onClick={toggleAtelier} className={styles.item}>
                {itemContent({label: "Établi", icon: "/img/icons/bag.png"})}
            </button>
            <AtelierModal isShowing={isAtelierShowed} toggle={toggleAtelier}/>
            {linkItems.map(item => (
                <Link key={item.label} to={item.to} className={styles.item}>
                    {itemContent(item)}
                </Link>
            ))}
        </Panel>
    )
}

export default SideMenu
