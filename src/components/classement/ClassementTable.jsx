import React from 'react';
import styles from './ClassementTable.module.scss';

/**
 * Le tableau d'un classement. UN seul composant pour toutes les catégories, et c'est
 * délibéré : les colonnes ne changent pas d'un classement à l'autre, seul l'intitulé de la
 * valeur bouge — et il vient du serveur. Un composant par catégorie (ce que suggéraient les
 * cinq fichiers vides de 2023) aurait obligé à toucher le front à chaque ajout.
 *
 * Le rang est calculé par le SERVEUR et non déduit de l'index : deux joueurs à égalité
 * partagent le même rang, ce qu'un `index + 1` ne saurait pas exprimer.
 *
 * @param {{intitule: string, format: string, lignes: Array, moiUserId: ?number}} props
 */
const ClassementTable = ({intitule, format, lignes, moiUserId, cible = "joueur"}) => {

    if (!lignes || lignes.length === 0) {
        return <p className={styles.vide}>Personne n'est encore classé ici.</p>;
    }

    const formater = (valeur) => {
        const rendu = valeur.toLocaleString("fr-FR");
        return format === "or" ? `${rendu} po` : rendu;
    };

    // Une guilde n'a ni classe ni niveau de personnage : les deux colonnes du milieu
    // changent de sens selon ce qui est classé. Le serveur le dit (`categorie.cible`),
    // le front n'en décide pas.
    const guildes = cible === "guilde";

    return <div className={styles.table}>
        <div className={styles.head}>
            <span>Rang</span>
            <span>{guildes ? "Guilde" : "Joueur"}</span>
            <span>{guildes ? "Membres" : "Classe"}</span>
            <span>{guildes ? "" : "Niveau"}</span>
            <span className={styles.valeurHead}>{intitule}</span>
        </div>

        <div className={styles.list}>
            {lignes.map((ligne) => (
                <div key={ligne.userId}
                     className={`${styles.row} ${ligne.userId === moiUserId ? styles.rowYou : ""}`}>
                    <span className={`${styles.rang} ${ligne.rang <= 3 ? styles.podium : ""}`}>
                        {ligne.rang}
                    </span>
                    <span className={styles.pseudo}>{ligne.pseudo}</span>
                    <span className={styles.classe}>
                        {guildes ? (ligne.membres ?? "—") : (ligne.classe || "—")}
                    </span>
                    <span className={styles.niveau}>{guildes ? "" : (ligne.niveau ?? "—")}</span>
                    <span className={styles.valeur}>{formater(ligne.valeur)}</span>
                </div>
            ))}
        </div>
    </div>;
};

export default ClassementTable;
