import React from 'react';

/**
 * Pictogrammes de l'atlas du monde (trait en currentColor, même grammaire que `ui/glyphs`).
 * Locaux à l'outil : ils ne servent nulle part dans le jeu.
 */
const TRACES = {
    porte: '<path d="M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16"/><path d="M4 21h16"/><circle cx="14.5" cy="12.5" r=".8"/>',
    donjon: '<path d="M4 21V8l3-2 3 2V5l2-2 2 2v3l3-2 3 2v13"/><path d="M10 21v-5a2 2 0 014 0v5"/>',
    cimetiere: '<path d="M8 21V9a4 4 0 018 0v12"/><path d="M5 21h14"/><path d="M12 9v6M9.5 11.5h5"/>',
    auberge: '<path d="M3 11l9-7 9 7"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/>',
    cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    pnj: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    monstre: '<path d="M5 10a7 7 0 0114 0v6l-2 2-2-2-3 3-3-3-2 2-2-2z"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="10" r="1"/>',
    interaction: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="3"/>',
    joueurs: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    cible: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    crayon: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
    alerte: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
    etoile: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    recentrer: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    moins: '<path d="M5 12h14"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/>',
    fermer: '<path d="M6 6l12 12M18 6L6 18"/>',
    // Item Maker : sources et usages des objets.
    boss: '<path d="M4 8l4 3 4-6 4 6 4-3-2 11H6z"/><path d="M6 19h12"/>',
    quete: '<path d="M7 3h10v18l-5-4-5 4z"/><path d="M10 8h4"/>',
    recette: '<path d="M14 4l6 6-9 9H5v-6z"/><path d="M12 6l6 6"/>',
    recolte: '<path d="M12 21V11"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/>',
    coffre: '<rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 9a4 4 0 014-4h10a4 4 0 014 4"/><path d="M11 12h2v3h-2z"/>',
    marchand: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a2.5 2.5 0 01-5 0 2.5 2.5 0 01-5 0 2.5 2.5 0 01-5 0z"/><path d="M5 12v8h14v-8"/>',
    sac: '<path d="M8 8V6a4 4 0 018 0v2"/><path d="M5 8h14l-1 12H6z"/>',
    potion: '<path d="M10 3h4M10 3v5L6 15a4 4 0 003.5 6h5A4 4 0 0018 15l-4-7V3"/><path d="M7.5 14h9"/>',
    epee: '<path d="M14.5 4.5L20 4l-.5 5.5-8 8"/><path d="M4 20l3.5-3.5"/><path d="M6.5 13.5l4 4"/>',
    ingredient: '<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>',
    carte: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
};

const IconeAtlas = ({nom, taille = 16, className = ""}) => (
    <svg viewBox="0 0 24 24" width={taille} height={taille} className={className} aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
         dangerouslySetInnerHTML={{__html: TRACES[nom] || TRACES.cible}}/>
);

/** Pictogramme d'une destination selon sa nature. */
export function iconeDeCarte(carte) {
    if (!carte) return 'alerte';
    if (carte.donjonId !== null) return 'donjon';
    if (carte.cimetiere) return 'cimetiere';
    if (carte.auberge) return 'auberge';
    return 'porte';
}

export default IconeAtlas;
