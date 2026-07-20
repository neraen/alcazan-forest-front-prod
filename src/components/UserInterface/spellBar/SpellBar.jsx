import React, {useEffect, useRef, useState} from 'react'
import {connect} from "react-redux";
import Spell from "../../spells/spell/Spell";
import UsersApi from "../../../services/UsersApi";
import Consommable from "../../consommable/Consommable";
import Buff from "../../spells/buff/Buff";
import UserStatsBlock from "../userStatsBlock/UserStatsBlock";
import GaugeBar from "../../ui/gaugeBar/GaugeBar";
import Slot from "../../ui/slot/Slot";
import styles from "./SpellBar.module.scss";

const SPELL_SLOT_COUNT = 8;
const CONSOMMABLE_SLOT_COUNT = 2;

/**
 * Barre d'action sous la carte : ligne XP + slots de sorts, potions et buffs.
 * La classe js-spell-bar est un hook pour intro.js.
 */
const SpellBar = (props) => {

    const [experienceData, setExperienceData] = useState({experienceActuelle : 0, experienceMax: 0});
    const [spells, setSpells] = useState();
    const [allDisabled, setAllDisabled] = useState(false);
    const [consommables, setConsommables] = useState();
    const previousLevel = useRef(props.level);

    useEffect(() => {
        if(experienceData.experienceMax === 0){
            getExpJoueur()
        }

        getPlayerSpells()
    }, [])

    // À chaque montée de niveau (quête ou monstre), on re-fetch l'XP courante ET
    // le palier max : sans ça, le dénominateur de la barre restait figé sur
    // l'ancien niveau (barre affichant le surplus, ex. 184000/12000).
    useEffect(() => {
        if(previousLevel.current !== props.level && props.level > 0){
            getExpJoueur()
        }
        previousLevel.current = props.level;
    }, [props.level])

    // Rafraîchit les consommables de la barre quand l'inventaire en équipe un
    // sur un emplacement (bump de consommableBarVersion). Ignore le montage initial.
    useEffect(() => {
        if(props.consommableBarVersion){
            refreshConsommables()
        }
    }, [props.consommableBarVersion])

    // Rafraîchit les sorts quand l'écran Sorts modifie les assignations.
    useEffect(() => {
        if(props.spellBarVersion){
            refreshSpells()
        }
    }, [props.spellBarVersion])

    const getExpJoueur = async () => {
       const experienceJoueur = await UsersApi.getExpJoueur();
       setExperienceData(experienceJoueur);
    }

    const getPlayerSpells = async () => {
        const spells = await UsersApi.getPlayerSpells();
        const consommables = await UsersApi.getPlayerConsommables();
        setSpells(spells);
        setConsommables(consommables);

        props.setSpellsLoaded(true);
    }

    const refreshConsommables = async () => {
        const consommables = await UsersApi.getPlayerConsommables();
        setConsommables(consommables);
    }

    const refreshSpells = async () => {
        const spells = await UsersApi.getPlayerSpells();
        setSpells(spells);
    }

    // Place chaque sort sur son emplacement assigné (ordre 1-8) ; les sorts sans
    // assignation remplissent les emplacements libres dans l'ordre.
    const spellSlots = () => {
        const slots = Array(SPELL_SLOT_COUNT).fill(null);
        const unplaced = [];
        (spells || []).forEach(spell => {
            const index = spell.ordre >= 1 && spell.ordre <= SPELL_SLOT_COUNT ? spell.ordre - 1 : -1;
            if (index >= 0 && !slots[index]) {
                slots[index] = spell;
            } else {
                unplaced.push(spell);
            }
        });
        unplaced.forEach(spell => {
            const free = slots.findIndex(slot => slot === null);
            if (free >= 0) slots[free] = spell;
        });
        return slots;
    }

    const setAllSpellDisabled = (isDisabled) => {
        setAllDisabled(isDisabled)
    }

    const experienceActuelle = props.newExperience !== 0 ? props.newExperience : experienceData.experienceActuelle;

    return (
        <div className={`js-spell-bar ${styles.actionBar}`}>
            <div className={styles.xpRow}>
                <span className={styles.xpLabel}>XP</span>
                <GaugeBar className={styles.xpGauge} variant="xp" showValues={false}
                          value={experienceActuelle} max={experienceData.experienceMax}/>
                <span className={styles.xpValues}>{experienceActuelle} / {experienceData.experienceMax}</span>
            </div>

            <div className={styles.actions}>
                <div className={styles.slotGroup}>
                    {spells && spellSlots().map((spell, i) => spell
                        ? <Spell allDisabled={allDisabled} setAllSpellDisabled={setAllSpellDisabled} key={spell.id} spell={spell} />
                        : <Slot key={"empty-" + i}/>
                    )}
                </div>

                <div className={styles.divider}/>

                <div className={styles.slotGroup}>
                    {consommables && consommables.map(consommable => (
                        <Consommable key={consommable.id} consommable={consommable} />
                    ))}
                    {consommables && [...Array(Math.max(0, CONSOMMABLE_SLOT_COUNT - consommables.length))].map((x, i) =>
                        <Slot key={i}/>
                    )}
                </div>

                <div className={styles.divider}/>

                <Buff />

                <UserStatsBlock />
            </div>
        </div>
    )
}
export default connect((state) => ({
    consommableBarVersion: state.data.joueurState.consommableBarVersion,
    spellBarVersion: state.data.joueurState.spellBarVersion,
    level: state.data.joueurState.level
}))(SpellBar)
