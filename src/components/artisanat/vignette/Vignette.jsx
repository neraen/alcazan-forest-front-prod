import React, {useEffect, useState} from 'react'
import styles from './Vignette.module.scss'

/**
 * Vignette carrée d'un item ou d'un métier, avec repli sur l'initiale.
 *
 * Le repli n'est pas cosmétique : les icônes de métier n'existent pas encore sur le disque
 * (`public/img/metier` est vide) et un objet peut n'avoir aucune image en base. Sans lui,
 * la carte affiche l'icône « image cassée » du navigateur et la grille se déforme.
 *
 * size : "sm" (36) | "md" (56) | "lg" (84).
 */
const Vignette = ({src, alt = "", initiale, size = "md", className = ""}) => {

    const [casse, setCasse] = useState(false);

    // Une nouvelle source mérite une nouvelle tentative : sans ce reset, une carte
    // recyclée par React garderait l'état « cassé » de la précédente.
    useEffect(() => setCasse(false), [src]);

    const classes = [styles.vignette, styles[size], className].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            {src && !casse
                ? <img className={styles.image} src={src} alt={alt} onError={() => setCasse(true)}/>
                : <span className={styles.initiale}>{(initiale || alt || "?").charAt(0).toUpperCase()}</span>}
        </div>
    )
}

export default Vignette
