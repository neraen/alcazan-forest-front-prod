import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../store/actions";
import InteractionApi from "../../services/InteractionApi";
import ChoixRecolte from "./ChoixRecolte";
import styles from "./InteractionMap.module.scss";

/** Secondes restantes avant rechargement, recalculées depuis l'horloge SERVEUR. */
const secondesRestantes = (disponibleAt) => {
    if(!disponibleAt){
        return 0;
    }
    return Math.max(0, Math.ceil((new Date(disponibleAt).getTime() - Date.now()) / 1000));
};

const enClair = (secondes) => {
    if(secondes >= 3600){
        return `${Math.ceil(secondes / 3600)} h`;
    }
    if(secondes >= 60){
        return `${Math.ceil(secondes / 60)} min`;
    }
    return `${secondes} s`;
};

/**
 * Point interactif posé sur une case : ressource, coffre, levier.
 *
 * Il n'évalue AUCUNE condition. Métier, niveau, points d'action, proximité et
 * rechargement sont arbitrés par le serveur ; l'état affiché ici (grisé, compte à rebours,
 * infobulle) vient de `decrire()` et n'est qu'un confort. Cliquer une case indisponible
 * reste possible : le serveur répond par la vraie raison.
 *
 * Le compte à rebours est recalculé depuis `disponibleAt` (date serveur) à chaque seconde,
 * jamais décompté localement — un onglet en arrière-plan dériverait sinon.
 */
const InteractionMap = (props) => {

    const [enCours, setEnCours] = useState(false);
    const [etatLocal, setEtatLocal] = useState(null);
    const [choixOuvert, setChoixOuvert] = useState(false);
    const [, forcerRendu] = useState(0);

    const {interaction} = props;
    const etat = etatLocal ?? props.etat ?? null;
    const restant = etat ? secondesRestantes(etat.disponibleAt) : 0;
    const indisponible = etat ? !etat.disponible : false;
    // « J'ai récolté trop tôt » et « quelqu'un a saigné le filon » n'appellent ni le même
    // repère ni la même réaction : le second se distingue à l'œil.
    const gisementEpuise = etat ? !!etat.gisementEpuise : false;
    const modes = props.modesRecolte || [];

    // Horloge d'AFFICHAGE seulement : la valeur est toujours recalculée depuis la date.
    useEffect(() => {
        if(restant <= 0){
            return undefined;
        }
        const minuteur = setInterval(() => forcerRendu(v => v + 1), 1000);

        return () => clearInterval(minuteur);
    }, [restant]);

    // Un rechargement de carte doit reprendre la main sur l'état local.
    useEffect(() => { setEtatLocal(null); }, [props.etat]);

    const executer = async (mode = null) => {
        if(enCours){
            return;
        }
        setEnCours(true);
        try {
            const reponse = await InteractionApi.executer(interaction.carteCarreauId, mode);
            reponse.messages.forEach(message => toast.info(message));
            setEtatLocal(reponse.etat);
            props.updateJoueurState({pa: reponse.pa, needRefresh: reponse.needRefresh});
        } catch (erreur) {
            toast.error(erreur.response?.data?.error || "Une erreur est survenue.");
        } finally {
            setEnCours(false);
        }
    }

    const declencher = (event) => {
        event.stopPropagation();
        if(enCours){
            return;
        }
        // Un gisement qui propose le choix demande d'abord au joueur COMMENT prélever.
        // Sur une case indisponible on n'ouvre rien : on laisse partir la requête pour
        // que le serveur donne lui-même la vraie raison du refus.
        if(etat?.recolteChoix && etat.disponible && modes.length > 0){
            setChoixOuvert(true);
            return;
        }
        executer();
    }

    const choisir = (mode) => {
        setChoixOuvert(false);
        executer(mode);
    }

    const infobulle = etat
        ? (etat.disponible
            ? `${etat.verbe} : ${etat.nom}${etat.coutPa ? ` (${etat.coutPa} PA)` : ""}`
            : `${etat.nom} — ${etat.raison}`)
        : `${interaction.verbe} : ${interaction.nom}`;

    return (
        <>
            <div className={`${styles.interaction} ${indisponible ? styles.indisponible : ""}`
                 + `${gisementEpuise ? " " + styles.epuise : ""}`}
                 onClick={declencher}
                 title={infobulle}>
                {/* Repère TOUJOURS visible, sous l'image : une case interactive dont l'image
                    manque resterait sinon un carré cliquable invisible, introuvable en jeu.
                    L'image, quand elle existe, le recouvre. */}
                <span className={styles.repere} aria-hidden="true"/>
                {interaction.skin && (
                    <img className={styles.skin}
                         src={`/img/interaction/${interaction.skin}.png`}
                         alt={interaction.nom}
                         onError={(event) => { event.target.style.display = "none"; }}/>
                )}
                {restant > 0 && <span className={styles.compte}>{enClair(restant)}</span>}
            </div>

            {choixOuvert && (
                <ChoixRecolte nom={etat?.nom || interaction.nom}
                              coutPa={etat?.coutPa || 0}
                              modes={modes}
                              onChoisir={choisir}
                              onFermer={() => setChoixOuvert(false)}/>
            )}
        </>
    )
}

export default connect(null, {updateJoueurState})(InteractionMap)
