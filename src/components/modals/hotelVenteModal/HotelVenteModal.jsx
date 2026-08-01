import React, {useCallback, useEffect, useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import HotelVenteApi from "../../../services/HotelVenteApi";
import {updateJoueurState} from "../../../store/actions";
import GameModal from "../../ui/gameModal/GameModal";
import ModalShell from "../../ui/gameModal/ModalShell";
import HotelAcheter from "./HotelAcheter";
import HotelMesVentes from "./HotelMesVentes";
import HotelVendre from "./HotelVendre";
import styles from "./HotelVenteModal.module.scss";

/**
 * Hôtel des ventes : marché ASYNCHRONE entre joueurs — on dépose un lot et on repart, un autre
 * l'achète pendant qu'on est déconnecté.
 *
 * Aucune règle de jeu ici. Les frais, la disponibilité d'un lot et l'or débité sont arbitrés
 * par le serveur ; l'écran ne fait qu'afficher ce qu'il renvoie et se resynchroniser après
 * chaque action. Pas de Mercure et c'est un choix : un catalogue asynchrone n'a pas besoin de
 * temps réel, et la course entre deux acheteurs est déjà réglée par le 409.
 *
 * Pas de slice Redux non plus : personne d'autre que cette modale n'a besoin de cet état, et
 * le patron `Host` de MapPage ne se justifie que pour ce qui est piloté par la carte.
 */
const HotelVenteModal = ({isShowing, toggle, ...props}) => {

    const [onglet, setOnglet] = useState("acheter");
    const [mesVentes, setMesVentes] = useState(null);
    const [enCours, setEnCours] = useState(false);

    const chargerMesVentes = useCallback(() => HotelVenteApi.mesVentes()
        .then(setMesVentes)
        .catch(() => toast.error("L'hôtel des ventes est inaccessible.")), []);

    // Rechargé à l'ouverture ET à chaque retour sur l'onglet : un lot a pu se vendre entre-temps.
    useEffect(() => {
        if (isShowing) {
            chargerMesVentes();
        } else {
            setMesVentes(null);
        }
    }, [isShowing, onglet, chargerMesVentes]);

    /**
     * Toute action passe par ici : une requête à la fois, l'or vient du serveur, et le sac est
     * marqué à rafraîchir. Un 409 n'est pas une erreur du joueur — son écran était périmé, on
     * l'en informe sans dramatiser et l'appelant recharge sa liste.
     */
    const agir = async (appel) => {
        if (enCours) {
            return;
        }
        setEnCours(true);
        try {
            const reponse = await appel();
            if (reponse.message) {
                toast.success(reponse.message);
            }
            if (reponse.money !== undefined) {
                props.updateJoueurState({money: reponse.money});
            }
            // Le sac a bougé (lot séquestré, acheté ou rendu) : la carte et l'inventaire
            // doivent se resynchroniser.
            props.updateJoueurState({needRefresh: true});
            await chargerMesVentes();
        } catch (erreur) {
            const donnees = erreur.response?.data;
            if (erreur.response?.status === 409) {
                toast.info(donnees?.error || "Ce lot vient de changer de main.");
            } else {
                toast.error(donnees?.error || "L'opération n'a pas abouti.");
            }
            await chargerMesVentes();
        } finally {
            setEnCours(false);
        }
    };

    const sousTitre = mesVentes
        ? `${mesVentes.emplacementsUtilises} / ${mesVentes.curseurs.annoncesMax} lots en vente`
        : "Marché entre aventuriers";

    const retirer = (annonce) => {
        const message = `Retirer « ${annonce.item.nom} » de la vente ?\n\n`
            + `L'objet vous sera rendu, mais les ${annonce.fraisDepot} po de frais de dépôt ne sont pas remboursés.`;
        if (window.confirm(message)) {
            agir(() => HotelVenteApi.retirer(annonce.id));
        }
    };

    return (
        <GameModal isOpen={isShowing} onClose={toggle} size="fill">
            <ModalShell iconSrc="/img/gui/Money03.png"
                        title="Hôtel des ventes"
                        subtitle={sousTitre}
                        headerRight={
                            <span className={styles.purse}>
                                <img className={styles.purseCoin} src="/img/gui/Money03.png" alt="Or"/>
                                <span className={styles.purseAmount}>{props.joueurState.money}</span>
                            </span>
                        }
                        onClose={toggle}>
                <div className={styles.container}>
                    <div className={styles.tabs}>
                        {[["acheter", "Acheter"], ["vendre", "Vendre"], ["mesventes", "Mes ventes"]].map(([id, label]) => (
                            <button key={id} type="button"
                                    className={`${styles.tab} ${onglet === id ? styles.tabActive : ""}`}
                                    onClick={() => setOnglet(id)}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.content}>
                        {onglet === "acheter" && (
                            <HotelAcheter occupe={enCours}
                                          onAcheter={(annonce) =>
                                              agir(() => HotelVenteApi.acheter(annonce.id, annonce.prix))}/>
                        )}
                        {onglet === "vendre" && (
                            <HotelVendre curseurs={mesVentes?.curseurs}
                                         emplacementsUtilises={mesVentes?.emplacementsUtilises ?? 0}
                                         occupe={enCours}
                                         onVendre={(type, itemId, quantite, prix) =>
                                             agir(() => HotelVenteApi.vendre(type, itemId, quantite, prix))}/>
                        )}
                        {onglet === "mesventes" && (
                            <HotelMesVentes donnees={mesVentes} occupe={enCours} onRetirer={retirer}/>
                        )}
                    </div>
                </div>
            </ModalShell>
        </GameModal>
    );
};

export default connect(
    (state) => ({joueurState: {...state.data.joueurState}}),
    {updateJoueurState}
)(HotelVenteModal);
