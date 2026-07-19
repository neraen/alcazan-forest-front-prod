/**
 * Normalisation des objets d'inventaire (équipements / consommables / objets)
 * vers une forme unique consommée par InventoryScreen et ItemDetailBar.
 * Forme : { key, cat, name, img, qty, desc, value, rarity, levelMin,
 *           caracteristiques, equipped, raw }
 */

export const RARITY_LABEL = {
    "commun": "Commun",
    "peu-commun": "Peu commun",
    "rare": "Rare",
    "epique": "Épique",
    "legendaire": "Légendaire",
    "heroique": "Héroïque",
};

export const CAT_LABEL = {
    equipement: "Équipement",
    consommable: "Consommable",
    objet: "Objet",
};

// Position d'équipement → label court + glyphe de slot vide.
export const EQUIP_SLOTS = {
    left: [
        {position: "tete", label: "Tête", empty: "helmet"},
        {position: "cou", label: "Cou", empty: "amulet"},
        {position: "corps", label: "Corps", empty: "chest"},
        {position: "jambes", label: "Jambes", empty: "legs"},
    ],
    right: [
        {position: "bras-gauche", label: "Bras G.", empty: "shield"},
        {position: "bras-droit", label: "Bras D.", empty: "sword"},
        {position: "pieds", label: "Pieds", empty: "boots"},
    ],
};

export const rarityClass = (rarity) => "rarity-" + (rarity || "commun");

export function normalizeEquipement(e, equipped = false) {
    return {
        key: (equipped ? "worn-" : "eq-") + e.idEquipement,
        cat: "equipement",
        id: e.idEquipement,
        name: e.nomEquipement,
        img: `/img/equipement/${e.position}/${e.imageEquipement}`,
        qty: e.quantity || 1,
        desc: e.descriptionEquipement,
        value: e.prixReventeEquipement,
        rarity: e.rarityName || "commun",
        levelMin: e.levelMinEquipement,
        caracteristiques: e.caracteristiques || [],
        position: e.position,
        equipped,
        raw: e,
    };
}

export function normalizeConsommable(c) {
    return {
        key: "co-" + c.idConsommable,
        cat: "consommable",
        id: c.idConsommable,
        name: c.nomConsommable,
        img: `/img/consommables/${c.imageConsommable}`,
        qty: c.quantity || 1,
        desc: c.descriptionConsommable,
        value: c.prixReventeConsommable,
        rarity: c.rarityName || "commun",
        caracteristiques: [],
        equipped: false,
        raw: c,
    };
}

export function normalizeObjet(o) {
    return {
        key: "ob-" + o.idObjet,
        cat: "objet",
        id: o.idObjet,
        name: o.nomObjet,
        img: `/img/objet/${o.imageObjet}`,
        qty: o.quantity || 1,
        desc: o.descriptionObjet,
        value: o.prixReventeObjet,
        rarity: o.rarityName || "commun",
        caracteristiques: [],
        equipped: false,
        raw: o,
    };
}
