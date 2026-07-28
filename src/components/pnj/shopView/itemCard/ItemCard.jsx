import React from "react";
import {rarityClass} from "../../../inventory/screen/itemUtils";
import styles from "./ItemCard.module.scss";

/**
 * Carte d'article d'échoppe, partagée par les onglets Acheter et Vendre : bordure de rareté,
 * vignette (+ pastille de quantité), caractéristiques ou description, prix, sélecteur de
 * quantité optionnel, et un bouton d'action unique. Toute la présentation d'un article de
 * boutique vit ici — les onglets ne portent que leur logique métier.
 *
 * Le bloc prix/quantité/bouton est collé en bas (cf. `.cardMeta`) : les boutons d'une même
 * rangée s'alignent même quand les cartes n'ont pas le même nombre de caractéristiques.
 */
const ItemCard = ({
    name,
    img,
    rarity,
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

            <div className={styles.cardBody}>
                <div className={styles.thumb}>
                    <img className={styles.thumbIcon} src={img} alt={name}/>
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
