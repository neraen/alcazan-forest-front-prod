import React, {useEffect, useMemo, useState} from "react";
import questApi from "../../../services/questApi";
import GameModal from "../../ui/gameModal/GameModal";
import ModalShell from "../../ui/gameModal/ModalShell";
import QueteDetail from "./QueteDetail";
import {etatQuete} from "./queteUtils";
import styles from "./QuetesModal.module.scss";

const ONGLETS = [
    {cle: "enCours", label: "En cours", vide: "Aucune quête en cours.", conseil: "Les personnages marqués d'une quête vous attendent : l'onglet « Disponibles » vous dit où les trouver."},
    {cle: "disponibles", label: "Disponibles", vide: "Aucune quête disponible pour l'instant.", conseil: "Gagnez des niveaux ou terminez vos quêtes en cours : de nouvelles se débloqueront."},
    {cle: "terminees", label: "Terminées", vide: "Aucune quête terminée.", conseil: "Vos exploits accomplis s'inscriront ici."},
];

/**
 * Journal de quêtes : « que dois-je faire, et où ? ».
 *
 * Liste à gauche (par onglet), fiche à droite. Le serveur fait foi sur tout ce qui est
 * affiché (étape, PNJ, lieu, progression, récompenses) : la modale ne calcule rien, elle
 * range. Rechargé à CHAQUE ouverture — la quête a pu avancer dans un dialogue de PNJ
 * entre-temps — et pas de slice Redux : personne d'autre n'a besoin de cet état
 * (même choix que l'hôtel des ventes).
 */
const QuetesModal = ({isShowing, toggle}) => {

    const [journal, setJournal] = useState(null);
    const [erreur, setErreur] = useState(false);
    const [onglet, setOnglet] = useState("enCours");
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        if (!isShowing) {
            setJournal(null);
            setErreur(false);
            return;
        }

        let actif = true;
        questApi.getJournal()
            .then((donnees) => {
                if (!actif) return;
                setJournal(donnees);
                // On ouvre là où il y a quelque chose à lire : un journal sans quête en
                // cours qui s'ouvrirait sur un onglet vide se lirait comme un bug.
                const premier = ONGLETS.find((o) => donnees[o.cle]?.length > 0)?.cle ?? "enCours";
                setOnglet(premier);
                setSelection(donnees[premier]?.[0]?.id ?? null);
            })
            .catch(() => actif && setErreur(true));

        return () => {
            actif = false;
        };
    }, [isShowing]);

    const liste = useMemo(() => journal?.[onglet] ?? [], [journal, onglet]);
    const fiche = liste.find((q) => q.id === selection) ?? liste[0] ?? null;
    const ongletCourant = ONGLETS.find((o) => o.cle === onglet);

    const changerOnglet = (cle) => {
        setOnglet(cle);
        setSelection(journal?.[cle]?.[0]?.id ?? null);
    };

    const sousTitre = journal
        ? [
            `${journal.enCours.length} en cours`,
            `${journal.terminees.length} terminée${journal.terminees.length > 1 ? "s" : ""}`,
        ].join(" · ")
        : "Vos aventures en cours";

    return (
        <GameModal isOpen={isShowing} onClose={toggle} size="fill">
            <ModalShell iconSrc="/img/icons/parchemin.png" title="Quêtes" subtitle={sousTitre} onClose={toggle}>
                <div className={styles.container}>
                    {erreur && <p className={styles.etat}>Le journal de quêtes est inaccessible pour le moment.</p>}
                    {!erreur && !journal && <p className={styles.etat}>Ouverture du journal…</p>}

                    {journal && (
                        <>
                            <aside className={styles.colonneListe}>
                                <div className={styles.tabs} role="tablist">
                                    {ONGLETS.map((o) => (
                                        <button key={o.cle} type="button" role="tab"
                                                aria-selected={onglet === o.cle}
                                                className={`${styles.tab} ${onglet === o.cle ? styles.tabActive : ""}`}
                                                onClick={() => changerOnglet(o.cle)}>
                                            <span className={styles.tabLabel}>{o.label}</span>
                                            <span className={styles.tabCompte}>{journal[o.cle].length}</span>
                                        </button>
                                    ))}
                                </div>

                                <ul className={styles.liste}>
                                    {liste.map((quete) => (
                                        <li key={quete.id}>
                                            <LigneQuete quete={quete}
                                                        active={fiche?.id === quete.id}
                                                        onClick={() => setSelection(quete.id)}/>
                                        </li>
                                    ))}
                                </ul>

                                {liste.length === 0 && (
                                    <div className={styles.listeVide}>
                                        <p className={styles.listeVideTitre}>{ongletCourant.vide}</p>
                                        <p className={styles.listeVideTexte}>{ongletCourant.conseil}</p>
                                    </div>
                                )}
                            </aside>

                            <section className={styles.colonneDetail}>
                                {fiche
                                    ? <QueteDetail key={`${onglet}-${fiche.id}`} quete={fiche}/>
                                    : (
                                        <div className={styles.detailVide}>
                                            <img className={styles.detailVideIcone} src="/img/icons/parchemin.png" alt=""/>
                                            <p>{ongletCourant.vide}</p>
                                        </div>
                                    )}
                            </section>
                        </>
                    )}
                </div>
            </ModalShell>
        </GameModal>
    );
};

/** Une ligne de la liste : nom, où en est la quête, pastille d'état. */
const LigneQuete = ({quete, active, onClick}) => {
    const etat = etatQuete(quete);

    return (
        <button type="button" onClick={onClick}
                className={`${styles.ligne} ${active ? styles.ligneActive : ""}`}>
            <span className={`${styles.ligneMarque} ${styles["marque_" + etat.ton]}`} aria-hidden="true"/>
            <span className={styles.ligneCorps}>
                <span className={styles.ligneNom}>{quete.nom}</span>
                <span className={styles.ligneMeta}>{etat.resume}</span>
            </span>
            <span className={`${styles.pastille} ${styles["pastille_" + etat.ton]}`}>{etat.label}</span>
        </button>
    );
};

export default QuetesModal;
