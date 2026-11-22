import React from "react";
import Slot from "../../ui/slot/Slot";
import useEffetsActifs from "./useEffetsActifs";
import {dureeCourte, dureeLongue, libelleCarac, signe} from "./effetsUtils";
import styles from "./Buff.module.scss";

/** Places par ligne : le serveur plafonne pareil (`EffetConfig::MAX_BIENFAITS` / `MAX_AFFAIBLISSEMENTS`). */
const PLACES_PAR_LIGNE = 3;

/**
 * Grille compacte 3 × 2 des effets actifs de la barre de sorts (mini-slots 25 px) :
 * ligne du HAUT = bienfaits, ligne du BAS = affaiblissements. La séparation suit la règle
 * serveur — deux plafonds distincts — et se lit d'un coup d'œil : du rouge en bas, c'est
 * qu'on vous a eu.
 *
 * Chaque case porte son compte à rebours ; l'infobulle détaille l'effet (contrôle,
 * caractéristiques, temps restant).
 */
const Buff = () => {
    const {bienfaits, affaiblissements} = useEffetsActifs();

    const ligne = (effets, nefaste) => {
        const visibles = effets.slice(0, PLACES_PAR_LIGNE);
        return [
            ...visibles.map((effet) => <CaseEffet key={effet.userBuffId ?? effet.id} effet={effet}/>),
            ...[...Array(PLACES_PAR_LIGNE - visibles.length)].map((x, i) =>
                <Slot size="mini" key={(nefaste ? "a" : "b") + i}
                      className={nefaste ? styles.videNefaste : ""}/>
            ),
        ];
    };

    return (
        <div className={styles.grid}>
            {ligne(bienfaits, false)}
            {ligne(affaiblissements, true)}
        </div>
    );
};

const CaseEffet = ({effet}) => {
    const classes = [
        styles.cell,
        effet.nefaste ? styles.nefaste : styles.bienfait,
        effet.controle ? styles.controle : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            <Slot size="mini" src={"/img/spell/" + effet.icone} alt={effet.name}>
                <span className={styles.compteur}>{dureeCourte(effet.restant)}</span>
            </Slot>
            <div className={styles.tooltip} role="tooltip">
                <div className={styles.tooltipHead}>
                    <strong>{effet.name}</strong>
                    <span className={effet.nefaste ? styles.tagNefaste : styles.tagBienfait}>
                        {effet.nefaste ? "Affaiblissement" : "Bienfait"}
                    </span>
                </div>
                {effet.controleLabel && (
                    <div className={styles.tooltipControle}>
                        <strong>{effet.controleLabel}</strong> — {effet.controleDescription}
                    </div>
                )}
                {(effet.caracteristiques || []).map(({nom, value}) => (
                    <div key={nom} className={Number(value) < 0 ? styles.malus : styles.bonus}>
                        {signe(Number(value))} {libelleCarac(nom)}
                    </div>
                ))}
                <div className={styles.tooltipTemps}>Encore {dureeLongue(effet.restant)}</div>
            </div>
        </div>
    );
};

export default Buff;
