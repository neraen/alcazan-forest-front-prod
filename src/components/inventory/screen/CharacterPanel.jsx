import React from 'react'
import Glyph from "../../ui/glyphs/Glyph";
import {EQUIP_SLOTS, normalizeEquipement, rarityClass} from "./itemUtils";
import styles from "./CharacterPanel.module.scss";

/**
 * Fiche personnage de l'inventaire : paperdoll d'équipement (slots gauche/droite,
 * portrait au centre) + grille des bonus d'équipement.
 * Réutilisée par la page/modale Inventaire et par le profil d'un autre joueur.
 *
 * props :
 *  - character { pseudo, nomClasse, niveau }
 *  - equipements : liste d'équipements portés (forme API)
 *  - selectedKey / onSelect(item normalisé)
 *  - onUnequip(item) : optionnel, déclenché au double-clic sur un slot rempli
 *  - onHover(item, event) / onHoverEnd() : optionnel, étiquette d'info au survol
 *  - stats : objet bonus {armure, constitution, force, dexterite, intelligence,
 *            concentration, chance, critique} — masqué si absent
 */

const STAT_TILES = [
    {key: "armure", label: "Armure", glyph: "shield", className: "armure"},
    {key: "constitution", label: "Constitution", glyph: "heart", className: "constitution"},
    {key: "force", label: "Force", glyph: "strength", className: "force"},
    {key: "dexterite", label: "Dextérité", glyph: "target", className: "dexterite"},
    {key: "intelligence", label: "Intelligence", glyph: "wisdom", className: "intelligence"},
    {key: "concentration", label: "Concentration", glyph: "speed", className: "concentration"},
    {key: "chance", label: "Chance", glyph: "luck", className: "chance"},
    {key: "critique", label: "Critique", glyph: "sword", className: "critique"},
];

const CharacterPanel = ({character, equipements = [], selectedKey, onSelect, onUnequip, onHover, onHoverEnd, stats}) => {

    const byPosition = (position) => {
        const worn = equipements.find(e => e.position === position);
        return worn ? normalizeEquipement(worn, true) : null;
    };

    const renderSlot = (def) => {
        const item = byPosition(def.position);
        const isSelected = item && item.key === selectedKey;
        return (
            <div key={def.position} className={styles.slotWrap}>
                <button type="button"
                        className={[
                            styles.slot,
                            item ? styles.slotFilled : styles.slotEmpty,
                            item ? styles[rarityClass(item.rarity)] : "",
                            isSelected ? styles.slotSelected : "",
                        ].filter(Boolean).join(" ")}
                        onClick={item && onSelect ? () => onSelect(item) : undefined}
                        onDoubleClick={item && onUnequip ? () => onUnequip(item) : undefined}
                        onMouseEnter={item && onHover ? (e) => onHover(item, e) : undefined}
                        onMouseMove={item && onHover ? (e) => onHover(item, e) : undefined}
                        onMouseLeave={item && onHoverEnd ? () => onHoverEnd() : undefined}>
                    {item
                        ? <img className={styles.slotIcon} src={item.img} alt={item.name}/>
                        : <Glyph name={def.empty} size={34} className={styles.ghost}/>}
                    <span className={styles.slotLabel}>{def.label}</span>
                </button>
            </div>
        );
    };

    return (
        <div className={styles.panel}>
            <div className={styles.paperdoll}>
                <div className={styles.slotColumn}>
                    {EQUIP_SLOTS.left.map(renderSlot)}
                </div>

                <div className={styles.portraitBox}>
                    <div className={styles.portraitGlow}/>
                    <div className={styles.portraitFade}/>
                    <div className={styles.portraitRing}>
                        <img className={styles.portrait} src="/img/gui/CharacterPlayer/Avatar.png"
                             alt={`Portrait de ${character.pseudo}`}/>
                    </div>
                    <div className={styles.portraitName}>{character.pseudo}</div>
                    <div className={styles.portraitClass}>{character.nomClasse}</div>
                    <div className={styles.levelBadge}>
                        <span className={styles.levelLabel}>Niveau</span>
                        <span className={styles.levelValue}>{character.niveau}</span>
                    </div>
                </div>

                <div className={styles.slotColumn}>
                    {EQUIP_SLOTS.right.map(renderSlot)}
                </div>
            </div>

            {stats && (
                <div className={styles.stats}>
                    {STAT_TILES.map(tile => (
                        <div key={tile.key} className={`${styles.statTile} ${styles[tile.className]}`}>
                            <Glyph name={tile.glyph} size={22} className={styles.statGlyph}/>
                            <span className={styles.statValue}>+{stats[tile.key] || 0}</span>
                            <span className={styles.statLabel}>{tile.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CharacterPanel
