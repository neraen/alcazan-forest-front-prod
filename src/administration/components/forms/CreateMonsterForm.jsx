import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import Field from "../../../components/forms/field/Field";
import monsterApi from "../../../services/monsterApi";
import ImageUploadField from "./imageUpload/ImageUploadField";

const EMPTY = {id: 0, name: "", maxLife: 0, skin: "", tempsRepop: 0, puissance: 0};

/** Normalise un monstre venu de la liste (temps_repop) vers l'état du form (tempsRepop). */
const normalize = (monster) => ({
    id: monster.id ?? 0,
    name: monster.name ?? "",
    maxLife: monster.maxLife ?? 0,
    skin: monster.skin ?? "",
    tempsRepop: monster.tempsRepop ?? monster.temps_repop ?? 0,
    puissance: monster.puissance ?? 0,
});

/**
 * Formulaire de création / édition d'un monstre. Le monstre courant est fourni
 * par le parent (catalogue) ; onSaved() rafraîchit la liste après sauvegarde.
 */
const CreateMonsterForm = ({monster, onSaved}) => {

    const [form, setForm] = useState(normalize(monster || EMPTY));

    useEffect(() => {
        setForm(normalize(monster || EMPTY));
    }, [monster]);

    const isEdit = Number(form.id) > 0;

    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setForm(previous => ({...previous, [name]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await monsterApi.create(form);
            toast.success(isEdit ? "Monstre modifié." : "Monstre créé.");
            onSaved && onSaved();
        } catch (error) {
            toast.error(error.response?.data?.error || "Échec de l'enregistrement.");
        }
    };

    return (
        <form className="create-pnj-form" onSubmit={handleSubmit}>
            <h3>{isEdit ? `Éditer « ${form.name || "monstre"} »` : "Nouveau monstre"}</h3>
            <Field name="name" label="Nom" value={form.name} onChange={handleChange}/>
            <ImageUploadField id="monstre-skin" collection="monstre" label="Sprite"
                              nom={form.name} valeur={form.skin}
                              onChange={(fichier) => setForm(previous => ({...previous, skin: fichier}))}/>
            <Field name="maxLife" type="number" label="Vie max" value={form.maxLife} onChange={handleChange}/>
            <Field name="puissance" type="number" label="Puissance" value={form.puissance} onChange={handleChange}/>
            <Field name="tempsRepop" type="number" label="Temps de repop (s)" value={form.tempsRepop} onChange={handleChange}/>
            <button type="submit">{isEdit ? "Enregistrer les modifications" : "Créer le monstre"}</button>
        </form>
    );
};

export default CreateMonsterForm;
