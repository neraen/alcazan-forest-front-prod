import React, {useEffect, useMemo, useRef, useState} from 'react'
import {toast} from "react-toastify";
import GameModal from "../ui/gameModal/GameModal";
import ModalShell from "../ui/gameModal/ModalShell";
import GameButton from "../ui/gameButton/GameButton";
import Loader from "../loader/Loader";
import InventaireApi from "../../services/InventaireApi";
import {normalizeConsommable, normalizeEquipement, normalizeObjet} from "../inventory/screen/itemUtils";
import styles from "./EchangeModal.module.scss";

/**
 * La fenêtre d'échange : mon offre / l'offre adverse, mon sac en dessous.
 * Interface PESSIMISTE : chaque clic envoie l'intention au serveur (avec
 * `expectedVersion`) et l'affichage ne change qu'avec l'état renvoyé (REST ou
 * Mercure). Cliquer un item du sac propose UN exemplaire de plus ; « − » sur
 * une ligne en retire un ; ✕ retire la ligne. L'or se valide à Entrée ou au blur.
 */
const EchangeModal = ({etat, monId, enCours, onProposer, onRetirer, onChangerOr, onConfirmer, onAnnuler}) => {

    const [inventaire, setInventaire] = useState(null);
    // null = le champ suit l'état serveur ; string = saisie en cours.
    const [orSaisi, setOrSaisi] = useState(null);
    const [noteReset, setNoteReset] = useState(false);
    const etatPrecedent = useRef(etat);

    const mienne = etat.joueurUn.joueur.id === monId ? etat.joueurUn : etat.joueurDeux;
    const sienne = etat.joueurUn.joueur.id === monId ? etat.joueurDeux : etat.joueurUn;

    useEffect(() => {
        InventaireApi.getPlayerInventaire()
            .then(setInventaire)
            .catch(() => toast.error("Impossible de charger votre inventaire."));
    }, []);

    // Bandeau « confirmations réinitialisées » quand une modification les a annulées.
    useEffect(() => {
        const precedent = etatPrecedent.current;
        etatPrecedent.current = etat;
        const etaitConfirme = precedent.joueurUn.confirme || precedent.joueurDeux.confirme;
        const plusConfirme = !etat.joueurUn.confirme && !etat.joueurDeux.confirme;
        if(etat.version !== precedent.version && etaitConfirme && plusConfirme){
            setNoteReset(true);
            const timer = setTimeout(() => setNoteReset(false), 4000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [etat]);

    const itemsSac = useMemo(() => inventaire === null ? [] : [
        ...(inventaire.equipements || []).map(equipement => normalizeEquipement(equipement)),
        ...(inventaire.consommables || []).map(normalizeConsommable),
        ...(inventaire.objets || []).map(normalizeObjet),
    ], [inventaire]);

    const ligneDe = (item) => mienne.lignes.find(
        ligne => ligne.type === item.cat && ligne.itemId === item.id
    );

    const proposerUnDePlus = (item) => {
        const ligne = ligneDe(item);
        const dejaPropose = ligne ? ligne.quantite : 0;
        if(dejaPropose >= item.qty){
            toast.info("Vous avez déjà proposé tous vos exemplaires.");
            return;
        }
        onProposer(item.cat, item.id, dejaPropose + 1);
    };

    const retirerUn = (ligne) => {
        if(ligne.quantite <= 1){
            onRetirer(ligne);
            return;
        }
        onProposer(ligne.type, ligne.itemId, ligne.quantite - 1);
    };

    const validerOr = () => {
        if(orSaisi === null){
            return;
        }
        const montant = Math.max(0, Math.floor(Number(orSaisi)) || 0);
        setOrSaisi(null);
        if(montant !== mienne.or){
            onChangerOr(montant);
        }
    };

    const renderLignes = (offre, estLaMienne) => (
        <div className={styles.lignes}>
            {offre.lignes.length === 0 && <span className={styles.vide}>Aucun objet proposé</span>}
            {offre.lignes.map(ligne => (
                <div key={ligne.ligneId} className={styles.ligne} title={ligne.nom}>
                    {ligne.icone && <img className={styles.ligneIcone} src={ligne.icone} alt={ligne.nom}/>}
                    <span className={styles.ligneNom}>{ligne.nom}</span>
                    <span className={styles.ligneQuantite}>×{ligne.quantite}</span>
                    {estLaMienne && (
                        <span className={styles.ligneActions}>
                            <button type="button" className={styles.ligneBouton} disabled={enCours}
                                    aria-label="Un de moins" onClick={() => retirerUn(ligne)}>−</button>
                            <button type="button" className={styles.ligneBouton} disabled={enCours}
                                    aria-label="Retirer" onClick={() => onRetirer(ligne)}>✕</button>
                        </span>
                    )}
                </div>
            ))}
        </div>
    );

    const badgeConfirmation = (offre) => (
        <span className={offre.confirme ? styles.badgeConfirme : styles.badgeAttente}>
            {offre.confirme ? "✓ Confirmé" : "En attente"}
        </span>
    );

    const footer = (
        <div className={styles.footer}>
            {noteReset
                ? <span className={styles.noteReset}>L'offre a été modifiée : les confirmations ont été réinitialisées.</span>
                : <span className={styles.noteInfo}>Les deux joueurs doivent confirmer pour conclure l'échange.</span>}
            <div className={styles.footerBoutons}>
                <GameButton className={styles.boutonAnnuler} onClick={onAnnuler}>Annuler l'échange</GameButton>
                <GameButton onClick={mienne.confirme ? undefined : onConfirmer}
                            className={mienne.confirme || enCours ? styles.boutonFige : ""}>
                    {mienne.confirme ? "✓ Confirmé" : (enCours ? "…" : "Confirmer")}
                </GameButton>
            </div>
        </div>
    );

    return (
        <GameModal isOpen={true} onClose={onAnnuler} size="fill">
            <ModalShell iconSrc="/img/gui/Money03.png"
                        title={`Échange avec ${sienne.joueur.pseudo}`}
                        subtitle="Clic sur un objet du sac pour le proposer"
                        onClose={onAnnuler}>
                <div className={styles.corps}>
                    <div className={styles.offres}>
                        <section className={styles.offre}>
                            <header className={styles.offreEntete}>
                                <span className={styles.offreTitre}>Votre offre</span>
                                {badgeConfirmation(mienne)}
                            </header>
                            {renderLignes(mienne, true)}
                            <div className={styles.orRow}>
                                <img className={styles.orIcone} src="/img/gui/Money03.png" alt="Or"/>
                                <input className={styles.orInput} type="number" min={0} step={1}
                                       aria-label="Or proposé"
                                       value={orSaisi === null ? mienne.or : orSaisi}
                                       disabled={enCours}
                                       onChange={(event) => setOrSaisi(event.target.value)}
                                       onBlur={validerOr}
                                       onKeyDown={(event) => event.key === "Enter" && event.target.blur()}
                                       onFocus={(event) => event.target.select()}/>
                                <span className={styles.orLabel}>pièces d'or</span>
                            </div>
                        </section>

                        <section className={styles.offre}>
                            <header className={styles.offreEntete}>
                                <span className={styles.offreTitre}>Offre de {sienne.joueur.pseudo}</span>
                                {badgeConfirmation(sienne)}
                            </header>
                            {renderLignes(sienne, false)}
                            <div className={styles.orRow}>
                                <img className={styles.orIcone} src="/img/gui/Money03.png" alt="Or"/>
                                <span className={styles.orMontant}>{sienne.or}</span>
                                <span className={styles.orLabel}>pièces d'or</span>
                            </div>
                        </section>
                    </div>

                    <section className={styles.sac}>
                        <header className={styles.sacEntete}>Votre sac</header>
                        {inventaire === null
                            ? <Loader/>
                            : itemsSac.length === 0
                                ? <span className={styles.vide}>Votre sac est vide.</span>
                                : (
                                    <div className={styles.sacGrille}>
                                        {itemsSac.map(item => {
                                            const dejaPropose = ligneDe(item)?.quantite || 0;
                                            const restant = item.qty - dejaPropose;
                                            return (
                                                <button key={item.key} type="button"
                                                        className={`${styles.sacCellule} ${restant <= 0 ? styles.sacEpuise : ""}`}
                                                        title={`${item.name}${dejaPropose > 0 ? ` — ${dejaPropose} proposé(s)` : ""}`}
                                                        disabled={enCours || restant <= 0}
                                                        onClick={() => proposerUnDePlus(item)}>
                                                    <img className={styles.sacIcone} src={item.img} alt={item.name}/>
                                                    {restant > 1 && <span className={styles.sacQuantite}>{restant}</span>}
                                                    {dejaPropose > 0 && <span className={styles.sacPropose}>{dejaPropose}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                    </section>
                </div>
                {footer}
            </ModalShell>
        </GameModal>
    );
}

export default EchangeModal
