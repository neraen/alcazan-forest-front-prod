/**
 * Lecture des effets actifs (`/joueur/buffs`) : ce module ne connaît AUCUN effet en dur.
 * Libellés de contrôle, descriptions et caractéristiques viennent du serveur.
 */

/** Somme des modifications de caractéristiques, par nom (`{force: 20, armure: -10}`). */
export const bonusParCaracteristique = (effets) => (effets || []).reduce((totaux, effet) => {
    (effet.caracteristiques || []).forEach(({nom, value}) => {
        totaux[nom] = (totaux[nom] || 0) + Number(value || 0);
    });
    return totaux;
}, {});

/** « +20 », « −10 » (vrai signe moins), « 0 ». */
export const signe = (valeur) => {
    if (valeur > 0) return `+${valeur}`;
    if (valeur < 0) return `−${Math.abs(valeur)}`;
    return "0";
};

/** Libellé d'une caractéristique telle que nommée en base (« dexterite » → « Dextérité »). */
const LIBELLES = {
    constitution: "Constitution",
    force: "Force",
    dexterite: "Dextérité",
    intelligence: "Intelligence",
    concentration: "Concentration",
    chance: "Chance",
    armure: "Armure",
    critique: "Critique",
};
export const libelleCarac = (nom) => LIBELLES[nom] || (nom ? nom.charAt(0).toUpperCase() + nom.slice(1) : "");

/** Durée compacte pour une case de 25 px : « 9 », « 45 », « 5m ». */
export const dureeCourte = (secondes) => (secondes >= 100 ? `${Math.ceil(secondes / 60)}m` : `${secondes}`);

/** Durée lisible : « 9 s », « 4 min 05 s ». */
export const dureeLongue = (secondes) => {
    if (secondes < 60) return `${secondes} s`;
    const minutes = Math.floor(secondes / 60);
    const reste = secondes % 60;
    return `${minutes} min ${String(reste).padStart(2, "0")} s`;
};

/** Une ligne de description : le contrôle d'abord (c'est ce qui change le jeu), puis les caracs. */
export const resumeEffet = (effet) => {
    const parties = [];
    if (effet.controleDescription) parties.push(effet.controleDescription);
    (effet.caracteristiques || []).forEach(({nom, value}) => parties.push(`${signe(Number(value))} ${libelleCarac(nom)}`));
    return parties.join(" · ");
};
