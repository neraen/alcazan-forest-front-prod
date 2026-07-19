import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import styles from "./ConsommableContextMenu.module.scss";

/**
 * Menu contextuel (clic droit sur un consommable de la grille) : choisir sur
 * lequel des deux emplacements de la barre de sorts placer le consommable.
 * Fermeture au clic extérieur, à Échap et au scroll. Positionné en `fixed`,
 * replié pour rester dans le viewport.
 *
 * props :
 *  - item : consommable normalisé
 *  - x / y : coordonnées d'ouverture (clientX / clientY)
 *  - slots : [occupantOuNull, occupantOuNull] (positions 1 et 2)
 *  - onPick(position) : emplacement choisi (1 ou 2)
 *  - onClose()
 */
const ConsommableContextMenu = ({item, x, y, slots, onPick, onClose}) => {
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
                <div className={styles.title}>{item.name}</div>
                <div className={styles.subtitle}>Placer sur la barre</div>
                {[1, 2].map(position => {
                    const occupant = slots[position - 1];
                    const isHere = occupant && occupant.id === item.id;
                    return (
                        <button key={position} type="button" className={styles.row}
                                onClick={() => onPick(position)}>
                            <span className={styles.slotNum}>{position}</span>
                            {occupant
                                ? <img className={styles.slotIcon} src={`/img/consommables/${occupant.icone}`} alt={occupant.nom}/>
                                : <span className={styles.slotEmpty}>vide</span>}
                            <span className={styles.rowLabel}>
                                {isHere ? "Déjà ici" : occupant ? `Remplacer ${occupant.nom}` : "Emplacement libre"}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

export default ConsommableContextMenu
