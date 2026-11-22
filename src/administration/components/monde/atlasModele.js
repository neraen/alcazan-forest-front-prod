/**
 * Lecture de l'atlas renvoyé par `/api/admin/monde/atlas` — fonctions PURES.
 *
 * Aucune règle de géographie ici : nature, direction, état et position sont tranchés par le
 * serveur (`MondeLayout`). Le front ne fait qu'indexer et dessiner.
 */

export const DIRECTIONS = [
    {cle: 'nord', libelle: 'Nord', locatif: 'au nord', dx: 0, dy: -1, fleche: '↑'},
    {cle: 'est', libelle: 'Est', locatif: "à l'est", dx: 1, dy: 0, fleche: '→'},
    {cle: 'sud', libelle: 'Sud', locatif: 'au sud', dx: 0, dy: 1, fleche: '↓'},
    {cle: 'ouest', libelle: 'Ouest', locatif: "à l'ouest", dx: -1, dy: 0, fleche: '←'},
];

export const TYPES_CARTE = {
    monde: 'Monde',
    region: 'Région détachée',
    interieur: 'Intérieur',
    special: 'Lieu spécial',
    donjon: 'Salle de donjon',
    orpheline: 'Isolée',
};

export const ETATS_PASSAGE = {
    ok: null,
    sens_unique: 'Aller simple',
    casse: 'Cassé',
    conflit: 'Contradictoire',
};

export const CONDITIONS = {
    level: 'Niveau',
    boss: 'Boss',
    alignement: 'Alignement',
    quest: 'Quête',
};

export function indexer(atlas) {
    const cartes = new Map(atlas.cartes.map(c => [c.id, c]));
    const passages = new Map(atlas.passages.map(p => [p.id, p]));
    const sortants = new Map();
    const entrants = new Map();
    atlas.passages.forEach(p => {
        if (!sortants.has(p.de)) sortants.set(p.de, []);
        sortants.get(p.de).push(p);
        if (p.vers !== null) {
            if (!entrants.has(p.vers)) entrants.set(p.vers, []);
            entrants.get(p.vers).push(p);
        }
    });
    const enfants = new Map();
    atlas.cartes.forEach(c => {
        if (c.parentId !== null && c.parentId !== undefined) {
            if (!enfants.has(c.parentId)) enfants.set(c.parentId, []);
            enfants.get(c.parentId).push(c);
        }
    });
    const alertesParCarte = new Map();
    atlas.alertes.forEach(a => {
        if (a.carteId === null) return;
        if (!alertesParCarte.has(a.carteId)) alertesParCarte.set(a.carteId, []);
        alertesParCarte.get(a.carteId).push(a);
    });
    const donjons = new Map(atlas.donjons.map(d => [d.id, d]));
    return {cartes, passages, sortants, entrants, enfants, alertesParCarte, donjons};
}

/** Cartes d'une région, indexées par « x,y ». */
export function grilleDeRegion(atlas, regionId) {
    const grille = new Map();
    atlas.cartes.forEach(c => {
        if (c.regionId === regionId) grille.set(`${c.x},${c.y}`, c);
    });
    return grille;
}

/**
 * Directions où l'on peut accoler une carte neuve : pas de frontière sortante dans ce sens
 * et place libre sur la grille. Le serveur revérifie (`MondeEditorService::prolonger`).
 */
export function directionsLibres(carte, index, grille) {
    if (carte.donjonId !== null) return [];
    const frontieres = new Set(
        (index.sortants.get(carte.id) || [])
            .filter(p => p.nature === 'bord')
            .map(p => p.direction)
    );
    return DIRECTIONS.filter(d => {
        if (frontieres.has(d.cle)) return false;
        if (carte.regionId === null) return true;
        return !grille.has(`${carte.x + d.dx},${carte.y + d.dy}`);
    });
}

/** Un nom de départ pour la carte neuve : on n'écrit pas dans le vide. */
export function nomSuggere(carte, direction) {
    const racine = carte.nom.split(' - ')[0].trim();
    return `${racine} - ${direction.libelle.toLowerCase()}`;
}

export function correspond(carte, terme) {
    if (!terme) return true;
    const normaliser = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return normaliser(carte.nom).includes(normaliser(terme)) || String(carte.id) === terme.trim();
}
