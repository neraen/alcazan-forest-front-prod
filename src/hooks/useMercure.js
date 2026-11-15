import {useEffect, useRef, useState} from "react";
import EchangeApi from "../services/EchangeApi";

/** Délais de reconnexion : rapide d'abord (micro-coupure), puis patient (hub éteint). */
const DELAIS_RECONNEXION_MS = [1000, 2000, 5000, 10000, 20000];

/**
 * Abonnement SSE au hub Mercure sur une liste de topics.
 *
 * EventSource ne peut pas porter de header Authorization : le JWT d'abonnement (délivré par
 * POST /api/mercure/token, limité aux topics du joueur) passe en query param `authorization`.
 * L'effet se réabonne quand la liste de topics change (ex. : une session d'échange s'ouvre,
 * son topic `echange/{id}` doit être couvert par un NOUVEAU token).
 *
 * ⚠️ La reconnexion est faite À LA MAIN, avec un jeton NEUF. La reconnexion native
 * d'EventSource rejoue la MÊME URL, donc le même jeton : passé son expiration (1 h), le hub
 * répond 401 et EventSource se ferme pour de bon — l'onglet ne recevait plus aucune
 * invitation jusqu'au F5, sans le moindre signe visible.
 *
 * Rend `connecte` : l'appelant s'en sert pour resserrer son sondage REST de repli. La
 * resynchronisation d'état après une coupure appartient à l'appelant (onReconnect).
 */
export default function useMercure(topics, onMessage, onReconnect){
    // Refs pour ne jamais forcer un réabonnement quand seuls les callbacks changent.
    const messageRef = useRef(onMessage);
    const reconnectRef = useRef(onReconnect);
    messageRef.current = onMessage;
    reconnectRef.current = onReconnect;

    const [connecte, setConnecte] = useState(false);
    const cle = topics.join("|");

    useEffect(() => {
        if(cle === ""){
            return undefined;
        }

        let source = null;
        let annule = false;
        let minuteur = null;
        let tentative = 0;
        let dejaConnecte = false;

        const reessayer = () => {
            if(annule){
                return;
            }
            setConnecte(false);
            const delai = DELAIS_RECONNEXION_MS[Math.min(tentative, DELAIS_RECONNEXION_MS.length - 1)];
            tentative += 1;
            minuteur = setTimeout(connecter, delai);
        };

        const connecter = () => {
            EchangeApi.mercureToken()
                .then(({token, mercureUrl}) => {
                    if(annule){
                        return;
                    }
                    const url = new URL(mercureUrl);
                    cle.split("|").forEach(topic => url.searchParams.append("topic", topic));
                    url.searchParams.append("authorization", token);

                    source = new EventSource(url.toString());
                    source.onopen = () => {
                        if(annule){
                            return;
                        }
                        tentative = 0;
                        setConnecte(true);
                        // Des événements ont pu être manqués pendant la coupure : l'état
                        // complet se relit par REST, jamais par rejeu.
                        if(dejaConnecte){
                            reconnectRef.current && reconnectRef.current();
                        }
                        dejaConnecte = true;
                    };
                    source.onmessage = (event) => {
                        try {
                            messageRef.current(JSON.parse(event.data));
                        } catch (erreur) {
                            // payload illisible : ignoré, l'état complet reviendra au prochain événement
                        }
                    };
                    source.onerror = () => {
                        // On ne laisse PAS EventSource se reconnecter seul (même jeton, cf. plus haut).
                        source.close();
                        source = null;
                        reessayer();
                    };
                })
                // Pas de token (hub éteint, session expirée ?) : le jeu reste jouable, on retente.
                .catch(reessayer);
        };

        connecter();

        return () => {
            annule = true;
            minuteur && clearTimeout(minuteur);
            source && source.close();
            setConnecte(false);
        };
    }, [cle]);

    return connecte;
}
