import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ArtisanatMakerApi from "../../../services/ArtisanatMakerApi";
import ImageUploadField from "../imageUpload/ImageUploadField";

const VIDE = {
    id: 0, nom: "", description: "", image: "", prixVente: 0, metierId: null, niveauRessource: 0
};

/**
 * Fiche d'un objet, avec son éventuel rattachement à un métier.
 *
 * **Il n'existe pas d'entité « Ressource »** : une ressource est un objet portant un métier
 * et un niveau. C'est aussi le premier éditeur d'`Objet` du projet — jusqu'ici la création
 * d'objets passait par du SQL.
 *
 * Laisser « Aucun » dans Métier retire à l'objet son statut de ressource sans le supprimer :
 * c'est le seul moyen de défaire un rattachement.
 */
const RessourceForm = ({ressource, referentiels, onSaved}) => {

    const [objet, setObjet] = useState(VIDE);
    const [enregistrement, setEnregistrement] = useState(false);

    useEffect(() => {
        setObjet(ressource ? {...VIDE, ...ressource} : VIDE);
    }, [ressource]);

    const champ = (nom) => (event) => {
        const {type, value} = event.target;
        const valeur = type === "number" ? (value === "" ? 0 : Number(value)) : value;
        setObjet(precedent => ({...precedent, [nom]: valeur}));
    };

    // ⚠️ preventDefault() obligatoire, sinon une touche Entrée recharge la page et la
    // sauvegarde ne part jamais (doc §15.1).
    const handleSubmit = async (event) => {
        event.preventDefault();
        setEnregistrement(true);
        try {
            await ArtisanatMakerApi.saveRessource(objet);
            toast.success("Objet enregistré.");
            onSaved();
        } catch (error) {
            toast.error(error.response?.data?.error || "L'enregistrement a échoué.");
        } finally {
            setEnregistrement(false);
        }
    };

    return (
        <form className="donjon-maker-bloc" onSubmit={(event) => handleSubmit(event)}>
            <div className="form-group">
                <label htmlFor="ressource-nom">Nom</label>
                <input id="ressource-nom" type="text" value={objet.nom} onChange={champ("nom")} required/>
            </div>

            <div className="form-group">
                <label htmlFor="ressource-description">Description</label>
                <textarea id="ressource-description" value={objet.description || ""} onChange={champ("description")}/>
            </div>

            <div className="donjon-maker-ligne">
                <div className="form-group">
                    <label htmlFor="ressource-metier">Métier</label>
                    <select id="ressource-metier" value={objet.metierId ?? ""}
                            onChange={(event) => setObjet(precedent => ({
                                ...precedent, metierId: event.target.value ? Number(event.target.value) : null
                            }))}>
                        <option value="">Aucun (objet ordinaire)</option>
                        {referentiels.metiers.map(metier => (
                            <option key={metier.id} value={metier.id}>{metier.nom}</option>
                        ))}
                    </select>
                    <small>Un objet sans métier n'est pas une ressource</small>
                </div>

                <div className="form-group">
                    <label htmlFor="ressource-niveau">Niveau de ressource</label>
                    <input id="ressource-niveau" type="number" min="0"
                           value={objet.niveauRessource} onChange={champ("niveauRessource")}
                           disabled={!objet.metierId}/>
                </div>

                <div className="form-group">
                    <label htmlFor="ressource-prix">Prix de revente</label>
                    <input id="ressource-prix" type="number" min="0"
                           value={objet.prixVente ?? 0} onChange={champ("prixVente")}/>
                </div>

                <ImageUploadField id="ressource-image" collection="objet" label="Image"
                                  nom={objet.nom} valeur={objet.image}
                                  onChange={(fichier) => setObjet(precedent => ({...precedent, image: fichier}))}/>
            </div>

            <button type="submit" disabled={enregistrement}>
                {objet.id ? "Enregistrer les modifications" : "Créer l'objet"}
            </button>
        </form>
    );
};

export default RessourceForm;
