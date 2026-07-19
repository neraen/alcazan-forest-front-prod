import React, {useContext} from "react"
import authAPI from "../../../services/authAPI";
import {NavLink} from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import GameButton from "../../ui/gameButton/GameButton";
import {buttonClass} from "../../ui/gameButton/GameButton";
import styles from "./Navbar.module.scss";

const Navbar = ({history}) => {

    const {isAuthenticated, setIsAuthenticated, role } = useContext(AuthContext)

    const handleLogout = () => {
        authAPI.logout();
        setIsAuthenticated(false)
        history.push('/connexion')
    }

    const tabs = isAuthenticated
        ? [
            {label: "Carte", to: "/carte"},
            {label: "Profil", to: "/personnage"},
            {label: "Inventaire", to: "/inventaire"},
            ...(role.includes('ROLE_ADMIN') ? [{label: "Administration", to: "/administration"}] : []),
        ]
        : [
            {label: "Aperçu", to: "/preview"},
            {label: "À propos", to: "/about"},
        ];

    return (
        <header className={styles.header}>
            <NavLink to="/" className={styles.brand}>
                <img className={styles.logo} src="/img/alcazan_forest_logo2.png" alt="Logo Alcazan Forest"/>
                <span className={styles.brandText}>
                    <span className={styles.brandTitle}>Alcazan Forest</span>
                    <span className={styles.brandSubtitle}>MMORPG médiéval</span>
                </span>
            </NavLink>

            <nav className={styles.nav}>
                {tabs.map(tab => (
                    <NavLink key={tab.to} to={tab.to} className={styles.tab} activeClassName={styles.active}>
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            <div className={styles.actions}>
                {isAuthenticated
                    ? <GameButton onClick={handleLogout}>Déconnexion</GameButton>
                    : (
                        <>
                            <NavLink to="/inscription" className={buttonClass}>Inscription</NavLink>
                            <NavLink to="/connexion" className={buttonClass}>Connexion au jeu</NavLink>
                        </>
                    )
                }
            </div>
        </header>
    );
}

export default Navbar
