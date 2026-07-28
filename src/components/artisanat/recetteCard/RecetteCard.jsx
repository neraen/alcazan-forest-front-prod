import React from 'react'
import GameButton from "../../ui/gameButton/GameButton";
import Glyph from "../../ui/glyphs/Glyph";
import Panel from "../../ui/panel/Panel";
import {itemImage} from "../../inventory/screen/itemUtils";
import Vignette from "../vignette/Vignette";
import {enClair} from "../craftUtils";
import styles from './RecetteCard.module.scss'

/**
 * Carte d'une recette : ce qu'elle produit, ce qu'elle coûte, ce qu'elle demande.
 *
 * La photo est celle de l'objet PRODUIT (le serveur renvoie son nom de fichier, les
 * dossiers vivent dans `itemUtils.itemImage`). `realisable` vient du serveur et n'autorise
 * rien : `POST /api/craft/lancer` revérifie métier, niveau et matériaux disponibles —
 * la carte grisée n'est qu'un confort de lecture.
 */
const RecetteCard = ({recette, modes = [], mode, onModeChange, onFabriquer, occupe = false}) => {

    const niveauInsuffisant = recette.niveauJoueur < recette.niveauRequis;
    const manque = recette.ingredients.filter(i => i.disponible < i.requis);

    const empechement = niveauInsuffisant
        ? `${recette.metier} niveau ${recette.niveauRequis} requis (vous êtes niveau ${recette.niveauJoueur})`
        : manque.length > 0
            ? `Il vous manque : ${manque.map(i => i.nom).join(", ")}`
            : null;

    return (
        <Panel variant="soft" padding="md" radius="lg"
               className={`${styles.card} ${recette.realisable ? "" : styles.cardBloquee}`}>

            <div className={styles.head}>
                <div className={styles.thumb}>
                    <Vignette src={itemImage(recette.produit || {})} size="lg"
                              alt={recette.produit?.nom || recette.nom} initiale={recette.nom}/>
                    {recette.produit?.quantite > 1 && (
                        <span className={styles.quantite}>×{recette.produit.quantite}</span>
                    )}
                </div>

                <div className={styles.identity}>
                    <span className={styles.nom}>{recette.nom}</span>
                    <div className={styles.badges}>
                        <span className={`${styles.metier} ${niveauInsuffisant ? styles.metierBloque : ""}`}>
                            {recette.metier} · niv. {recette.niveauRequis}
                        </span>
                        {recette.produit && (
                            <span className={styles.produit}>
                                Produit {recette.produit.quantite} {recette.produit.nom}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className={styles.description}>
                {recette.description || recette.produit?.description || "Aucune description."}
            </p>

            <div className={styles.meta}>
                <span className={styles.metaItem} title="Temps de fabrication">
                    <Glyph name="clock" size={14}/> {enClair(recette.tempsSecondes)}
                </span>
                <span className={styles.metaItem} title="Expérience de métier gagnée au retrait">
                    <Glyph name="bolt" size={14}/> +{recette.experienceMetier} XP
                </span>
                <span className={styles.metaItem} title="Difficulté de la recette">
                    <Glyph name="target" size={14}/> difficulté {recette.difficulte}
                </span>
            </div>

            <div className={styles.ingredients}>
                {recette.ingredients.map(ingredient => (
                    <span key={`${ingredient.type}-${ingredient.itemId}`}
                          className={`${styles.ingredient} ${ingredient.disponible < ingredient.requis ? styles.manquant : ""}`}
                          title={ingredient.nom}>
                        <Vignette src={itemImage(ingredient)} size="sm" alt={ingredient.nom}
                                  initiale={ingredient.nom}/>
                        <span className={styles.ingredientTexte}>
                            <span className={styles.ingredientNom}>{ingredient.nom}</span>
                            <span className={styles.ingredientCompte}>
                                {ingredient.disponible} / {ingredient.requis}
                            </span>
                        </span>
                    </span>
                ))}
                {recette.ingredients.length === 0 && (
                    <span className={styles.sansIngredient}>Recette incomplète : aucun ingrédient.</span>
                )}
            </div>

            <div className={styles.pied}>
                <select className={styles.select} value={mode} disabled={occupe}
                        aria-label="Mode de fabrication"
                        onChange={(event) => onModeChange(event.target.value)}>
                    {modes.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <GameButton disabled={occupe || !recette.realisable}
                            title={empechement || "Lancer la fabrication"}
                            onClick={() => onFabriquer(recette, mode)}>
                    Fabriquer
                </GameButton>
            </div>

            {empechement && <p className={styles.empechement}>{empechement}</p>}
        </Panel>
    )
}

export default RecetteCard
