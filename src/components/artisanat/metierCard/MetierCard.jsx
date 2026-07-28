import React from 'react'
import GaugeBar from "../../ui/gaugeBar/GaugeBar";
import Panel from "../../ui/panel/Panel";
import Vignette from "../vignette/Vignette";
import styles from './MetierCard.module.scss'

/**
 * Fiche de progression d'un métier appris (récolte comme fabrication).
 *
 * La barre se trace entre les DEUX paliers renvoyés par le serveur
 * (`experienceNiveauCourant` → `experienceProchainNiveau`) : une barre calculée sur
 * 0 → prochain palier repartirait en arrière à chaque montée de niveau.
 *
 * L'icône est stockée SANS extension en base (`CollectionImage::METIER`) : le `.png` se
 * recolle ici, et `Vignette` se replie sur l'initiale quand le fichier n'existe pas.
 */
const MetierCard = ({metier, actif = false, compact = false, onClick}) => {

    const acquis = Math.max(0, metier.experience - metier.experienceNiveauCourant);
    const palier = Math.max(1, metier.experienceProchainNiveau - metier.experienceNiveauCourant);
    const auMaximum = metier.niveau >= metier.niveauMax;

    const contenu = (
        <Panel variant="soft" padding={compact ? "row" : "md"} radius="lg"
               className={`${styles.card} ${compact ? styles.cardCompacte : ""} ${actif ? styles.cardActive : ""}`}>
            <div className={styles.head}>
                <Vignette src={metier.icone ? `/img/metier/${metier.icone}.png` : null}
                          alt={metier.nom} initiale={metier.nom} size={compact ? "sm" : "md"}/>
                <div className={styles.identity}>
                    <span className={styles.nom}>{metier.nom}</span>
                    <div className={styles.badges}>
                        <span className={styles.famille}>{metier.familleLabel}</span>
                        <span className={styles.niveau}>Niveau {metier.niveau} / {metier.niveauMax}</span>
                    </div>
                </div>
            </div>

            {metier.description && <p className={styles.description}>{metier.description}</p>}

            <GaugeBar variant="xp" label="Expérience"
                      value={auMaximum ? palier : acquis} max={palier}
                      right={auMaximum
                          ? <span className={styles.maitrise}>Maîtrise complète</span>
                          : <span className={styles.chiffres}>{acquis} / {palier}</span>}/>
        </Panel>
    );

    if (!onClick) {
        return contenu;
    }

    return (
        <button type="button" className={styles.bouton} onClick={onClick}
                aria-pressed={actif} title={`Voir les recettes de ${metier.nom}`}>
            {contenu}
        </button>
    )
}

export default MetierCard
