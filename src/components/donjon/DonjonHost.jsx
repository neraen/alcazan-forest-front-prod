import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import DonjonApi from "../../services/DonjonApi";
import UsersApi from "../../services/UsersApi";
import useMercure from "../../hooks/useMercure";
import {closeDonjonPorte, updateJoueurState} from "../../store/actions";
import DonjonEntreeModal from "./DonjonEntreeModal";

/**
 * L'unique hôte du système de donjon, rendu une seule fois dans MapPage (même patron que
 * PnjInteractionHost et EchangeHost). Il tient : le chargement de l'état de la porte, les
 * actions de groupe, et l'abonnement Mercure au topic du groupe — pour que les inscriptions
 * des autres joueurs apparaissent sans rechargement, et que le lancement par le meneur
 * emmène tout le monde.
 *
 * L'état affiché est TOUJOURS le payload du serveur : rien n'est reconstruit ici.
 */
const DonjonHost = (props) => {

    const monId = props.joueurState.idJoueur;
    const porte = props.donjon.porte;
    const porteCaseId = porte ? porte.carteCarreauId : null;
    const [etat, setEtat] = useState(null);
    const [requeteEnCours, setRequeteEnCours] = useState(false);

    const fermer = () => {
        setEtat(null);
        props.closeDonjonPorte();
    };

    const recharger = () => {
        if(!porte){
            return Promise.resolve();
        }
        return DonjonApi.porte(porte.carteCarreauId)
            .then(setEtat)
            .catch(erreur => {
                toast.error(erreur.response?.data?.error || "Cette porte est inaccessible.");
                fermer();
            });
    };

    // Ouverture de la modale : un seul aller-retour peuple tout.
    useEffect(() => {
        if(porte){
            recharger();
        } else {
            setEtat(null);
        }
    }, [porteCaseId]);

    /* Topics : le mien toujours (le lancement du meneur y arrive, même modale fermée),
       celui du groupe tant qu'on y est inscrit. Changer la liste redemande un token. */
    const topics = [];
    if(monId){
        topics.push(`user/${monId}`);
    }
    if(etat && etat.monGroupe){
        topics.push(`donjon-groupe/${etat.monGroupe.id}`);
    }

    useMercure(topics, (payload) => {
        if(!payload.type || !payload.type.startsWith("donjon.")){
            return;
        }

        if(payload.type === "donjon.groupe.lance"){
            /* Le meneur reçoit AUSSI son propre lancement sur son topic personnel : il l'a
               déjà traité dans la réponse de l'appel, on ne le rejoue pas (sinon double
               toast et double rechargement). */
            if(payload.groupe?.meneurId === monId){
                return;
            }
            /* Pour les compagnons, le serveur a déjà déplacé tout le monde dans la salle
               d'entrée. Le mapId doit venir du PAYLOAD — celui du store est encore celui
               du monde ouvert, et rafraîchir dessus rechargerait la mauvaise carte. */
            toast.success("L'expédition commence !");
            props.updateJoueurState({mapId: payload.instance.carteEntreeId, needRefresh: true});
            fermer();
            return;
        }

        if(payload.type === "donjon.groupe.dissous"){
            if(payload.groupe?.meneurId !== monId){
                toast.info("Le groupe a été dissous par son meneur.");
            }
            recharger();
            return;
        }

        recharger();
    }, recharger);

    /**
     * Toute action : une requête à la fois, erreur = message serveur + resynchronisation.
     * `rechargerApres` est faux pour les actions qui TÉLÉPORTENT (entrée seul, lancement) :
     * une fois dans le donjon on n'est plus devant la porte, et la relire répondrait
     * « vous êtes trop loin ».
     */
    const executer = async (appel, rechargerApres = true) => {
        if(requeteEnCours){
            return;
        }
        setRequeteEnCours(true);
        try {
            await appel();
            if(rechargerApres){
                await recharger();
            }
        } catch (erreur) {
            toast.error(erreur.response?.data?.error || "L'action n'a pas abouti.");
            await recharger();
        } finally {
            setRequeteEnCours(false);
        }
    };

    /* L'entrée SOLO reste un franchissement de wrap ordinaire : c'est le serveur qui
       crée l'instance au passage (cf. JoueurController::updateMapPosition). On ne
       duplique donc pas cette logique dans un endpoint de donjon. */
    const entrerSeul = () => executer(async () => {
        const position = await UsersApi.changeMap(porte.targetMapId, porte.targetWrap, porte.carteCarreauId);
        if(position.mapId === undefined){
            // Refus du serveur (verrou, niveau, wrap bloqué) : il renvoie un message,
            // pas une erreur HTTP — la modale reste ouverte.
            toast.error(position.message || "Vous ne pouvez pas entrer.");
            await recharger();
            return;
        }
        props.updateJoueurState({mapId: position.mapId, needRefresh: true});
        fermer();
    }, false);

    const lancer = () => executer(async () => {
        const reponse = await DonjonApi.lancerGroupe();
        toast.success("L'expédition commence !");
        props.updateJoueurState({mapId: reponse.mapId, needRefresh: true});
        fermer();
    }, false);

    if(!porte || !etat){
        return null;
    }

    return <DonjonEntreeModal etat={etat}
                              monId={monId}
                              enCours={requeteEnCours}
                              onEntrerSeul={entrerSeul}
                              onCreerGroupe={() => executer(() => DonjonApi.creerGroupe(porte.carteCarreauId))}
                              onRejoindre={(groupeId) => executer(() => DonjonApi.rejoindreGroupe(groupeId))}
                              onQuitter={() => executer(() => DonjonApi.quitterGroupe())}
                              onLancer={lancer}
                              onClose={fermer}/>;
}

export default connect((state) => {
    return {
        joueurState: state.data.joueurState,
        donjon: state.data.donjon,
    };
}, {closeDonjonPorte, updateJoueurState})(DonjonHost);
