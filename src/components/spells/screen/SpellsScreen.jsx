import React, {useEffect, useMemo, useState} from 'react'
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import UsersApi from "../../../services/UsersApi";
import Loader from "../../loader/Loader";
import Glyph from "../../ui/glyphs/Glyph";
import ModalShell from "../../ui/gameModal/ModalShell";
import styles from "./SpellsScreen.module.scss";

/**
 * Écran Sortilèges (maquette design/sorts) : grimoire à gauche, détail du sort
 * sélectionné + assignation à droite, barre de sorts (8 emplacements) en pied.
 * Les assignations sont persistées via /joueur/spell/equip|unequip ; la barre
 * d'action se rafraîchit via le bump spellBarVersion.
 */

const SLOT_COUNT = 8;

const TYPE_META = {
    attack: {label: "Attaque", accent: "attack"},
    soin: {label: "Soin", accent: "soin"},
    buff: {label: "Buff", accent: "buff"},
};

const typeMeta = (type) => TYPE_META[type] || {label: type, accent: "autre"};
const cooldownLabel = (cooldown) => cooldown > 0 ? `${cooldown} s` : "Instantané";
const porteeLabel = (portee) => portee > 0 ? `${portee} case${portee > 1 ? "s" : ""}` : "Personnel";

const SpellsScreen = ({onClose, updateJoueurState}) => {

    const [book, setBook] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        UsersApi.getSpellBook().then(spells => {
            setBook(spells);
            if (spells.length > 0) setSelectedId(spells[0].id);
        });
    }, []);

    // Emplacements effectifs de la barre : assignés à leur position, puis les
    // non-assignés dans l'ordre (comportement par défaut du jeu).
    const slots = useMemo(() => {
        const result = Array(SLOT_COUNT).fill(null);
        if (!book) return result;
        const assigned = book.filter(spell => spell.ordre >= 1 && spell.ordre <= SLOT_COUNT);
        if (assigned.length > 0) {
            assigned.forEach(spell => {
                if (!result[spell.ordre - 1]) result[spell.ordre - 1] = spell;
            });
            return result;
        }
        book.slice(0, SLOT_COUNT).forEach((spell, index) => {
            result[index] = spell;
        });
        return result;
    }, [book]);

    if (!book) {
        return (
            <ModalShell iconSrc="/img/menu/livre.png" title="Sortilèges" onClose={onClose}>
                <div className={styles.loading}><Loader/></div>
            </ModalShell>
        );
    }

    const selected = book.find(spell => spell.id === selectedId) || book[0];
    const hasCustomBar = book.some(spell => spell.ordre !== null);
    const equippedCount = hasCustomBar
        ? book.filter(spell => spell.ordre !== null).length
        : Math.min(book.length, SLOT_COUNT);

    const applyBook = (updatedBook) => {
        setBook(updatedBook);
        updateJoueurState({spellBarVersion: Date.now()});
    };

    const handleAssign = async (position) => {
        if (!selected) return;
        applyBook(await UsersApi.equipSpell(selected.id, position));
    };

    const handleUnassign = async () => {
        if (!selected) return;
        applyBook(await UsersApi.unequipSpell(selected.id));
    };

    const slotOf = (spell) => {
        const index = slots.findIndex(slot => slot && slot.id === spell.id);
        return index >= 0 ? index + 1 : null;
    };

    const footer = (
        <footer className={styles.hotbar}>
            <div className={styles.hotbarText}>
                <span className={styles.hotbarLabel}>Barre de sorts</span>
                <span className={styles.hotbarSub}>Ordre d'affichage en jeu</span>
            </div>
            <div className={styles.hotbarSlots}>
                {slots.map((spell, index) => {
                    const isSelected = spell && selected && spell.id === selected.id;
                    return (
                        <button key={index} type="button"
                                className={[
                                    styles.hotbarSlot,
                                    spell ? styles.hotbarSlotFilled : "",
                                    spell ? styles[typeMeta(spell.type).accent] : "",
                                    isSelected ? styles.hotbarSlotSelected : "",
                                ].filter(Boolean).join(" ")}
                                title={spell ? spell.nom : `Emplacement ${index + 1}`}
                                onClick={() => spell ? setSelectedId(spell.id) : handleAssign(index + 1)}>
                            <span className={`${styles.hotbarKey} ${spell ? styles.hotbarKeyFilled : ""}`}>
                                {index + 1}
                            </span>
                            {spell && <img className={styles.hotbarIcon} src={`/img/spell/${spell.icone}`} alt={spell.nom}/>}
                        </button>
                    );
                })}
            </div>
        </footer>
    );

    return (
        <ModalShell iconSrc="/img/menu/livre.png" title="Sortilèges"
                    subtitle={`${equippedCount} sorts équipés · ${book.length} appris`}
                    onClose={onClose} footer={footer}>
            <div className={styles.body}>
                {/* Grimoire */}
                <div className={styles.grimoire}>
                    <div className={styles.grimoireHead}>
                        <span className={styles.grimoireBar}/>
                        <span className={styles.grimoireTitle}>Grimoire</span>
                        <span className={styles.grimoireHint}>Sélectionne un sort pour l'assigner</span>
                    </div>
                    <div className={styles.spellList}>
                        {book.map(spell => {
                            const meta = typeMeta(spell.type);
                            const isSelected = selected && spell.id === selected.id;
                            const barSlot = slotOf(spell);
                            return (
                                <button key={spell.id} type="button"
                                        className={[
                                            styles.spellCard,
                                            styles[meta.accent],
                                            isSelected ? styles.spellCardSelected : "",
                                        ].filter(Boolean).join(" ")}
                                        onClick={() => setSelectedId(spell.id)}>
                                    <span className={styles.spellThumb}>
                                        <img className={styles.spellThumbImg} src={`/img/spell/${spell.icone}`} alt={spell.nom}/>
                                    </span>
                                    <span className={styles.spellInfo}>
                                        <span className={styles.spellNameRow}>
                                            <span className={styles.spellName}>{spell.nom}</span>
                                            <span className={styles.typeBadge}>{meta.label}</span>
                                        </span>
                                        <span className={styles.spellDesc}>{spell.description}</span>
                                        <span className={styles.spellChips}>
                                            <span className={styles.chip}>
                                                <Glyph name="clock" size={15} className={styles.chipGlyph}/>
                                                {cooldownLabel(spell.cooldown)}
                                            </span>
                                            <span className={styles.chip}>
                                                <Glyph name="target" size={15} className={styles.chipGlyph}/>
                                                {porteeLabel(spell.portee)}
                                            </span>
                                        </span>
                                    </span>
                                    <span className={styles.spellSlotColumn}>
                                        <span className={styles.spellSlotLabel}>Barre</span>
                                        <span className={`${styles.spellSlotValue} ${barSlot ? styles.spellSlotAssigned : ""}`}>
                                            {barSlot || "—"}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Détail + assignation */}
                {selected && (
                    <div className={`${styles.detail} ${styles[typeMeta(selected.type).accent]}`}>
                        <div className={styles.detailHead}>
                            <span className={styles.detailThumb}>
                                <img className={styles.detailThumbImg} src={`/img/spell/${selected.icone}`} alt={selected.nom}/>
                            </span>
                            <div className={styles.detailTitle}>
                                <span className={styles.detailName}>{selected.nom}</span>
                                <span className={styles.typeBadge}>{typeMeta(selected.type).label}</span>
                            </div>
                        </div>
                        <p className={styles.detailDesc}>{selected.description}</p>

                        <div className={styles.statRows}>
                            <div className={styles.statRow}>
                                <span className={`${styles.statIcon} ${styles.statIconGold}`}>
                                    <Glyph name="clock" size={18}/>
                                </span>
                                <span className={styles.statLabel}>Temps de recharge</span>
                                <span className={styles.statValue}>{cooldownLabel(selected.cooldown)}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={`${styles.statIcon} ${styles.statIconGreen}`}>
                                    <Glyph name="target" size={18}/>
                                </span>
                                <span className={styles.statLabel}>Portée</span>
                                <span className={styles.statValue}>{porteeLabel(selected.portee)}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={`${styles.statIcon} ${styles.statIconBlue}`}>
                                    <Glyph name="bolt" size={18}/>
                                </span>
                                <span className={styles.statLabel}>Type</span>
                                <span className={styles.statValue}>{typeMeta(selected.type).label}</span>
                            </div>
                        </div>

                        <span className={styles.assignLabel}>Emplacement dans la barre</span>
                        <div className={styles.slotPicker}>
                            {Array.from({length: SLOT_COUNT}, (_, index) => index + 1).map(position => {
                                const active = slotOf(selected) === position;
                                return (
                                    <button key={position} type="button"
                                            className={`${styles.slotButton} ${active ? styles.slotButtonActive : ""}`}
                                            onClick={() => handleAssign(position)}>
                                        {position}
                                    </button>
                                );
                            })}
                        </div>
                        {slotOf(selected) && hasCustomBar && (
                            <button type="button" className={styles.unassign} onClick={handleUnassign}>
                                Retirer de la barre
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ModalShell>
    );
}

export default connect(null, {updateJoueurState})(SpellsScreen)
