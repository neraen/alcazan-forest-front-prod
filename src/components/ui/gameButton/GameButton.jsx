import React from 'react'
import styles from './GameButton.module.scss'

/**
 * Bouton or « outline » du design system (ex : Déconnexion).
 * as="link" rend un <a>-like via un <button> reste le défaut ; pour un vrai lien,
 * appliquer la même classe exportée `buttonClass` sur un <Link>/<NavLink>.
 */
const GameButton = ({children, onClick, type = "button", className = "", disabled = false, title}) => (
    <button type={type} onClick={onClick} className={`${styles.button} ${className}`}
            disabled={disabled} title={title}>
        {children}
    </button>
)

export const buttonClass = styles.button;

export default GameButton
