/**
 * Contenu éditorial de la vitrine publique (accueil + guide).
 *
 * Page PUBLIQUE : aucun appel API (le visiteur n'est pas connecté). Les noms, portées et
 * coûts des sorts sont recopiés de la base `chusei` au 15/11/2026 — si l'équilibrage
 * change, c'est ici qu'il faut les mettre à jour. Les textes d'ambiance (lore des
 * factions, rôles) sont de l'éditorial, pas des règles de jeu.
 */

const IMG = '/img/vitrine';

export const CLASSES = [
    {
        id: 'guerrier',
        nom: 'Guerrier',
        role: 'Mêlée · Tank',
        devise: '« Le premier dans la mêlée, le dernier à tomber. »',
        description:
            "Lame au poing et bouclier au bras, le guerrier encaisse ce qui ferait fuir les autres. " +
            "Il se bat au contact, tient la ligne en donjon et fait payer cher chaque pas de l'ennemi.",
        atouts: {Attaque: 4, Portée: 1, Survie: 5, Soutien: 1},
        caracs: ['Force', 'Dextérité', 'Constitution'],
        sorts: [
            {nom: 'Coup chargé', icone: 'guerrier/coupCharge.png', portee: 1, pa: 1},
        ],
        couleur: 'var(--hp-to)',
    },
    {
        id: 'archer',
        nom: 'Archer',
        role: 'Distance · Précision',
        devise: '« Ce que je vois, je le touche. »',
        description:
            "Arc recourbé et carquois bien garni, l'archer frappe avant qu'on l'atteigne. " +
            "Ses flèches empoisonnées privent la cible de soins, et sa maîtrise de l'arc décuple sa dextérité.",
        atouts: {Attaque: 4, Portée: 5, Survie: 2, Soutien: 2},
        caracs: ['Dextérité', 'Force', 'Chance'],
        sorts: [
            {nom: 'Tir rapide', icone: 'archer/tir-rapide.png', portee: 4, pa: 1},
            {nom: 'Flèche destructrice', icone: 'archer/fleche-destructrice.png', portee: 5, pa: 2},
            {nom: 'Flèche empoisonnée', icone: 'archer/fleche-empoisonnee.png', portee: 3, pa: 2},
            {nom: "Maîtrise de l'arc", icone: 'archer/maitrise-arc.png', portee: 0, pa: 3},
        ],
        couleur: 'var(--stat-dexterite)',
    },
    {
        id: 'sorcier',
        nom: 'Sorcier',
        role: 'Magie · Dégâts de zone',
        devise: '« Le feu ne négocie pas. »',
        description:
            "Bâton de cristal en main, le sorcier puise dans des arcanes que d'autres jugent impies. " +
            "Boule de feu, souffle de Borghem, déflagration incertaine : sa puissance est immense, sa prudence relative.",
        atouts: {Attaque: 5, Portée: 4, Survie: 1, Soutien: 2},
        caracs: ['Intelligence', 'Concentration', 'Constitution'],
        sorts: [
            {nom: 'Boule de feu', icone: 'sorcier/bouleDeFeu.png', portee: 5, pa: 1},
            {nom: 'Souffle de Borghem', icone: 'sorcier/souffle-borghem.png', portee: 2, pa: 3},
            {nom: 'Projectile démoniaque', icone: 'sorcier/projectile-demoniaque.png', portee: 4, pa: 2},
            {nom: 'Déflagration incertaine', icone: 'sorcier/deflagration-incertaine.png', portee: 4, pa: 3},
            {nom: 'Équilibre des sages', icone: 'sorcier/equilibre-sages.png', portee: 0, pa: 3},
        ],
        couleur: 'var(--stat-intelligence)',
    },
    {
        id: 'moine',
        nom: 'Moine',
        role: 'Soin · Soutien',
        devise: '« Mon bâton protège autant qu\'il frappe. »',
        description:
            "Discipliné et serein, le moine soigne ses alliés, les bénit de la faveur des dieux et " +
            "rappelle à l'ennemi qu'un bâton de combat bien manié vaut une épée. Indispensable en groupe.",
        atouts: {Attaque: 2, Portée: 3, Survie: 3, Soutien: 5},
        caracs: ['Concentration', 'Intelligence', 'Constitution'],
        sorts: [
            {nom: 'Soin mineur', icone: 'moine/soinMineur.png', portee: 3, pa: 1},
            {nom: 'Frappe céleste', icone: 'moine/frappeCeleste.png', portee: 3, pa: 1},
            {nom: 'Bénédiction des dieux', icone: 'moine/benediction-dieu.png', portee: 2, pa: 3},
            {nom: 'Méditation', icone: 'moine/meditation.png', portee: 0, pa: 2},
        ],
        couleur: 'var(--stat-concentration)',
    },
];

export const imageClasse = (classeId, genre) => `${IMG}/classes/${classeId}_${genre}.png`;
export const iconeSort = (chemin) => `/img/spell/${chemin}`;

export const FACTIONS = [
    {
        id: 'exiles',
        nom: 'Les Exilés',
        icone: '/img/alignement/exile.png',
        couleur: 'var(--faction-exiles)',
        devise: 'Sans terre, mais pas sans honneur.',
        lore:
            "Chassés de leurs fiefs par la couronne, les Exilés ont appris à vivre de peu et à se " +
            "serrer les coudes. Ils ne doivent rien à personne — et n'oublient aucune dette.",
        traits: ['Solidarité de clan', 'Liberté avant tout', 'Rancune tenace'],
    },
    {
        id: 'cartel',
        nom: 'Le Cartel de Brumebois',
        icone: '/img/alignement/cartel.png',
        couleur: 'var(--faction-cartel)',
        devise: 'Tout se vend, surtout le silence.',
        lore:
            "Dans la brume des sous-bois, marchands, contrebandiers et alchimistes ont bâti un " +
            "réseau que nul roi ne contrôle. Le Cartel préfère l'or au fer — mais sait manier les deux.",
        traits: ['Commerce et influence', 'Réseaux occultes', 'Pragmatisme'],
    },
    {
        id: 'royalistes',
        nom: 'Les Royalistes',
        icone: '/img/alignement/royaliste.png',
        couleur: 'var(--faction-royalistes)',
        devise: 'Pour la couronne et pour l\'ordre.',
        lore:
            "Fidèles au trône, les Royalistes défendent les routes, les villes et la loi du " +
            "royaume. Leur discipline est une forteresse ; leur fierté, parfois, une faiblesse.",
        traits: ['Discipline militaire', 'Loi et justice', 'Fierté de lignée'],
    },
];

export const MONSTRES = [
    {nom: "Loup d'Alcazan", image: '/img/vitrine/monstres/loup.jpg'},
    {nom: 'Araignée des terres désolées', image: '/img/vitrine/monstres/araignee_terre_desole.jpg'},
    {nom: "Élémental d'eau", image: '/img/vitrine/monstres/elemental_aquatique.jpg'},
    {nom: 'Gobelin guerrier', image: '/img/vitrine/monstres/gobelin_guerrier.jpg'},
    {nom: 'Sanglier', image: '/img/vitrine/monstres/sanglier.jpg'},
    {nom: 'Psilofrost', image: '/img/vitrine/monstres/psilofrost_avatar.jpg'},
    {nom: 'Libellule', image: '/img/vitrine/monstres/libellule_avatar.jpg'},
];

export const CARTES = [
    {id: 3, nom: 'Limuren — centre'},
    {id: 32, nom: "Freiwill — Château d'Alastair"},
    {id: 20, nom: 'Suncho — canaux'},
    {id: 26, nom: 'Dunhill — Manoir du rouage obscur'},
    {id: 29, nom: "Cascade des pierres d'argent"},
    {id: 11, nom: 'Donjon Scintillant'},
    {id: 34, nom: 'Freiwill — Quai'},
    {id: 19, nom: 'Suncho — commerces'},
];

export const imageCarte = (id) => `${IMG}/cartes/${id}.jpg`;
export const paysage = (nom) => `${IMG}/paysages/${nom}.jpg`;

export const METIERS = {
    recolte: ['Herboriste', 'Mineur', 'Bûcheron', 'Dépeceur'],
    fabrication: ['Alchimiste', 'Forgeron', 'Couturier', 'Bijoutier', 'Armurier', 'Cuisinier', 'Tanneur'],
};

export const CHIFFRES = [
    {valeur: '38', libelle: 'cartes à explorer'},
    {valeur: '4', libelle: 'classes à maîtriser'},
    {valeur: '3', libelle: 'factions rivales'},
    {valeur: '11', libelle: 'métiers d\'artisan'},
    {valeur: '200', libelle: 'niveaux à gravir'},
];
