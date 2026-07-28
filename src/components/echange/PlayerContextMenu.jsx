import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import styles from "./PlayerContextMenu.module.scss";

/**
 * Menu contextuel (clic droit sur un autre joueur de la grille). Même patron que
 * ConsommableContextMenu : positionné en `fixed`, replié dans le viewport, fermeture
 * au clic extérieur / Échap / scroll.
 *
 * props :
 *  - pseudo : joueur visé
 *  - x / y : coordonnées d'ouverture (clientX / clientY)
 *  - disabled : trop loin pour proposer (le serveur revérifie de toute façon)
 *  - onProposer() : envoyer l'invitation d'échange
 *  - onClose()
 */
const PlayerContextMenu = ({pseudo, x, y, disabled, onProposer, onClose}) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({left: x, top: y});

    useLayoutEffect(() => {
        if (!ref.current) return;
        const {width, height} = ref.current.getBoundingClientRect();
        const margin = 10;
        let left = x;
        let top = y;
        if (left + width + margin > window.innerWidth) left = x - width;
        if (left < margin) left = margin;
        if (top + height + margin > window.innerHeight) top = window.innerHeight - height - margin;
        if (top < margin) top = margin;
        setPos({left, top});
    }, [x, y]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        const onScroll = () => onClose();
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [onClose]);

    return (
        <>
            <div className={styles.backdrop} onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}/>
            <div ref={ref} style={{left: pos.left, top: pos.top}} className={styles.menu}
                 onContextMenu={(e) => e.preventDefault()}>
                <div className={styles.title}>{pseudo}</div>
                <button type="button" className={styles.row} disabled={disabled}
                        onClick={() => { onProposer(); onClose(); }}>
                    <img className={styles.rowIcon} src="/img/gui/Money03.png" alt=""/>
                    <span className={styles.rowLabel}>
                        {disabled ? "Trop loin pour échanger" : "Proposer un échange"}
                    </span>
                </button>
            </div>
        </>
    );
}

export default PlayerContextMenu
