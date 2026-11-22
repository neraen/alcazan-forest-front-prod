import {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import BuffApi from "../../../services/BuffApi";

/** Intervalle de resynchronisation avec le serveur (le décompte, lui, est local). */
const SONDAGE_MS = 5000;

/**
 * Effets actifs du joueur (bienfaits ET affaiblissements), partagés par la grille de la
 * barre de sorts et le profil : une seule source, sinon les deux finiraient par
 * annoncer des durées différentes.
 *
 * Le serveur fait foi : à chaque réponse, la fin de chaque effet est RECALÉE sur
 * `secondesRestantes` (et non sur `finAt` comparé à l'horloge de la machine, qui peut
 * dériver). Entre deux réponses, un tic d'une seconde fait défiler le compte à rebours
 * et retire un effet arrivé à terme sans attendre le prochain sondage.
 *
 * Rafraîchi aussi à chaque `joueurState.buffVersion` (potion bue, sort de soutien lancé).
 */
const useEffetsActifs = () => {
    const buffVersion = useSelector((state) => state.data.joueurState?.buffVersion);
    const [effets, setEffets] = useState([]);
    const [maintenant, setMaintenant] = useState(Date.now());
    const charge = useRef(false);

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                const valeurs = await BuffApi.getActiveBuff();
                if (!actif) return;
                const recu = Date.now();
                setEffets((valeurs || []).map((effet) => ({
                    ...effet,
                    finLocale: recu + Math.max(0, effet.secondesRestantes ?? 0) * 1000,
                })));
                charge.current = true;
            } catch (_) {
                // On garde le dernier état : un sondage manqué ne doit rien effacer.
            }
        };
        charger();
        const sondage = setInterval(charger, SONDAGE_MS);
        return () => { actif = false; clearInterval(sondage); };
    }, [buffVersion]);

    useEffect(() => {
        const tic = setInterval(() => setMaintenant(Date.now()), 1000);
        return () => clearInterval(tic);
    }, []);

    const enCours = effets
        .map((effet) => ({...effet, restant: Math.ceil((effet.finLocale - maintenant) / 1000)}))
        .filter((effet) => effet.restant > 0);

    return {
        effets: enCours,
        bienfaits: enCours.filter((effet) => !effet.nefaste),
        affaiblissements: enCours.filter((effet) => effet.nefaste),
        charge: charge.current,
    };
};

export default useEffetsActifs;
