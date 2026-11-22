import {itemImage} from "../../../components/inventory/screen/itemUtils";

/**
 * Lecture du catalogue de `/api/admin/items/catalogue` — fonctions PURES.
 * Sources, usages et alertes sont tranchés par le serveur (`ItemAtlasService`).
 */

export const FAMILLES = [
    {cle: 'tous', libelle: 'Tous'},
    {cle: 'ressource', libelle: 'Ressources de métier'},
    {cle: 'objet', libelle: 'Objets'},
    {cle: 'consommable', libelle: 'Consommables'},
    {cle: 'equipement', libelle: 'Équipements'},
];

export const TYPES_SOURCE = {
    monstre: {libelle: 'Butin de monstre', icone: 'monstre', couleur: 'var(--danger-text)', lien: '/administration/monstres'},
    boss: {libelle: 'Récompense de boss', icone: 'boss', couleur: 'var(--rarity-epique)', lien: '/administration/donjonmaker'},
    quete: {libelle: 'Récompense de quête', icone: 'quete', couleur: 'var(--gold)', lien: '/administration/questmaker'},
    recolte: {libelle: 'Récolte', icone: 'recolte', couleur: 'var(--success)', lien: '/administration/interactions'},
    coffre: {libelle: 'Coffre / case', icone: 'coffre', couleur: 'var(--pa-label)', lien: '/administration/interactions'},
    recette: {libelle: 'Fabrication', icone: 'recette', couleur: 'var(--mp-label)', lien: '/administration/artisanat'},
    marchand: {libelle: 'Marchand', icone: 'marchand', couleur: 'var(--text-ice)', lien: '/administration/shopmaker'},
};

export const TYPES_USAGE = {
    ingredient: {libelle: 'Ingrédient de recette', icone: 'recette', couleur: 'var(--mp-label)', lien: '/administration/artisanat'},
    quete: {libelle: 'Demandé par une quête', icone: 'quete', couleur: 'var(--gold)', lien: '/administration/questmaker'},
    prerequis: {libelle: 'Clé de quête', icone: 'cadenas', couleur: 'var(--gold-pale)', lien: '/administration/questmaker'},
};

export const ICONE_TYPE = {objet: 'sac', consommable: 'potion', equipement: 'epee'};
export const LIBELLE_TYPE = {objet: 'Objet', consommable: 'Consommable', equipement: 'Équipement'};

export function imageItem(item) {
    return itemImage({type: item.type, image: item.image, position: item.position});
}

export function familleDe(item) {
    if (item.type === 'objet' && item.metier) return 'ressource';
    return item.type;
}

/** Sous-titre court d'une carte d'item. */
export function sousTitre(item) {
    if (item.type === 'equipement') return `${item.position || '?'} · niv. ${item.niveau}`;
    if (item.type === 'consommable') {
        const c = item.consommable;
        if (!c) return 'Consommable';
        if (c.type === 'buff') return c.buff ? resumeBuff(c.buff) : 'Bonus à choisir';
        return `+${c.points} ${c.type}`;
    }
    if (item.metier) return `${item.metier.nom} · niv. ${item.niveauRessource}`;
    return item.prixVente ? `${item.prixVente} po` : 'Objet';
}

/** 600 → « 10 min », 90 → « 1 min 30 s », 45 → « 45 s ». */
export function formatDuree(secondes) {
    const s = Number(secondes) || 0;
    if (s < 60) return `${s} s`;
    const min = Math.floor(s / 60);
    const reste = s % 60;
    return reste ? `${min} min ${reste} s` : `${min} min`;
}

const signe = (v) => (v > 0 ? `+${v}` : `${v}`);

/** Effet RÉEL d'un bonus (lu dans buff_caracteristique) : « intelligence +21 · 10 min ». */
export function resumeBuff(buff) {
    if (!buff) return '';
    const effets = buff.effets.length ? buff.effets.map(e => `${e.nom} ${signe(e.valeur)}`).join(', ') : 'aucun effet';
    return `${effets} · ${formatDuree(buff.duree)}`;
}

/** Phrase de description d'une potion tirée de son bonus (le joueur ne lit que la description). */
export function descriptionDepuisBuff(buff) {
    const effets = buff.effets.map(e => `${signe(e.valeur)} ${e.nom}`).join(', ');
    const s = Number(buff.duree) || 0;
    const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
    const duree = [Math.floor(s / 60) && pluriel(Math.floor(s / 60), 'minute'), s % 60 && pluriel(s % 60, 'seconde')]
        .filter(Boolean).join(' ');
    return `${effets} pendant ${duree}. Une seule potion de caractéristiques active à la fois.`;
}

/** Groupes d'affichage du catalogue, dans un ordre stable. */
export function grouper(items) {
    const groupes = new Map();
    const ajouter = (cle, titre, item) => {
        if (!groupes.has(cle)) groupes.set(cle, {cle, titre, items: []});
        groupes.get(cle).items.push(item);
    };
    const tries = [...items].sort((a, b) =>
        (a.niveauRessource ?? a.niveau ?? 0) - (b.niveauRessource ?? b.niveau ?? 0) || a.nom.localeCompare(b.nom));
    tries.filter(i => i.type === 'objet' && i.metier)
        .sort((a, b) => a.metier.nom.localeCompare(b.metier.nom))
        .forEach(i => ajouter(`m-${i.metier.id}`, `Ressources · ${i.metier.nom}`, i));
    tries.filter(i => i.type === 'objet' && !i.metier).forEach(i => ajouter('objets', 'Objets divers', i));
    tries.filter(i => i.type === 'consommable').forEach(i => ajouter('consommables', 'Consommables', i));
    tries.filter(i => i.type === 'equipement')
        .sort((a, b) => (a.position || '').localeCompare(b.position || ''))
        .forEach(i => ajouter(`e-${i.position}`, `Équipements · ${i.position || 'sans position'}`, i));
    return [...groupes.values()];
}

export function filtrer(items, {famille, metierId, terme, aTraiter}) {
    const normaliser = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const t = normaliser(terme).trim();
    return items.filter(item => {
        if (famille !== 'tous' && familleDe(item) !== famille) return false;
        if (metierId && item.metier?.id !== Number(metierId)) return false;
        if (aTraiter && !item.alertes.some(a => a.code !== 'sans_image')) return false;
        if (!t) return true;
        return normaliser(item.nom).includes(t)
            || item.sources.some(s => normaliser(s.nom).includes(t))
            || item.usages.some(u => normaliser(u.nom).includes(t));
    });
}

export const formatChance = (chance) =>
    chance === null || chance === undefined ? null : `${String(chance).replace('.', ',')} %`;

/** « environ 1 combat sur 20 » : c'est ce que le concepteur se représente, pas un pourcentage. */
export function frequence(chance) {
    const c = Number(String(chance).replace(',', '.'));
    if (!c || c <= 0) return null;
    if (c >= 100) return 'à chaque combat';
    // Au-delà d'une chance sur cinq, « 1 sur 1 » ou « 1 sur 2 » écraseraient la différence
    // entre 55 % et 95 % : on parle en dixièmes.
    if (c >= 20) return `≈ ${Math.round(c / 10)} combats sur 10`;
    return `≈ 1 combat sur ${Math.round(100 / c)}`;
}
