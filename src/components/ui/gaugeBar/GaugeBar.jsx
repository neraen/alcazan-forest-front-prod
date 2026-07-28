import React from 'react'
import styles from './GaugeBar.module.scss'

/**
 * Barre de jauge du design system (PV / PM / XP / karma).
 * variant : "hp" | "mp" | "xp" | "karma" — pilote le dégradé de remplissage et la couleur du label.
 * label + showValues : ligne d'en-tête optionnelle (label à gauche, "value / max" à droite).
 * right : contenu libre à droite de l'en-tête, à la place de "value / max" (échelle signée).
 * marker : repère fixe sur la piste, en pourcentage — le zéro d'une échelle bipolaire.
 * Le remplissage = value / max * 100, borné à [0, 100].
 *
 * Le karma est la seule jauge BIPOLAIRE du jeu : son dégradé doit se lire sur la piste
 * entière (rouge à gauche, vert à droite) et non sur la seule partie remplie, sinon un
 * pillard et un gardien finiraient sur la même teinte en bout de barre. D'où le
 * découpage par `clip-path` plutôt que par la largeur : l'élément garde la largeur de
 * la piste, on n'en montre que la portion atteinte.
 */
const GaugeBar = ({value, max, variant = "hp", label, showValues = true, right = null, marker = null, className = ""}) => {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    const isClipped = variant === "karma";

    return (
        <div className={`${styles.gauge} ${className}`}>
            {(label || showValues || right !== null) && (
                <div className={styles.header}>
                    {label && <span className={`${styles.label} ${styles[variant + "Label"]}`}>{label}</span>}
                    {right !== null
                        ? <span className={styles.values}>{right}</span>
                        : showValues && <span className={styles.values}>{value} / {max}</span>}
                </div>
            )}
            <div className={styles.track}>
                <div className={`${styles.fill} ${styles[variant]}`}
                     style={isClipped
                         ? {clipPath: `inset(0 ${100 - pct}% 0 0)`}
                         : {width: pct + "%"}}/>
                {marker !== null && (
                    <div className={styles.zeroMark} style={{left: `${Math.max(0, Math.min(100, marker))}%`}}/>
                )}
            </div>
        </div>
    )
}

export default GaugeBar
