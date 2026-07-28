import React from "react";
import GameModal from "../ui/gameModal/GameModal";
import ModalShell from "../ui/gameModal/ModalShell";
import GameButton from "../ui/gameButton/GameButton";
import styles from "./DonjonEntreeModal.module.scss";

/**
 * Modale d'entrée d'un donjon : on y choisit d'y aller seul, de monter un groupe ou
 * d'en rejoindre un. Composant de PRÉSENTATION — aucun appel API, aucune règle : tout
 * arrive en props depuis DonjonHost, et l'état affiché est le payload du serveur.
 */

const heureLocale = (iso) => new Date(iso).toLocaleString('fr-FR', {
    weekday: 'long', hour: '2-digit', minute: '2-digit'
});

const Pastille = ({membre}) => (
    <li className={styles.membre}>
        <span className={styles.membrePseudo}>{membre.pseudo}</span>
        {membre.classe && <span className={styles.membreClasse}>{membre.classe}</span>}
        {membre.estMeneur && <span className={styles.meneur}>meneur</span>}
    </li>
);

const DonjonEntreeModal = ({
    etat, monId, enCours,
    onEntrerSeul, onCreerGroupe, onRejoindre, onQuitter, onLancer, onClose
}) => {

    if(!etat){
        return null;
    }

    const {donjon, verrou, monGroupe, groupes} = etat;
    const jeSuisMeneur = monGroupe && monGroupe.meneurId === monId;
    const placesLibres = monGroupe ? monGroupe.places - monGroupe.membres.length : donjon.tailleGroupeMax;

    // Le verrou du jour est consommé ET son expédition s'est refermée (durée écoulée) :
    // plus rien n'est possible ici avant le reset. On ne propose alors AUCUNE entrée —
    // ni retour, ni groupe : le serveur les refuserait toutes, et un bouton qui répond
    // « revenez après 5 h » se lit comme un bug plutôt que comme une règle.
    const porteClose = verrou.consomme && !verrou.rejoignable;
    const peutTenterUneEntree = !porteClose;

    return (
        <GameModal isOpen={true} onClose={onClose} size="auto">
            <ModalShell fit="content"
                        title={donjon.nom}
                        subtitle={`Niveau ${donjon.niveauMin} minimum · ${donjon.tailleGroupeMax} joueurs maximum`}
                        onClose={onClose}>
                <div className={styles.corps}>

                    {donjon.description && <p className={styles.description}>{donjon.description}</p>}

                    {/* Verrou consommé ≠ porte close tant que l'expédition tient encore :
                        on y retourne. Une fois sa durée écoulée, la seule information utile
                        est l'heure du prochain reset. */}
                    {verrou.consomme && (
                        <p className={styles.verrou}>
                            {verrou.rejoignable ? (
                                <>
                                    Vous avez déjà ouvert le {donjon.nom} aujourd'hui. Vous pouvez retourner
                                    dans votre expédition en cours ; une nouvelle sera possible {heureLocale(verrou.prochainReset)}.
                                </>
                            ) : (
                                <>
                                    Votre expédition du jour dans le {donjon.nom} s'est refermée : sa durée
                                    est écoulée. Une nouvelle sera possible {heureLocale(verrou.prochainReset)}.
                                </>
                            )}
                        </p>
                    )}

                    {monGroupe ? (
                        <section className={styles.section}>
                            <h2 className={styles.titreSection}>
                                Votre groupe <span className={styles.compteur}>{monGroupe.membres.length}/{monGroupe.places}</span>
                            </h2>
                            <ul className={styles.membres}>
                                {monGroupe.membres.map(membre => <Pastille key={membre.userId} membre={membre}/>)}
                            </ul>
                            {placesLibres > 0 && (
                                <p className={styles.attente}>
                                    {placesLibres === 1 ? "Une place libre" : `${placesLibres} places libres`} —
                                    les autres joueurs vous rejoignent depuis cette même porte.
                                </p>
                            )}
                            <div className={styles.actions}>
                                {jeSuisMeneur && (
                                    <GameButton onClick={onLancer} className={enCours ? styles.desactive : ""}>
                                        Entrer dans le donjon
                                    </GameButton>
                                )}
                                <GameButton className={`${styles.discret} ${enCours ? styles.desactive : ""}`} onClick={onQuitter}>
                                    {jeSuisMeneur ? "Dissoudre le groupe" : "Quitter le groupe"}
                                </GameButton>
                            </div>
                            {!jeSuisMeneur && (
                                <p className={styles.attente}>En attente du meneur…</p>
                            )}
                        </section>
                    ) : (
                        <>
                            {peutTenterUneEntree && (
                                <section className={styles.section}>
                                    <div className={styles.actions}>
                                        <GameButton onClick={onEntrerSeul} className={enCours ? styles.desactive : ""}>
                                            {verrou.consomme ? "Retourner dans mon expédition" : "Entrer seul"}
                                        </GameButton>
                                        <GameButton className={`${styles.discret} ${enCours ? styles.desactive : ""}`}
                                                    onClick={onCreerGroupe}>
                                            Monter un groupe
                                        </GameButton>
                                    </div>
                                </section>
                            )}

                            <section className={styles.section}>
                                <h2 className={styles.titreSection}>Groupes en formation</h2>
                                {groupes.length === 0 ? (
                                    <p className={styles.vide}>Personne n'attend devant cette porte.</p>
                                ) : (
                                    <ul className={styles.groupes}>
                                        {groupes.map(groupe => (
                                            <li key={groupe.id} className={styles.groupe}>
                                                <div className={styles.groupeInfos}>
                                                    <span className={styles.groupeMeneur}>
                                                        {groupe.membres.find(membre => membre.estMeneur)?.pseudo}
                                                    </span>
                                                    <span className={styles.compteur}>
                                                        {groupe.membres.length}/{groupe.places}
                                                    </span>
                                                </div>
                                                {/* Rejoindre un groupe consomme le verrou du jour :
                                                    inutile de le proposer quand il est déjà épuisé. */}
                                                <GameButton className={`${styles.discret} ${(enCours || groupe.complet || porteClose) ? styles.desactive : ""}`}
                                                            onClick={() => !groupe.complet && !porteClose && onRejoindre(groupe.id)}>
                                                    {groupe.complet ? "Complet" : "Rejoindre"}
                                                </GameButton>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </ModalShell>
        </GameModal>
    );
}

export default DonjonEntreeModal;
