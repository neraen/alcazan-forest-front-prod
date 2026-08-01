import React from "react";
import Panel from "../../ui/panel/Panel";
import SectionTitle from "../../ui/sectionTitle/SectionTitle";
import {itemImage} from "../../inventory/screen/itemUtils";
import {tempsRestant} from "./tempsRestant";
import styles from "./HotelVenteModal.module.scss";

/**
 * Onglet « Mes ventes » : les lots encore en vente, et l'historique de ce qui s'est conclu.
 *
 * L'historique n'est pas décoratif : c'est le seul endroit où le vendeur apprend qu'un lot
 * s'est vendu pendant qu'il était déconnecté — l'or a été crédité sans notification.
 */
const HotelMesVentes = ({donnees, occupe, onRetirer}) => {

    const actives = donnees?.actives || [];
    const historique = donnees?.historique || [];
    const annoncesMax = donnees?.curseurs?.annoncesMax;

    return (
        <div className={styles.onglet}>
            <SectionTitle right={
                <span className={styles.compteur}>{actives.length} / {annoncesMax}</span>
            }>
                Lots en vente
            </SectionTitle>

            {actives.length === 0
                ? <p className={styles.vide}>Vous n'avez aucun lot en vente.</p>
                : <div className={styles.liste}>
                    {actives.map(annonce => (
                        <Panel key={annonce.id} variant="soft" padding="row" radius="lg"
                               className={styles.ligne}>
                            <Vignette annonce={annonce}/>
                            <div className={styles.ligneCorps}>
                                <div className={styles.ligneNom}>
                                    {annonce.item.nom}
                                    {annonce.quantite > 1 && <span className={styles.ligneQty}> ×{annonce.quantite}</span>}
                                </div>
                                <div className={styles.ligneMeta}>
                                    {annonce.prix} po
                                    {annonce.quantite > 1 && ` · ${annonce.prixUnitaire} po l'unité`}
                                    {" · "}{tempsRestant(annonce.expiresAt)} restant
                                </div>
                            </div>
                            <button type="button" className={styles.retirer}
                                    disabled={occupe}
                                    onClick={() => onRetirer(annonce)}>
                                Retirer
                            </button>
                        </Panel>
                    ))}
                  </div>}

            {historique.length > 0 && (
                <>
                    <SectionTitle>Historique</SectionTitle>
                    <div className={styles.liste}>
                        {historique.map(annonce => (
                            <Panel key={annonce.id} variant="soft" padding="row" radius="lg"
                                   className={`${styles.ligne} ${styles.ligneClose}`}>
                                <Vignette annonce={annonce}/>
                                <div className={styles.ligneCorps}>
                                    <div className={styles.ligneNom}>
                                        {annonce.item.nom}
                                        {annonce.quantite > 1 && <span className={styles.ligneQty}> ×{annonce.quantite}</span>}
                                    </div>
                                    <div className={styles.ligneMeta}>
                                        {annonce.statut === "vendue"
                                            ? `Vendu ${annonce.prix} po`
                                            : `${annonce.statutLabel} · ${annonce.prix} po demandés`}
                                    </div>
                                </div>
                                <span className={`${styles.badge} ${styles["badge_" + annonce.statut]}`}>
                                    {annonce.statutLabel}
                                </span>
                            </Panel>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/** Icône de l'item, avec repli sur l'initiale quand le contenu n'a pas d'image. */
const Vignette = ({annonce}) => {
    const source = itemImage(annonce.item);

    return (
        <div className={styles.ligneVignette}>
            {source
                ? <img src={source} alt={annonce.item.nom}/>
                : <span>{(annonce.item.nom || "?").charAt(0).toUpperCase()}</span>}
        </div>
    );
};

export default HotelMesVentes;
