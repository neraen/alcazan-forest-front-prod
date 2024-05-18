import React from 'react'
import {Link} from "react-router-dom";
import useModal from "../../../hooks/useModal";
import InventoryModal from "../../modals/inventoryModal/InventoryModal";

const SideMenu = (props) => {
    const { isShowing: isDialogInventoryShowed, toggle: toggleDialogInventory } = useModal();
    return <>
        <div className="side-menu" >
            <Link to="/carte" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/map.png" alt=""/>
                <span>Carte</span>
            </Link>
            <div onClick={toggleDialogInventory} className="side-menu-link text-decoration-none inventory-btn">
                <img className="side-menu-icon" src="/img/icons/bag.png" alt=""/>
                <span>Inventaire</span>
                <InventoryModal isDialogInventoryShowed={isDialogInventoryShowed} toggleDialogInventory={toggleDialogInventory}/>
            </div>
            <Link to="/personnage/profil" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/people.png" alt=""/>
                <span>Profil</span>
            </Link>
            <Link to="/guilde" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/flag.png" alt=""/>
                <span>Guilde</span>
            </Link>
            <Link to="/historique" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/book.png" alt=""/>
                <span>Journal</span>
            </Link>
            <Link className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/shild.png" alt=""/>
                <span>Classement</span>
            </Link>

        </div>
    </>
}

export default SideMenu