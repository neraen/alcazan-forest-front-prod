import React from 'react'
import styles from './Panel.module.scss'

/**
 * Panneau / carte du design system (radius 16, fond vert translucide, bordure or).
 * variant : "solid" (fond opaque + overflow hidden, cadre de la carte de jeu)
 *         | "soft" (fond plus léger + bordure discrète, écrans plein page).
 * padding : "none" | "sm" (10) | "md" (20) | "row" (14/18) | "lg" (24) | "xl" (28).
 * radius : "md" (16, défaut) | "lg" (18, panneaux plein écran).
 */
const Panel = ({children, variant, padding = "md", radius = "md", className = ""}) => {
    const classes = [
        styles.panel,
        variant ? styles[variant] : "",
        styles[padding] || "",
        radius === "lg" ? styles.radiusLg : "",
        className,
    ].filter(Boolean).join(" ");

    return <div className={classes}>{children}</div>
}

export default Panel
