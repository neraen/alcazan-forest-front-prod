import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import Field from "../../../components/forms/field/Field";
import pnjApi from "../../../services/pnjApi";
import ImageUploadField from "./imageUpload/ImageUploadField";

const EMPTY = {id: 0, name: "", avatar: "", skin: "", description: "", type: "action"};
// Le type pilote la vue rendue par PnjInteractionHost (cf. PnjInteractionService).
// « metier » = maître de métier : les métiers qu'il enseigne se rattachent dans
// l'ArtisanatMaker, pas ici.
const PNJ_TYPES = ["action", "quest", "shop", "guilde", "metier"];

/**
 * Formulaire de création / édition d'un PNJ. Le PNJ courant est fourni par le
 * parent (catalogue) ; à la sauvegarde, onSaved() rafraîchit la liste.
 */
const CreatePnjForm = ({pnj, onSaved}) => {

    const [form, setForm] = useState({...EMPTY, ...pnj});

    useEffect(() => {
        setForm({...EMPTY, ...pnj});
    }, [pnj]);

    const isEdit = Number(form.id) > 0;

    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setForm(previous => ({...previous, [name]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await pnjApi.create(form);
            toast.success(isEdit ? "PNJ modifié." : "PNJ créé.");
            onSaved && onSaved();
        } catch (error) {
            toast.error(error.response?.data?.error || "Échec de l'enregistrement.");
        }
    };

    return (
        <form className="create-pnj-form" onSubmit={handleSubmit}>
            <h3>{isEdit ? `Éditer « ${form.name || "PNJ"} »` : "Nouveau PNJ"}</h3>
            <Field name="name" label="Nom" value={form.name} onChange={handleChange}/>
            {/* Portrait (dialogues) et sprite (carte) partagent le dossier img/pnj mais pas la
                convention : l'avatar stocke l'extension, le skin non — d'où deux collections. */}
            <ImageUploadField id="pnj-avatar" collection="pnj_avatar" label="Portrait (dialogues)"
                              nom={form.name} valeur={form.avatar}
                              onChange={(fichier) => setForm(previous => ({...previous, avatar: fichier}))}/>
            <ImageUploadField id="pnj-skin" collection="pnj_skin" label="Sprite (carte)"
                              nom={form.name} valeur={form.skin}
                              onChange={(fichier) => setForm(previous => ({...previous, skin: fichier}))}/>
            <div className="form-group">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={form.type} onChange={handleChange}>
                    {PNJ_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <Field type="textarea" name="description" label="Description" value={form.description} onChange={handleChange}/>
            <button type="submit">{isEdit ? "Enregistrer les modifications" : "Créer le PNJ"}</button>
        </form>
    );
};

export default CreatePnjForm;
