import {useEffect, useState} from "react";

/**
 * Outils partagés par la page Artisanat et la modale Atelier.
 *
 * Règle de fond : **rien n'est décompté localement**. Le serveur envoie `lanceeAt` et
 * `pretAt` (dates ATOM), le front les compare à l'horloge à chaque rendu. Un compteur de
 * secondes décrémenté à la main dériverait dès que l'onglet passe en arrière-plan, et
 * afficherait « prête » sur une commande qui ne l'est pas — ou l'inverse.
 */

/** Secondes restantes avant `pretAt`, recalculées depuis l'horloge. */
export const secondesRestantes = (pretAt) => {
    if (!pretAt) {
        return 0;
    }

    return Math.max(0, Math.ceil((new Date(pretAt).getTime() - Date.now()) / 1000));
};

/** Avancement d'une commande en pourcentage, borné à [0, 100]. */
export const avancement = (lanceeAt, pretAt) => {
    if (!lanceeAt || !pretAt) {
        return 0;
    }

    const debut = new Date(lanceeAt).getTime();
    const fin = new Date(pretAt).getTime();
    if (fin <= debut) {
        return 100;
    }

    return Math.max(0, Math.min(100, ((Date.now() - debut) / (fin - debut)) * 100));
};

/** Durée en toutes lettres : « 2 h 5 min », « 12 min », « 30 s ». */
export const enClair = (secondes) => {
    if (secondes >= 3600) {
        return `${Math.floor(secondes / 3600)} h ${Math.ceil((secondes % 3600) / 60)} min`;
    }
    if (secondes >= 60) {
        return `${Math.ceil(secondes / 60)} min`;
    }

    return `${secondes} s`;
};

/**
 * Horloge d'AFFICHAGE : force un rendu chaque seconde tant que `actif` est vrai.
 * Elle ne porte aucune valeur — les durées restent recalculées depuis les dates serveur.
 */
export const useHorloge = (actif) => {
    const [, forcerRendu] = useState(0);

    useEffect(() => {
        if (!actif) {
            return undefined;
        }
        const minuteur = setInterval(() => forcerRendu(v => v + 1), 1000);

        return () => clearInterval(minuteur);
    }, [actif]);
};
