import React from 'react'
import styles from './Slot.module.scss'

/**
 * Slot d'action du design system (sort, potion, buff).
 * size : "md" (54px, radius 10) | "mini" (25px, radius 6, grille de buffs).
 * Sans `src` → slot vide (pointillés). `children` = overlays (filtre de cooldown…).
 * Le hover (bordure or + lift) ne s'applique qu'aux slots remplis.
 */
const Slot = ({src, alt = "", title, size = "md", onClick, className = "", children}) => {
    const classes = [
        styles.slot,
        styles[size],
        src ? styles.filled : styles.empty,
        onClick ? styles.clickable : "",
        className,
    ].filter(Boolean).join(" ");

    return (
        <div className={classes} title={title} onClick={onClick}>
            {src && <img className={styles.icon} src={src} alt={alt}/>}
            {children}
        </div>
    )
}

export default Slot
