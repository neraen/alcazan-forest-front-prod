import React from "react";
import {rarityClass} from "../../../inventory/screen/itemUtils";
import styles from "./ItemCard.module.scss";

/**
 * Carte d'article, partagée par les onglets Acheter et Vendre de l'échoppe ET par l'hôtel des
 * ventes : bordure de rareté, vignette (+ pastille de quantité), caractéristiques ou
 * description, prix, sélecteur de quantité optionnel, et un bouton d'action unique. Toute la
 * présentation d'un article vit ici — les onglets ne portent que leur logique métier.
 *
 * Le bloc prix/quantité/bouton est collé en bas (cf. `.cardMeta`) : les boutons d'une même
 * rangée s'alignent même quand les cartes n'ont pas le même nombre de caractéristiques.
 *
 * `subline` est volontairement une chaîne libre et non un couple vendeur/expiration : la carte
 * reste ignorante du domaine, et c'est l'hôtel des ventes qui décide comment formuler « Vendu
 * par X · 11 h restantes ». Elle n'a ainsi rien à savoir des horloges.
 */
const ItemCard = ({
    name,
    img,
    rarity,
    subline,
    caracteristiques = [],
    description,
    quantity,
    price,
    meta,
    // Sélecteur de quantité : rendu seulement si maxQuantity > 1.
    maxQuantity = 1,
    selectedQuantity = 1,
    onQuantityChange,
    actionLabel,
    pendingLabel,
    pending = false,
    disabled = false,
    disabledLabel,
    onAction,
}) => {

    const stepperVisible = maxQuantity > 1 && typeof onQuantityChange === "function";
    const stepperFige = pending || disabled;

    // Toute saisie est ramenée dans [1, maxQuantity] : le champ reste libre à taper, mais ne
    // peut pas produire une quantité que le joueur ne possède pas.
    const changerQuantite = (valeur) => {
        const nombre = Math.floor(Number(valeur));
        if(Number.isNaN(nombre)){
            return;
        }
        onQuantityChange(Math.min(maxQuantity, Math.max(1, nombre)));
    };

    return (
        <div className={`${styles.card} ${styles[rarityClass(rarity)]}`}>
            <div className={styles.cardHeader}>{name}</div>
            {subline && <div className={styles.subline}>{subline}</div>}

            <div className={styles.cardBody}>
                <div className={styles.thumb}>
                    {/* Repli sur l'initiale quand l'image manque : à l'hôtel des ventes, les
                        lots viennent de tout le contenu du jeu, dont des objets sans icône —
                        une image cassée y est bien plus visible qu'à l'échoppe. */}
                    {img
                        ? <img className={styles.thumbIcon} src={img} alt={name}/>
                        : <span className={styles.thumbInitiale}>{(name || "?").charAt(0).toUpperCase()}</span>}
                    {quantity > 1 && <span className={styles.qty}>{quantity}</span>}
                </div>

                {caracteristiques.length > 0
                    ? (
                        <div className={styles.caracs}>
                            {caracteristiques.map(caracteristique =>
                                <span key={'caracteristique' + caracteristique.id} className={styles.carac}>
                                    +{caracteristique.valeur} {caracteristique.nom}
                                </span>
                            )}
                        </div>
                    )
                    : <p className={styles.desc}>{description}</p>}
            </div>

            <div className={styles.cardMeta}>
                <span className={`${styles.price} ${price > 0 ? "" : styles.priceZero}`}>
                    <img className={styles.coin} src="/img/gui/Money03.png" alt="Or"/>
                    {price} {price > 1 ? "Pièces d'or" : "Pièce d'or"}
                </span>
                {meta && <span className={styles.meta}>{meta}</span>}
            </div>

            {stepperVisible && (
                <div className={styles.stepper}>
                    <button type="button" className={styles.stepperButton}
                            aria-label="Un de moins"
                            disabled={stepperFige || selectedQuantity <= 1}
                            onClick={() => changerQuantite(selectedQuantity - 1)}>−</button>

                    <input className={styles.stepperInput}
                           type="number" min={1} max={maxQuantity} step={1}
                           aria-label={`Quantité (${maxQuantity} maximum)`}
                           value={selectedQuantity}
                           disabled={stepperFige}
                           onChange={(event) => changerQuantite(event.target.value)}
                           onFocus={(event) => event.target.select()}/>

                    <button type="button" className={styles.stepperButton}
                            aria-label="Un de plus"
                            disabled={stepperFige || selectedQuantity >= maxQuantity}
                            onClick={() => changerQuantite(selectedQuantity + 1)}>+</button>

                    <button type="button" className={styles.stepperAll}
                            disabled={stepperFige || selectedQuantity >= maxQuantity}
                            onClick={() => changerQuantite(maxQuantity)}>Tout</button>
                </div>
            )}

            <button type="button" className={styles.action}
                    disabled={disabled || pending}
                    onClick={onAction}>
                {pending ? pendingLabel : (disabled && disabledLabel ? disabledLabel : actionLabel)}
            </button>
        </div>
    );
};

export default ItemCard;
