import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ArtisanatMakerApi from "../../../services/ArtisanatMakerApi";

const RECETTE_VIDE = {
    id: 0, nom: "", description: "", metierId: null, niveauRequis: 1,
    difficulte: 1, tempsSecondes: 60, experienceMetier: 0, actif: true
};
const PRODUIT_VIDE = {objetId: null, equipementId: null, consommableId: null, quantity: 1};
const INGREDIENT_VIDE = {id: 0, objetId: null, equipementId: null, consommableId: null, quantite: 1};

/** Sélecteur d'item à trois familles — la forme d'une Recompense, réutilisée. */
const SelecteurItem = ({valeur, referentiels, onChange}) => {
    const famille = valeur.equipementId ? "equipement" : (valeur.consommableId ? "consommable" : "objet");
    const catalogue = {objet: referentiels.objets, equipement: referentiels.equipements, consommable: referentiels.consommables}[famille];
    const idCourant = valeur.objetId ?? valeur.equipementId ?? valeur.consommableId ?? "";

    const changerFamille = (nouvelle) => onChange({objetId: null, equipementId: null, consommableId: null, [`${nouvelle}Id`]: null});
    const changerItem = (id) => onChange({objetId: null, equipementId: null, consommableId: null, [`${famille}Id`]: id ? Number(id) : null});

    return (
        <>
            <select value={famille} onChange={(event) => changerFamille(event.target.value)}>
                <option value="objet">Objet</option>
                <option value="equipement">Équipement</option>
                <option value="consommable">Consommable</option>
            </select>
            <select value={idCourant} onChange={(event) => changerItem(event.target.value)}>
                <option value="">— Choisir —</option>
                {catalogue.map(item => <option key={item.id} value={item.id}>{item.nom}</option>)}
            </select>
        </>
    );
};

/**
 * Fiche d'une recette : identité, métier, temps, sortie et ingrédients.
 *
 * **Ids stables** : les ingrédients envoyés avec un id sont mis à jour, ceux sans id créés,
 * ceux retirés supprimés. `craft_commande` référence les recettes — tout recréer casserait
 * les fabrications en cours.
 *
 * L'XP est SUGGÉRÉE à partir du niveau et de la difficulté, jamais imposée : enfermer
 * l'équilibrage dans une formule obligerait à redéployer pour retoucher un chiffre.
 */
const RecetteForm = ({recetteId, referentiels, config, onSaved}) => {

    const [recette, setRecette] = useState(RECETTE_VIDE);
    const [produit, setProduit] = useState(PRODUIT_VIDE);
    const [ingredients, setIngredients] = useState([]);
    const [suggeree, setSuggeree] = useState(0);
    const [enregistrement, setEnregistrement] = useState(false);

    useEffect(() => {
        if(!recetteId){
            setRecette(RECETTE_VIDE);
            setProduit(PRODUIT_VIDE);
            setIngredients([]);
            return;
        }
        ArtisanatMakerApi.getRecette(recetteId)
            .then(donnees => {
                setRecette({...RECETTE_VIDE, ...donnees.recette});
                setProduit({...PRODUIT_VIDE, ...donnees.produit});
                setIngredients(donnees.ingredients);
                setSuggeree(donnees.experienceSuggeree);
            })
            .catch(() => toast.error("Impossible de charger cette recette."));
    }, [recetteId]);

    const champ = (nom) => (event) => {
        const {type, checked, value} = event.target;
        const valeur = type === "checkbox" ? checked
            : (type === "number" ? (value === "" ? 0 : Number(value)) : value);
        setRecette(precedent => ({...precedent, [nom]: valeur}));
    };

    const majIngredient = (index, patch) => setIngredients(precedent =>
        precedent.map((ligne, i) => i === index ? {...ligne, ...patch} : ligne));

    // ⚠️ preventDefault() obligatoire (doc §15.1).
    const handleSubmit = async (event) => {
        event.preventDefault();
        setEnregistrement(true);
        try {
            const sauvegarde = await ArtisanatMakerApi.saveRecette({recette, produit, ingredients});
            setRecette({...RECETTE_VIDE, ...sauvegarde.recette});
            setProduit({...PRODUIT_VIDE, ...sauvegarde.produit});
            setIngredients(sauvegarde.ingredients);
            setSuggeree(sauvegarde.experienceSuggeree);
            toast.success("Recette enregistrée.");
            onSaved(sauvegarde.recette);
        } catch (error) {
            toast.error(error.response?.data?.error || "L'enregistrement a échoué.");
        } finally {
            setEnregistrement(false);
        }
    };

    const modeLePlusLong = (config.modesCraft || []).reduce(
        (max, mode) => Math.max(max, mode.temps), 1);

    return (
        <form className="donjon-maker-bloc" onSubmit={(event) => handleSubmit(event)}>
            <div className="form-group">
                <label htmlFor="recette-nom">Nom</label>
                <input id="recette-nom" type="text" value={recette.nom} onChange={champ("nom")} required/>
            </div>

            <div className="form-group">
                <label htmlFor="recette-description">Description</label>
                <textarea id="recette-description" value={recette.description || ""} onChange={champ("description")}/>
            </div>

            <div className="donjon-maker-ligne">
                <div className="form-group">
                    <label htmlFor="recette-metier">Métier</label>
                    <select id="recette-metier" value={recette.metierId ?? ""}
                            onChange={(event) => setRecette(precedent => ({
                                ...precedent, metierId: event.target.value ? Number(event.target.value) : null
                            }))} required>
                        <option value="">— Choisir —</option>
                        {referentiels.metiers
                            .filter(metier => metier.famille === "craft")
                            .map(metier => <option key={metier.id} value={metier.id}>{metier.nom}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="recette-niveau">Niveau requis</label>
                    <input id="recette-niveau" type="number" min="1"
                           value={recette.niveauRequis} onChange={champ("niveauRequis")}/>
                </div>

                <div className="form-group">
                    <label htmlFor="recette-difficulte">Difficulté (1-5)</label>
                    <input id="recette-difficulte" type="number" min="1" max="5"
                           value={recette.difficulte} onChange={champ("difficulte")}/>
                </div>

                <div className="form-group">
                    <label htmlFor="recette-temps">Temps (secondes)</label>
                    <input id="recette-temps" type="number" min="1"
                           value={recette.tempsSecondes} onChange={champ("tempsSecondes")}/>
                    <small>×{modeLePlusLong} au plus lent des modes</small>
                </div>

                <div className="form-group">
                    <label htmlFor="recette-xp">XP de métier</label>
                    <input id="recette-xp" type="number" min="0"
                           value={recette.experienceMetier} onChange={champ("experienceMetier")}/>
                    {suggeree > 0 && (
                        <small>
                            Suggestion : {suggeree}{" "}
                            <button type="button"
                                    onClick={() => setRecette(p => ({...p, experienceMetier: suggeree}))}>
                                appliquer
                            </button>
                        </small>
                    )}
                </div>

                <div className="form-group">
                    <label>
                        <input type="checkbox" checked={recette.actif} onChange={champ("actif")}/> Active
                    </label>
                    <small>Désactiver plutôt que supprimer si des joueurs l'ont lancée</small>
                </div>
            </div>

            <fieldset className="donjon-maker-bloc">
                <legend>Ce que la recette produit</legend>
                <div className="donjon-maker-ligne">
                    <SelecteurItem valeur={produit} referentiels={referentiels}
                                   onChange={(patch) => setProduit(precedent => ({...precedent, ...patch}))}/>
                    <div className="form-group">
                        <label htmlFor="produit-quantite">Quantité</label>
                        <input id="produit-quantite" type="number" min="1"
                               value={produit.quantity ?? 1}
                               onChange={(event) => setProduit(precedent => ({
                                   ...precedent, quantity: Number(event.target.value) || 1
                               }))}/>
                    </div>
                </div>
            </fieldset>

            <fieldset className="donjon-maker-bloc">
                <legend>Ingrédients</legend>
                <p className="donjon-maker-aide">
                    Le recyclage est arrondi à l'inférieur : avec {config.modesCraft?.[0]?.recycle ?? 30} %,
                    il faut au moins 4 exemplaires d'un ingrédient pour qu'un seul revienne.
                    Des quantités trop petites rendent la fabrication soignée sans intérêt.
                </p>
                {ingredients.map((ingredient, index) => (
                    <div key={ingredient.id || `nouveau-${index}`} className="donjon-maker-ligne">
                        <SelecteurItem valeur={ingredient} referentiels={referentiels}
                                       onChange={(patch) => majIngredient(index, patch)}/>
                        <div className="form-group">
                            <label>Quantité</label>
                            <input type="number" min="1" value={ingredient.quantite}
                                   onChange={(event) => majIngredient(index, {quantite: Number(event.target.value) || 1})}/>
                        </div>
                        <button type="button"
                                onClick={() => setIngredients(precedent => precedent.filter((_, i) => i !== index))}>
                            Retirer
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => setIngredients(precedent => [...precedent, {...INGREDIENT_VIDE}])}>
                    Ajouter un ingrédient
                </button>
            </fieldset>

            <button type="submit" disabled={enregistrement}>
                {recette.id ? "Enregistrer les modifications" : "Créer la recette"}
            </button>
        </form>
    );
};

export default RecetteForm;
