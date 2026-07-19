import React from 'react'
import {CAT_LABEL, RARITY_LABEL, rarityClass} from "./itemUtils";
import styles from "./ItemDetailBar.module.scss";

/**
 * Barre de détail de l'objet sélectionné (pied de l'inventaire) : vignette,
 * nom + rareté + type, caractéristiques, description, valeur, action optionnelle.
 *
 * props :
 *  - item : objet normalisé (voir itemUtils) — rien n'est rendu si absent
 *  - actionLabel / onAction : bouton principal optionnel (Équiper / Retirer)
 *  - consommableSlots : [occupantOuNull, occupantOuNull] — emplacements de la barre
 *    de sorts (positions 1 et 2), affichés quand item est un consommable
 *  - onEquipConsommable(position) : placer le consommable sur l'emplacement 1/2
 */
const ItemDetailBar = ({item, actionLabel, onAction, consommableSlots, onEquipConsommable}) => {
    if (!item) {
        return (
            <footer className={styles.bar}>
                <span className={styles.placeholder}>Sélectionnez un objet pour voir son détail.</span>
            </footer>
        );
    }

    return (
        <footer className={`${styles.bar} ${styles[rarityClass(item.rarity)]}`}>
            <div className={styles.thumb}>
                <img className={styles.thumbIcon} src={item.img} alt={item.name}/>
            </div>

            <div className={styles.info}>
                <div className={styles.titleRow}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.rarityBadge}>{RARITY_LABEL[item.rarity] || item.rarity}</span>
                    <span className={styles.type}>
                        {CAT_LABEL[item.cat]}{item.equipped ? " · Équipé" : ""}
                    </span>
                </div>
                {item.caracteristiques.length > 0 && (
                    <div className={styles.caracs}>
                        {item.caracteristiques.map(carac => (
                            <span key={carac.id} className={styles.carac}>
                                +{carac.valeur} {carac.nom}
                            </span>
                        ))}
                    </div>
                )}
                <div className={styles.desc}>{item.desc}</div>
                <div className={styles.metaRow}>
                    <img className={styles.coin} src="/img/gui/Money03.png" alt="Or"/>
                    <span className={styles.value}>{item.value} Pièces d'or</span>
                    {item.levelMin != null && (
                        <span className={styles.levelMin}>Niveau requis : {item.levelMin}</span>
                    )}
                </div>
            </div>

            {item.cat === "consommable" && onEquipConsommable && (
                <div className={styles.equipSlots}>
                    <span className={styles.equipHint}>Placer sur la barre</span>
                    <div className={styles.slotRow}>
                        {[1, 2].map(position => {
                            const occupant = (consommableSlots || [])[position - 1];
                            const isHere = occupant && occupant.id === item.id;
                            return (
                                <button key={position} type="button"
                                        className={`${styles.equipSlot} ${isHere ? styles.equipSlotActive : ""}`}
                                        title={isHere ? "Déjà sur cet emplacement" : occupant ? `Remplacer ${occupant.nom}` : "Emplacement libre"}
                                        onClick={() => onEquipConsommable(position)}>
                                    <span className={styles.equipSlotNum}>{position}</span>
                                    {occupant
                                        ? <img className={styles.equipSlotIcon}
                                               src={`/img/consommables/${occupant.icone}`} alt={occupant.nom}/>
                                        : <span className={styles.equipSlotGhost}>+</span>}
                                    {isHere && <span className={styles.equipSlotCheck}>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {actionLabel && (
                <button type="button" className={styles.primary} onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </footer>
    );
}

export default ItemDetailBar
