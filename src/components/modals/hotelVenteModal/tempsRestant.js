/**
 * Temps restant avant une échéance serveur, en français abrégé (« 11 h 20 », « 4 min »).
 *
 * Recalculé depuis la date ABSOLUE renvoyée par le serveur à chaque rendu, jamais décompté
 * localement : un décompte client dérive dès que l'onglet passe en arrière-plan, et il
 * continuerait à tourner sur un état périmé. Même règle que la file de fabrication.
 *
 * Renvoie null quand la date est absente, et « expiré » quand elle est passée — l'appelant
 * décide comment le présenter.
 */
export function tempsRestant(dateIso) {
    if (!dateIso) {
        return null;
    }

    const restant = new Date(dateIso).getTime() - Date.now();
    if (Number.isNaN(restant)) {
        return null;
    }
    if (restant <= 0) {
        return "expiré";
    }

    const minutes = Math.floor(restant / 60000);
    const heures = Math.floor(minutes / 60);

    if (heures >= 24) {
        const jours = Math.floor(heures / 24);
        return `${jours} j ${heures % 24} h`;
    }
    if (heures >= 1) {
        return `${heures} h ${String(minutes % 60).padStart(2, "0")}`;
    }

    return `${Math.max(1, minutes)} min`;
}
