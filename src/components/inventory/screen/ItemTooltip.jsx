import React, {useLayoutEffect, useRef, useState} from 'react'
import {CAT_LABEL, RARITY_LABEL, rarityClass} from "./itemUtils";
import styles from "./ItemTooltip.module.scss";

/**
 * Étiquette d'information affichée au survol d'un objet (grille du sac ou
 * emplacement d'équipement). Positionnée en `fixed` près du curseur, repliée
 * pour rester dans le viewport. Aucune interaction : `pointer-events: none`.
 *
 * props :
 *  - item : objet normalisé (voir itemUtils) — rien n'est rendu si absent
 *  - x / y : coordonnées du curseur (clientX / clientY)
 */
const OFFSET = 16;

const ItemTooltip = ({item, x, y}) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({left: x + OFFSET, top: y + OFFSET});

    useLayoutEffect(() => {
        if (!item || !ref.current) return;
        const {width, height} = ref.current.getBoundingClientRect();
        const margin = 12;
        let left = x + OFFSET;
        let top = y + OFFSET;
        if (left + width + margin > window.innerWidth) left = x - width - OFFSET;
        if (left < margin) left = margin;
        if (top + height + margin > window.innerHeight) top = window.innerHeight - height - margin;
        if (top < margin) top = margin;
        setPos({left, top});
    }, [item, x, y]);

    if (!item) return null;

    return (
        <div ref={ref} style={{left: pos.left, top: pos.top}}
             className={`${styles.tooltip} ${styles[rarityClass(item.rarity)]}`}>
            <div className={styles.header}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.meta}>
                    <span className={styles.rarity}>{RARITY_LABEL[item.rarity] || item.rarity}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.type}>{CAT_LABEL[item.cat]}</span>
                    {item.equipped && <span className={styles.equipped}>Équipé</span>}
                </span>
            </div>

            {item.caracteristiques.length > 0 && (
                <div className={styles.caracs}>
                    {item.caracteristiques.map(carac => (
                        <span key={carac.id} className={styles.carac}>+{carac.valeur} {carac.nom}</span>
                    ))}
                </div>
            )}

            {item.desc && <div className={styles.desc}>{item.desc}</div>}

            <div className={styles.footer}>
                <span className={styles.value}>
                    <img className={styles.coin} src="/img/gui/Money03.png" alt=""/>
                    {item.value} po
                </span>
                {item.levelMin != null && (
                    <span className={styles.levelMin}>Niv. requis {item.levelMin}</span>
                )}
                {item.qty > 1 && <span className={styles.qty}>×{item.qty}</span>}
            </div>
        </div>
    );
}

export default ItemTooltip
