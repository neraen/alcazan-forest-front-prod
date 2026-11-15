/**
 * Lecture d'une fiche du journal de quêtes (`POST /api/quest/journal`) pour l'affichage.
 * Aucune règle de jeu : tout ce qui est décidé (étape, progression, « prête ») vient du
 * serveur ; ici on ne fait que choisir les MOTS.
 */

/** Date de fin lisible — null quand le serveur n'en a pas (quête antérieure au journal). */
export function dateFin(iso, format = "long") {
    if (!iso) {
        return null;
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toLocaleDateString("fr-FR", format === "long"
        ? {day: "numeric", month: "long", year: "numeric"}
        : {day: "numeric", month: "short"});
}

/** « Limuren - centre · case 6, 7 » — la case n'existe que pour un PNJ posé. */
export function lieuTexte(lieu) {
    if (!lieu) {
        return null;
    }
    return lieu.x !== null && lieu.x !== undefined
        ? `${lieu.carte} · case ${lieu.x}, ${lieu.y}`
        : lieu.carte;
}

/** Le premier objectif encore à remplir, sinon le premier tout court. */
export function objectifPrincipal(etape) {
    const objectifs = etape?.objectifs ?? [];
    return objectifs.find((o) => o.fait !== true) ?? objectifs[0] ?? null;
}

/**
 * État d'une quête pour la liste : un TON (couleur), une pastille et une ligne de résumé
 * qui répond à « qu'est-ce que je fais maintenant ? » sans ouvrir la fiche.
 */
export function etatQuete(quete) {
    if (quete.statut === "terminee") {
        const fin = dateFin(quete.termineeLe, "court");
        return {ton: "fini", label: "Terminée", resume: fin ? `Achevée le ${fin}` : "Quête accomplie"};
    }

    if (quete.statut === "disponible") {
        return {
            ton: "dispo",
            label: "Nouvelle",
            resume: quete.donneur ? `Auprès de ${quete.donneur.nom}` : "Quête disponible",
        };
    }

    const etape = quete.etape;
    const pnj = etape?.pnj?.nom;
    if (!etape || etape.pret) {
        const verbe = etape?.objectifs?.length ? "Retournez voir" : "Parlez à";
        return {ton: "pret", label: "Prête", resume: pnj ? `${verbe} ${pnj}` : "Retournez voir votre contact"};
    }

    const objectif = objectifPrincipal(etape);
    const compte = objectif?.progress ? ` · ${objectif.progress.current}/${objectif.progress.target}` : "";
    return {ton: "cours", label: "En cours", resume: objectif ? `${objectif.libelle}${compte}` : `Étape ${etape.numero}`};
}
