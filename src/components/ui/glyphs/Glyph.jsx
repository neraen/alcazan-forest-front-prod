import React from 'react'

/**
 * Glyphes SVG inline du design system (tracés issus des maquettes design/).
 * Le trait utilise currentColor : la couleur se pilote via `color` en CSS
 * sur le glyphe ou un parent.
 */
export const GLYPHS = {
    // caractéristiques
    heart: '<path d="M12 20C7 16 3 12 3 8a4 4 0 018-1 4 4 0 018 1c0 4-4 8-9 12z"/>',
    strength: '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    wisdom: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/>',
    speed: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    luck: '<path d="M12 12c-1.2-3-5-3.6-6-.8s2 4.6 6 .8zM12 12c1.2-3 5-3.6 6-.8s-2 4.6-6 .8zM12 12c-3-1.2-3.6-5-.8-6s4.6 2 .8 6zM12 12c-3 1.2-3.6 5-.8 6s4.6-2 .8-6zM12 13.5V20"/>',
    // équipement (slots vides du paperdoll)
    helmet: '<path d="M4 15a8 8 0 0116 0v2a1 1 0 01-1 1H5a1 1 0 01-1-1z"/><path d="M12 7v11"/><path d="M8 18l1-3M16 18l-1-3"/>',
    amulet: '<path d="M7 3l5 5 5-5"/><circle cx="12" cy="15" r="4.5"/><path d="M12 12.5v5M9.5 15h5"/>',
    chest: '<path d="M6 4l6 2.5L18 4l1.5 6-3.5 2v7H8v-7l-3.5-2z"/>',
    legs: '<path d="M7 3h10l-.5 8-2 10h-3.5L11 13l-.5 8H7L5 11z"/>',
    boots: '<path d="M7 3h4v9l6.5 4.5V20H7z"/><path d="M7 16h10"/>',
    gloves: '<path d="M8 21v-8M8 13a2 2 0 014 0M12 13v-4a2 2 0 014 0v6l3 2v2H8"/>',
    sword: '<path d="M14.5 4.5L20 4l-.5 5.5-8 8"/><path d="M4 20l3.5-3.5"/><path d="M6.5 13.5l4 4"/><path d="M4 17l3 3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    // divers
    book: '<path d="M6 4h9a3 3 0 013 3v13H8a2 2 0 01-2-2z"/><path d="M6 4a2 2 0 00-2 2 2 2 0 002 2"/><path d="M10 9h5M10 13h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
};

const Glyph = ({name, size = 22, className = ""}) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
         fill="none" stroke="currentColor" strokeWidth={1.7}
         strokeLinecap="round" strokeLinejoin="round"
         dangerouslySetInnerHTML={{__html: GLYPHS[name] || GLYPHS.heart}}/>
)

export default Glyph
