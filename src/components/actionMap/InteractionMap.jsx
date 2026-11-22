import React, {useEffect, useRef, useState} from 'react'
import {createPortal} from "react-dom";
import GameModal from "../ui/gameModal/GameModal";
import ModalShell from "../ui/gameModal/ModalShell";
import GameButton from "../ui/gameButton/GameButton";
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
export const InteractionMap = (props) => {

    const repereRef = useRef(null);
    const ficheRef = useRef(null);
    const [apercuOuvert, setApercuOuvert] = useState(false);
    const [bulle, setBulle] = useState(null);
    const [imageAbsente, setImageAbsente] = useState(false);
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
    const disponible = etat?.disponible === true && !gisementEpuise && restant === 0;
    const modes = props.modesRecolte || [];
    const skin = etat?.skin ?? interaction.skin;
    const image = skin ? `/img/interaction/${skin}.png` : null;
    const nom = etat?.nom || interaction.nom;
    const statut = gisementEpuise ? "Gisement épuisé" : restant > 0 ? "En repousse"
        : indisponible ? "Indisponible" : etat ? "Disponible" : "À inspecter";
    useEffect(() => setImageAbsente(false), [image]);

    useEffect(() => {
        if (!apercuOuvert) return undefined;
        ficheRef.current?.focus();
        const repere = repereRef.current;
        return () => repere?.focus();
    }, [apercuOuvert]);

    const montrerBulle = () => {
        if (apercuOuvert || choixOuvert) return;
        const rect = repereRef.current?.getBoundingClientRect();
        if (!rect) return;
        const largeur = Math.min(250, window.innerWidth - 16);
        setBulle({left: Math.max(8, Math.min(rect.left + rect.width / 2 - largeur / 2,
            window.innerWidth - largeur - 8)), width: largeur,
            ...(rect.top > 180 ? {bottom: window.innerHeight - rect.top + 8} : {top: rect.bottom + 8})});
    };

    useEffect(() => {
        if (!bulle) return undefined;
        const fermer = () => setBulle(null);
        const clavier = event => { if (event.key === "Escape") fermer(); };
        window.addEventListener("scroll", fermer, true);
        window.addEventListener("resize", fermer);
        window.addEventListener("keydown", clavier);
        return () => {
            window.removeEventListener("scroll", fermer, true);
            window.removeEventListener("resize", fermer);
            window.removeEventListener("keydown", clavier);
        };
    }, [bulle]);

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
        setApercuOuvert(false);
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

    const details = (
        <>
            <strong>{nom}</strong>
            <span className={styles.statut}>{statut}{restant > 0 ? ` · ${enClair(restant)}` : ""}</span>
            {etat?.raison && <span>{etat.raison}</span>}
            {etat && <span className={styles.cout}>{etat.coutPa || 0} PA</span>}
        </>
    );

    return (
        <>
            <button type="button" ref={repereRef}
                 className={`${styles.interaction} ${indisponible ? styles.indisponible : ""}`
                 + `${gisementEpuise ? " " + styles.epuise : ""}`
                 + `${disponible ? " " + styles.disponible : ""}`}
                 onClick={event => { event.stopPropagation(); setBulle(null); setApercuOuvert(true); }}
                 onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) montrerBulle(); }}
                 onMouseLeave={() => setBulle(null)} onFocus={montrerBulle} onBlur={() => setBulle(null)}
                 onKeyDown={event => { event.stopPropagation(); if (event.key === "Escape") setBulle(null); }}
                 aria-label={`${nom} — ${statut}. Inspecter`} aria-haspopup="dialog">
                {image && !imageAbsente ? (
                    <img className={styles.skin} src={image} alt="" draggable="false"
                         onError={() => setImageAbsente(true)}/>
                ) : <span className={styles.repere} aria-hidden="true">✦</span>}
                <span className={styles.eclat} aria-hidden="true">{gisementEpuise ? "×" : restant > 0 ? "⌛" : "✦"}</span>
                {restant > 0 && <span className={styles.compte}>{enClair(restant)}</span>}
            </button>

            {bulle && createPortal(
                <div className={styles.infobulle} style={bulle} role="tooltip">{details}</div>, document.body
            )}

            {apercuOuvert && (
                <GameModal isOpen onClose={() => setApercuOuvert(false)} size="auto">
                    <div role="dialog" aria-modal="true" aria-label={nom} className={styles.fiche}
                         ref={ficheRef} tabIndex={-1}
                         onClick={event => event.stopPropagation()}
                         onKeyDown={event => {
                             event.stopPropagation();
                             if (event.key === "Escape") setApercuOuvert(false);
                             if (event.key === "Tab") {
                                 const boutons = ficheRef.current.querySelectorAll("button:not(:disabled)");
                                 const premier = boutons[0], dernier = boutons[boutons.length - 1];
                                 if (event.shiftKey && (document.activeElement === premier || document.activeElement === ficheRef.current)) {
                                     event.preventDefault(); dernier?.focus();
                                 } else if (!event.shiftKey && document.activeElement === dernier) {
                                     event.preventDefault(); premier?.focus();
                                 }
                             }
                         }}>
                        <ModalShell fit="content" title={nom} subtitle="Ressource et disponibilité"
                                    onClose={() => setApercuOuvert(false)}>
                            <div className={styles.ficheCorps}>
                                {image && !imageAbsente && <img src={image} alt="" className={styles.apercu}/>}
                                <div className={styles.details}>{details}</div>
                                <GameButton onClick={declencher} disabled={enCours}>
                                    {enCours ? "En cours…" : etat?.verbe || interaction.verbe || "Interagir"}
                                </GameButton>
                            </div>
                        </ModalShell>
                    </div>
                </GameModal>
            )}

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
