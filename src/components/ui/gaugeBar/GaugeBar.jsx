import React from 'react'
import styles from './GaugeBar.module.scss'

/**
 * Barre de jauge du design system (PV / PM / XP).
 * variant : "hp" | "mp" | "xp" — pilote le dégradé de remplissage et la couleur du label.
 * label + showValues : ligne d'en-tête optionnelle (label à gauche, "value / max" à droite).
 * Le remplissage = value / max * 100, borné à [0, 100].
 */
const GaugeBar = ({value, max, variant = "hp", label, showValues = true, className = ""}) => {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

    return (
        <div className={`${styles.gauge} ${className}`}>
            {(label || showValues) && (
                <div className={styles.header}>
                    {label && <span className={`${styles.label} ${styles[variant + "Label"]}`}>{label}</span>}
                    {showValues && <span className={styles.values}>{value} / {max}</span>}
                </div>
            )}
            <div className={styles.track}>
                <div className={`${styles.fill} ${styles[variant]}`} style={{width: pct + "%"}}/>
            </div>
        </div>
    )
}

export default GaugeBar
