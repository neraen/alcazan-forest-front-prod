import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ArtisanatMakerApi from "../../../services/ArtisanatMakerApi";
import ImageUploadField from "../imageUpload/ImageUploadField";

const VIDE = {
    id: 0, nom: "", description: "", icone: "", famille: "recolte", niveauMax: 200, maitres: []
};

/**
 * Fiche d'un métier : identité, famille, plafond de progression, et les PNJ maîtres qui
 * l'enseignent.
 *
 * La liste des maîtres est RESYNCHRONISÉE côté serveur (retraits compris) : décocher un
 * PNJ le détache réellement, ce n'est pas un simple ajout.
 *
 * Aucune règle ici : familles et plafonds viennent de `/config`, le serveur revalide tout.
 */
const MetierForm = ({metierId, referentiels, config, onSaved}) => {

    const [metier, setMetier] = useState(VIDE);
    const [enregistrement, setEnregistrement] = useState(false);

    useEffect(() => {
        if(!metierId){
            setMetier(VIDE);
            return;
        }
        ArtisanatMakerApi.getMetier(metierId)
            .then(donnees => setMetier({...VIDE, ...donnees}))
            .catch(() => toast.error("Impossible de charger ce métier."));
    }, [metierId]);

    const champ = (nom) => (event) => {
        const {type, value} = event.target;
        const valeur = type === "number" ? (value === "" ? 0 : Number(value)) : value;
        setMetier(precedent => ({...precedent, [nom]: valeur}));
    };

    const basculerMaitre = (pnjId) => setMetier(precedent => ({
        ...precedent,
        maitres: precedent.maitres.includes(pnjId)
            ? precedent.maitres.filter(id => id !== pnjId)
            : [...precedent.maitres, pnjId]
    }));

    // ⚠️ L'event DOIT être passé et preventDefault() appelé : sans ça, une touche Entrée
    // déclenche le GET natif du <form> et la sauvegarde ne part jamais (doc §15.1).
    const handleSubmit = async (event) => {
        event.preventDefault();
        setEnregistrement(true);
        try {
            const sauvegarde = await ArtisanatMakerApi.saveMetier(metier);
            setMetier({...VIDE, ...sauvegarde});
            toast.success("Métier enregistré.");
            onSaved(sauvegarde);
        } catch (error) {
            toast.error(error.response?.data?.error || "L'enregistrement a échoué.");
        } finally {
            setEnregistrement(false);
        }
    };

    const plafond = config.plafonds?.[metier.famille];

    return (
        <form className="donjon-maker-bloc" onSubmit={(event) => handleSubmit(event)}>
            <div className="form-group">
                <label htmlFor="metier-nom">Nom</label>
                <input id="metier-nom" type="text" value={metier.nom} onChange={champ("nom")} required/>
            </div>

            <div className="form-group">
                <label htmlFor="metier-description">Description</label>
                <textarea id="metier-description" value={metier.description || ""} onChange={champ("description")}/>
            </div>

            <div className="donjon-maker-ligne">
                <div className="form-group">
                    <label htmlFor="metier-famille">Famille</label>
                    <select id="metier-famille" value={metier.famille} onChange={champ("famille")}>
                        {config.familles.map(famille => (
                            <option key={famille.value} value={famille.value}>{famille.label}</option>
                        ))}
                    </select>
                    {plafond !== undefined && (
                        <small>Un joueur ne peut exercer que {plafond} métier(s) de cette famille</small>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="metier-niveau-max">Niveau maximum</label>
                    <input id="metier-niveau-max" type="number" min="1"
                           value={metier.niveauMax} onChange={champ("niveauMax")}/>
                </div>

                <ImageUploadField id="metier-icone" collection="metier" label="Icône"
                                  nom={metier.nom} valeur={metier.icone}
                                  onChange={(fichier) => setMetier(precedent => ({...precedent, icone: fichier}))}/>
            </div>

            <fieldset className="donjon-maker-bloc">
                <legend>Maîtres qui l'enseignent</legend>
                {referentiels.pnjs.length === 0
                    ? <p className="donjon-maker-aide">
                        Aucun PNJ de type « metier ». Créez-en un dans l'onglet Pnj, puis revenez ici.
                    </p>
                    : referentiels.pnjs.map(pnj => (
                        <label key={pnj.id} className="form-group">
                            <input type="checkbox"
                                   checked={metier.maitres.includes(pnj.id)}
                                   onChange={() => basculerMaitre(pnj.id)}/> {pnj.nom}
                        </label>
                    ))}
            </fieldset>

            <button type="submit" disabled={enregistrement}>
                {metier.id ? "Enregistrer les modifications" : "Créer le métier"}
            </button>
        </form>
    );
};

export default MetierForm;
