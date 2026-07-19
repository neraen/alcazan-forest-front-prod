import React from 'react'
import styles from './SectionTitle.module.scss'

/**
 * Titre de section du design system : barre or verticale + titre Cinzel.
 * size : "md" (20px) | "lg" (22px) | "xl" (26px).
 * right : contenu optionnel poussé à droite (badge, note…).
 */
const SectionTitle = ({children, size = "md", right, className = ""}) => (
    <div className={`${styles.row} ${className}`}>
        <span className={`${styles.bar} ${styles[size + "Bar"]}`}/>
        <div className={`${styles.title} ${styles[size]}`}>{children}</div>
        {right}
    </div>
)

export default SectionTitle
