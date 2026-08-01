import React from 'react'
import Panel from "../../ui/panel/Panel";
import {itemImage} from "../../inventory/screen/itemUtils";
import Vignette from "../vignette/Vignette";
import styles from './RessourceCard.module.scss'

/**
 * Carte d'une ressource d'un métier de récolte.
 *
 * `accessible` vient du serveur (niveau du joueur ≥ niveau de la ressource) et
 * n'autorise rien : la récolte reste arbitrée par `InteractionService` sur la case.
 * Une ressource hors de portée est grisée plutôt que masquée — c'est ce qui dit au
 * joueur ce que son prochain niveau lui ouvrira.
 */
const RessourceCard = ({ressource}) => (
    <Panel variant="soft" padding="row" radius="lg"
           className={`${styles.card} ${ressource.accessible ? "" : styles.cardBloquee}`}>
        <Vignette src={itemImage(ressource)} size="md"
                  alt={ressource.nom} initiale={ressource.nom}/>

        <div className={styles.corps}>
            <div className={styles.tete}>
                <span className={styles.nom}>{ressource.nom}</span>
                <span className={`${styles.niveau} ${ressource.accessible ? "" : styles.niveauBloque}`}>
                    Niv. {ressource.niveauRequis}
                </span>
            </div>

            <p className={styles.description}>
                {ressource.accessible
                    ? (ressource.description || "Aucune description.")
                    : `Niveau ${ressource.niveauRequis} requis pour la récolter.`}
            </p>
        </div>
    </Panel>
)

export default RessourceCard
