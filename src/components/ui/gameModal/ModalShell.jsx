import React from 'react'
import styles from "./ModalShell.module.scss";

/**
 * Cadre standard des modales de jeu : panneau or radius 18, en-tête (icône,
 * titre Cinzel, sous-titre, zone droite, bouton ✕), corps flexible, pied
 * optionnel. Remplit son conteneur (GameModal ou cadre de page).
 * fit="content" : le cadre se dimensionne sur son contenu (dialogues) au lieu
 * de remplir — à utiliser avec GameModal size="auto".
 * Le contenu du corps gère sa propre mise en page (padding compris).
 */
const ModalShell = ({iconSrc, title, subtitle, headerRight, footer, onClose, children, fit = "fill", className = ""}) => (
    <div className={`${styles.shell} ${fit === "content" ? styles.fitContent : ""} ${className}`}>
        <header className={styles.header}>
            {iconSrc && (
                <div className={styles.iconBox}>
                    <img className={styles.icon} src={iconSrc} alt=""/>
                </div>
            )}
            <div className={styles.titles}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
            <div className={styles.headerRight}>
                {headerRight}
                {onClose && (
                    <button type="button" className={styles.close} onClick={onClose}>✕</button>
                )}
            </div>
        </header>
        <div className={styles.body}>{children}</div>
        {footer}
    </div>
)

export default ModalShell
