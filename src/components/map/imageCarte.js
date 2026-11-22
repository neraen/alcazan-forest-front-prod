/**
 * Fond d'une carte (`src/img/map/<id>.png`), ou null s'il n'a pas encore été peint.
 *
 * Les fonds sont EMBARQUÉS dans le bundle : `require.context` en dresse la liste au build.
 * Un `require("…/" + id + ".png")` nu JETTE quand le fichier manque — une carte créée
 * depuis l'atlas du monde (ou le MapMaker) faisait donc planter l'écran de jeu, le
 * MapMaker et l'ancien onglet Monde tant que personne n'avait déposé son image.
 */
const contexte = require.context('../../img/map', false, /^\.\/\d+\.png$/);
const disponibles = new Set(contexte.keys());

export function imageCarte(carteId) {
    const cle = `./${carteId}.png`;
    if (!disponibles.has(cle)) {
        return null;
    }
    const module = contexte(cle);
    return module.default || module;
}

/** Valeur prête pour `style.backgroundImage` (aucune image = pas de fond). */
export function fondCarte(carteId) {
    const image = imageCarte(carteId);
    return image ? `url(${image})` : 'none';
}
