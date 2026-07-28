import {useEffect, useRef} from "react";
import EchangeApi from "../services/EchangeApi";

/**
 * Abonnement SSE au hub Mercure sur une liste de topics.
 *
 * EventSource ne peut pas porter de header Authorization : le JWT d'abonnement (délivré par
 * POST /api/mercure/token, limité aux topics du joueur) passe en query param `authorization`.
 * L'effet se réabonne quand la liste de topics change (ex. : une session d'échange s'ouvre,
 * son topic `echange/{id}` doit être couvert par un NOUVEAU token). La reconnexion réseau est
 * gérée nativement par EventSource ; la resynchronisation d'état appartient à l'appelant
 * (callback onReconnect → refetch REST).
 */
export default function useMercure(topics, onMessage, onReconnect){
    // Refs pour ne jamais forcer un réabonnement quand seuls les callbacks changent.
    const messageRef = useRef(onMessage);
    const reconnectRef = useRef(onReconnect);
    messageRef.current = onMessage;
    reconnectRef.current = onReconnect;

    const cle = topics.join("|");

    useEffect(() => {
        if(cle === ""){
            return undefined;
        }

        let source = null;
        let annule = false;
        let perduUneFois = false;

        EchangeApi.mercureToken()
            .then(({token, mercureUrl}) => {
                if(annule){
                    return;
                }
                const url = new URL(mercureUrl);
                cle.split("|").forEach(topic => url.searchParams.append("topic", topic));
                url.searchParams.append("authorization", token);

                source = new EventSource(url.toString());
                source.onmessage = (event) => {
                    if(perduUneFois){
                        // Des événements ont pu être manqués pendant la coupure.
                        perduUneFois = false;
                        reconnectRef.current && reconnectRef.current();
                    }
                    try {
                        messageRef.current(JSON.parse(event.data));
                    } catch (erreur) {
                        // payload illisible : ignoré, l'état complet reviendra au prochain événement
                    }
                };
                source.onerror = () => {
                    perduUneFois = true;
                };
            })
            .catch(() => {
                // Pas de token (hub éteint ?) : le jeu reste jouable, sans temps réel.
            });

        return () => {
            annule = true;
            source && source.close();
        };
    }, [cle]);
}
