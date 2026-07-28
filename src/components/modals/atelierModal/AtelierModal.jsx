import React, {useCallback, useEffect, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import CraftApi from "../../../services/CraftApi";
import {updateJoueurState} from "../../../store/actions";
import FileFabrication from "../../artisanat/fileFabrication/FileFabrication";
import GameModal from "../../ui/gameModal/GameModal";
import ModalShell from "../../ui/gameModal/ModalShell";
import {buttonClass} from "../../ui/gameButton/GameButton";
import Loader from "../../loader/Loader";
import styles from "./AtelierModal.module.scss";

/**
 * Établi de poche : la file de fabrication du joueur, sans quitter la carte.
 *
 * Volontairement RÉDUITE au suivi des commandes — le catalogue de recettes, la recherche
 * et la progression des métiers vivent sur la page Artisanat (`/artisanat`), qui a la place
 * de les afficher. Deux écrans, une seule liste de commandes : `FileFabrication`.
 *
 * Aucune règle de jeu ici : `prete` vient du serveur, qui revérifie au retrait.
 */
const AtelierModal = ({isShowing, toggle, ...props}) => {

    const [commandes, setCommandes] = useState(null);
    const [enCours, setEnCours] = useState(false);

    const charger = useCallback(() => CraftApi.commandes()
        .then(reponse => setCommandes(reponse.commandes || []))
        .catch(() => toast.error("L'établi est inaccessible.")), []);

    useEffect(() => {
        if (isShowing) {
            charger();
        }
    }, [isShowing, charger]);

    const agir = async (action, ...args) => {
        setEnCours(true);
        try {
            const reponse = await action(...args);
            (reponse.messages || [reponse.message]).filter(Boolean).forEach(m => toast.info(m));
            setCommandes(reponse.commandes || []);
            // Le sac a bougé (objet produit, matériaux rendus) : la carte et les compteurs
            // du joueur doivent se resynchroniser.
            props.updateJoueurState({needRefresh: true});
        } catch (erreur) {
            toast.error(erreur.response?.data?.error || "Une erreur est survenue.");
        } finally {
            setEnCours(false);
        }
    };

    const handleAnnuler = (commande) => {
        if (window.confirm(`Annuler « ${commande.nom} » ? Les matériaux vous seront rendus, mais le temps déjà passé est perdu.`)) {
            agir(CraftApi.annuler, commande.id);
        }
    };

    return (
        <GameModal isOpen={isShowing} onClose={toggle} size="auto">
            <ModalShell fit="content" iconSrc="/img/icons/bag.png"
                        title="Établi" subtitle="Fabrications en cours"
                        onClose={toggle}>
                <div className={styles.body}>
                    {commandes === null
                        ? <Loader/>
                        : <FileFabrication commandes={commandes} occupe={enCours}
                                           onRetirer={(commande) => agir(CraftApi.retirer, commande.id)}
                                           onAnnuler={handleAnnuler}/>}

                    <Link to="/artisanat" onClick={toggle} className={`${buttonClass} ${styles.lien}`}>
                        Ouvrir l'artisanat
                    </Link>
                </div>
            </ModalShell>
        </GameModal>
    );
};

export default connect(null, {updateJoueurState})(AtelierModal);
