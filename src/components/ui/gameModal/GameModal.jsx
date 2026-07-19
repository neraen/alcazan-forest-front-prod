import React, {useEffect} from 'react'
import {createPortal} from "react-dom";
import styles from "./GameModal.module.scss";

/**
 * Conteneur de TOUTES les modales de jeu (inventaire, profil, PNJ, quêtes,
 * échoppes…). Gère uniquement le comportement :
 *  - superpose la ZONE DE CARTE quand l'hôte `#game-modal-root` existe
 *    (rendu par MapPage dans le cadre de la carte, via un portal) ;
 *  - repli : overlay plein écran sur les pages sans carte ;
 *  - backdrop flouté cliquable + touche Échap → onClose.
 * size : "fill" (défaut, le contenu remplit la zone) | "auto" (le contenu se
 * dimensionne lui-même et est centré — dialogues PNJ, quêtes…).
 * L'apparence du cadre est fournie par le contenu (voir ModalShell).
 */
const GameModal = ({isOpen, onClose, size = "fill", children}) => {

    useEffect(() => {
        if (!isOpen || !onClose) return;
        const handleKey = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const host = document.getElementById("game-modal-root");

    const overlay = (
        <div data-game-modal="" className={host ? styles.overlayLocal : styles.overlayFixed}>
            <div className={styles.backdrop} onClick={onClose}/>
            <div className={size === "auto" ? styles.contentAuto : styles.content}>
                {children}
            </div>
        </div>
    );

    return host ? createPortal(overlay, host) : overlay;
}

export default GameModal
