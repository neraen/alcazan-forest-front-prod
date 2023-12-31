import React from 'react'
import {Link} from "react-router-dom";

const SideMenu = (props) => {
    return <>
        <div className="side-menu" >
            <Link to="/carte" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/map.png" alt=""/>
                <span>Carte</span>
            </Link>
            <Link to="/inventaire" className="side-menu-link text-decoration-none">
                <img className="side-menu-icon" src="/img/icons/bag.png" alt=""/>
                <span>Inventaire</span>
            </Link>
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