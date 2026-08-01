import React from 'react';
import styles from './Sparkline.module.scss';

/**
 * Courbe d'activité minimale, en SVG pur.
 *
 * Aucune librairie de graphiques, et c'est un choix contraint : le build est en CRA 4 /
 * webpack 4, où `recharts` et `chart.js` tirent une arborescence `d3-*` dont les versions
 * récentes sont ESM-only. Ajouter l'une d'elles risquerait de casser le build de tout le jeu
 * pour une courbe de trente points. Le jour où il faudra des axes, des infobulles et du zoom,
 * la réponse honnête sera « ajouter une librairie », et le prérequis sera la migration vers
 * Vite — un autre chantier, à ne pas faire en douce ici.
 *
 * `preserveAspectRatio="none"` : la courbe s'étire à la largeur disponible. C'est acceptable
 * parce qu'elle n'est pas lue au pixel — elle donne une forme, pas une mesure. Les valeurs
 * exactes sont dans les tuiles à côté.
 *
 * @param {{points: number[], label?: string, variant?: string, height?: number}} props
 */
const Sparkline = ({points = [], label, variant = "or", height = 48}) => {

    if (points.length < 2) {
        return <div className={styles.vide}>Pas encore assez de données.</div>;
    }

    const largeur = 100;
    const max = Math.max(...points, 1);
    // Une marge haute d'un pixel évite que le sommet de la courbe soit rogné par le trait.
    const y = (valeur) => height - 1 - (valeur / max) * (height - 2);
    const x = (index) => (index / (points.length - 1)) * largeur;

    const ligne = points.map((valeur, index) => `${x(index)},${y(valeur)}`).join(" ");
    const aire = `0,${height} ${ligne} ${largeur},${height}`;

    return <div className={styles.sparkline}>
        {label && <div className={styles.entete}>
            <span className={styles.label}>{label}</span>
            <span className={styles.max}>max {max.toLocaleString("fr-FR")}</span>
        </div>}
        {/* La hauteur est posée EN LIGNE et pas en CSS : avec `preserveAspectRatio="none"`
            et une largeur fluide, un `height: auto` ferait suivre le ratio du viewBox — une
            courbe de 100×48 dans un bloc de 500 px ferait 240 px de haut. */}
        <svg className={`${styles.svg} ${styles[variant] || ""}`}
             viewBox={`0 0 ${largeur} ${height}`}
             style={{height: `${height}px`}}
             preserveAspectRatio="none"
             role="img"
             aria-label={label ? `Courbe : ${label}` : "Courbe d'activité"}>
            <polygon className={styles.aire} points={aire}/>
            <polyline className={styles.trait} points={ligne}/>
        </svg>
    </div>;
};

export default Sparkline;
