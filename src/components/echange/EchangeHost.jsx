import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import EchangeApi from "../../services/EchangeApi";
import UsersApi from "../../services/UsersApi";
import useMercure from "../../hooks/useMercure";
import {updateEchange, closeEchange, setEchangeInvitations, updateJoueurState} from "../../store/actions";
import EchangeModal from "./EchangeModal";
import GameButton from "../ui/gameButton/GameButton";
import styles from "./EchangeHost.module.scss";

const STATUTS_TERMINAUX = ["complete", "annule", "expire"];

/**
 * L'unique hôte du système d'échange, rendu une seule fois dans MapPage (même patron que
 * PnjInteractionHost). Il tient : la resynchronisation REST (/echange/current), l'abonnement
 * Mercure (topic personnel + topic de la session active), la bannière d'invitation et la
 * modale d'échange. L'état affiché est TOUJOURS le payload normalisé du serveur.
 */
const EchangeHost = (props) => {

    const monId = props.joueurState.idJoueur;
    const etat = props.echange.etat;
    const invitations = props.echange.invitations;
    const [requeteEnCours, setRequeteEnCours] = useState(false);

    const resynchroniser = () => EchangeApi.current()
        .then(donnees => {
            props.setEchangeInvitations(donnees.invitations);
            if(donnees.session){
                props.updateEchange(donnees.session);
            } else {
                props.closeEchange();
            }
        })
        .catch(() => {});

    // Reprise au chargement de la page (session en cours, invitations manquées).
    useEffect(() => {
        if(monId){
            resynchroniser();
        }
    }, [monId]);

    // Topics : le mien toujours, celui de la session tant qu'elle vit. Changer la liste
    // redemande un token (le topic de session doit être couvert par le JWT d'abonnement).
    const topics = [];
    if(monId){
        topics.push(`user/${monId}`);
    }
    if(etat && !STATUTS_TERMINAUX.includes(etat.statut)){
        topics.push(`echange/${etat.id}`);
    }

    useMercure(topics, (payload) => {
        if(!payload.echange){
            return;
        }
        if(payload.type === "echange.invitation"){
            if(payload.echange.joueurDeux.joueur.id === monId){
                const autres = invitations.filter(invitation => invitation.id !== payload.echange.id);
                props.setEchangeInvitations([...autres, payload.echange]);
                toast.info(`${payload.echange.joueurUn.joueur.pseudo} vous propose un échange.`);
            }
            return;
        }
        props.updateEchange(payload.echange);
        if(STATUTS_TERMINAUX.includes(payload.echange.statut)){
            props.setEchangeInvitations(invitations.filter(invitation => invitation.id !== payload.echange.id));
        }
    }, resynchroniser);

    // Fin de session : feedback + rafraîchissement des ressources, puis fermeture.
    useEffect(() => {
        if(!etat || !STATUTS_TERMINAUX.includes(etat.statut)){
            return;
        }
        if(etat.statut === "complete"){
            toast.success("Échange conclu !");
            props.updateJoueurState({needRefresh: true});
            UsersApi.find()
                .then(user => props.updateJoueurState({money: user.money}))
                .catch(() => {});
        } else if(etat.statut === "expire"){
            toast.info("L'échange a expiré.");
        } else if(etat.annulePar !== monId){
            toast.info("L'échange a été annulé par l'autre joueur.");
        }
        props.closeEchange();
    }, [etat]);

    /** Toute action : une requête à la fois, 409 = état frais adopté, erreur = resync. */
    const executer = async (appel) => {
        if(requeteEnCours){
            return;
        }
        setRequeteEnCours(true);
        try {
            const reponse = await appel();
            if(reponse && reponse.echange){
                props.updateEchange(reponse.echange);
            }
        } catch (error) {
            const donnees = error.response?.data;
            if(error.response?.status === 409 && donnees?.echange){
                props.updateEchange(donnees.echange);
                toast.info(donnees.error || "L'échange a été modifié entre-temps.");
            } else {
                toast.error(donnees?.error || "L'action n'a pas abouti.");
                await resynchroniser();
            }
        } finally {
            setRequeteEnCours(false);
        }
    };

    const accepterInvitation = (invitation) => executer(async () => {
        const reponse = await EchangeApi.accept(invitation.id);
        props.setEchangeInvitations(invitations.filter(candidate => candidate.id !== invitation.id));
        return reponse;
    });

    const refuserInvitation = (invitation) => executer(async () => {
        await EchangeApi.decline(invitation.id);
        props.setEchangeInvitations(invitations.filter(candidate => candidate.id !== invitation.id));
        return null; // pas de session à adopter : on a juste décliné
    });

    const sessionOuverte = etat && etat.statut === "ouvert";
    const invitationEnvoyee = etat && etat.statut === "en_attente" && etat.joueurUn.joueur.id === monId;

    return <>
        {invitations.length > 0 && !sessionOuverte && (
            <div className={styles.bandeaux}>
                {invitations.map(invitation => (
                    <div key={invitation.id} className={styles.bandeau}>
                        <span className={styles.bandeauTexte}>
                            <strong>{invitation.joueurUn.joueur.pseudo}</strong> vous propose un échange.
                        </span>
                        <div className={styles.bandeauBoutons}>
                            <GameButton onClick={() => accepterInvitation(invitation)}>Accepter</GameButton>
                            <GameButton className={styles.boutonDiscret} onClick={() => refuserInvitation(invitation)}>Refuser</GameButton>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {invitationEnvoyee && (
            <div className={styles.bandeaux}>
                <div className={styles.bandeau}>
                    <span className={styles.bandeauTexte}>
                        En attente de <strong>{etat.joueurDeux.joueur.pseudo}</strong>…
                    </span>
                    <div className={styles.bandeauBoutons}>
                        <GameButton className={styles.boutonDiscret}
                                    onClick={() => executer(() => EchangeApi.cancel())}>Annuler</GameButton>
                    </div>
                </div>
            </div>
        )}

        {sessionOuverte && (
            <EchangeModal etat={etat}
                          monId={monId}
                          enCours={requeteEnCours}
                          onProposer={(type, itemId, quantite) => executer(() => EchangeApi.addItem(type, itemId, quantite, etat.version))}
                          onRetirer={(ligne) => executer(() => EchangeApi.removeItem(ligne.ligneId, etat.version))}
                          onChangerOr={(montant) => executer(() => EchangeApi.updateOr(montant, etat.version))}
                          onConfirmer={() => executer(() => EchangeApi.confirm(etat.version))}
                          onAnnuler={() => executer(() => EchangeApi.cancel())}/>
        )}
    </>;
}

export default connect((state) => {
    return {
        joueurState: state.data.joueurState,
        echange: state.data.echange,
    };
}, {updateEchange, closeEchange, setEchangeInvitations, updateJoueurState})(EchangeHost);
