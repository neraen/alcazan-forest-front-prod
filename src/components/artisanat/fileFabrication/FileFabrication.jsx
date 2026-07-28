import React from 'react'
import GameButton from "../../ui/gameButton/GameButton";
import GaugeBar from "../../ui/gaugeBar/GaugeBar";
import Glyph from "../../ui/glyphs/Glyph";
import {itemImage} from "../../inventory/screen/itemUtils";
import Vignette from "../vignette/Vignette";
import {avancement, enClair, secondesRestantes, useHorloge} from "../craftUtils";
import styles from './FileFabrication.module.scss'

/**
 * La file de fabrication du joueur : une ligne par commande en cours.
 *
 * Rendue à deux endroits (page Artisanat et modale Atelier) — d'où le composant partagé
 * plutôt que deux markups à garder synchronisés.
 *
 * Aucune règle de jeu ici : `prete` vient du serveur, qui revérifie au retrait. Le compte
 * à rebours et la barre sont recalculés depuis `lanceeAt`/`pretAt` (horloge serveur).
 */
const FileFabrication = ({commandes = [], commandesMax, occupe = false, onRetirer, onAnnuler}) => {

    useHorloge(commandes.length > 0);

    if (commandes.length === 0) {
        return (
            <p className={styles.vide}>
                Votre établi est vide : lancez une fabrication pour l'occuper.
            </p>
        );
    }

    return (
        <div className={styles.liste}>
            {commandes.map(commande => {
                const restant = secondesRestantes(commande.pretAt);
                const prete = commande.prete || restant <= 0;
                const image = itemImage(commande.produit || {});

                return (
                    <div key={commande.id} className={`${styles.ligne} ${prete ? styles.lignePrete : ""}`}>
                        <Vignette src={image} alt={commande.produit?.nom || commande.nom}
                                  initiale={commande.nom} size="md"/>

                        <div className={styles.corps}>
                            <div className={styles.entete}>
                                <span className={styles.nom}>{commande.nom}</span>
                                <span className={styles.mode}>{commande.modeLabel}</span>
                                {commande.produit && (
                                    <span className={styles.produit}>
                                        → {commande.produit.quantite} {commande.produit.nom}
                                    </span>
                                )}
                            </div>

                            <GaugeBar variant="xp" showValues={false}
                                      value={prete ? 100 : avancement(commande.lanceeAt, commande.pretAt)} max={100}
                                      right={prete
                                          ? <span className={styles.prete}>Prête</span>
                                          : <span className={styles.restant}>
                                                <Glyph name="clock" size={13}/> {enClair(restant)}
                                            </span>}/>
                        </div>

                        <div className={styles.actions}>
                            {prete
                                ? <GameButton disabled={occupe} onClick={() => onRetirer(commande)}>Retirer</GameButton>
                                : <GameButton disabled={occupe} onClick={() => onAnnuler(commande)}>Annuler</GameButton>}
                        </div>
                    </div>
                );
            })}

            {commandesMax > 0 && commandes.length >= commandesMax && (
                <p className={styles.plafond}>
                    Établi complet ({commandes.length} / {commandesMax}) : retirez une fabrication pour en lancer une autre.
                </p>
            )}
        </div>
    )
}

export default FileFabrication
