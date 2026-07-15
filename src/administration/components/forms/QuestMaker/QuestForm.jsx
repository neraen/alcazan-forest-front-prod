import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import {useFieldArray, useForm} from "react-hook-form";
import {toast} from "react-toastify";
import QuestMakerApi from "../../../services/QuestMakerApi";
import {useQuestEditor} from "../../../contexts/QuestEditorContext";
import SequenceForm from "./SequenceForm";

const emptyQuest = {
    id: 0,
    name: "",
    minimalLevel: 0,
    alignementId: 0,
    objetId: 0,
    prerequisiteQueteId: 0,
    sequences: []
};

const emptySequence = {
    id: 0,
    nomSequence: "",
    dialogueTitre: "",
    dialogueContenu: "",
    pnjId: 0,
    actions: [],
    recompense: {money: 0, experience: 0, quantity: 0, objetId: 0, equipementId: 0, consommableId: 0}
};

/**
 * Formulaire d'une quête complète (création si questId = 0). Le payload
 * soumis est exactement la valeur du formulaire : miroir de ce que renvoie
 * /quest/editor/get. La position des séquences est déduite de l'ordre de la
 * liste (et recalculée côté serveur), plus de champs position/isLast manuels.
 */
export default function QuestForm({questId, onSaved}){

    const {referentiels} = useQuestEditor();
    const [isLoading, setIsLoading] = useState(questId > 0);
    const {register, handleSubmit, control, reset} = useForm({defaultValues: emptyQuest});
    // keyName fieldId : ne pas écraser l'id (base de données) des séquences.
    const {fields, append, remove, move} = useFieldArray({control, name: "sequences", keyName: "fieldId"});

    useEffect(() => {
        if(questId > 0){
            QuestMakerApi.get(questId)
                .then(quest => {
                    reset(quest);
                    setIsLoading(false);
                })
                .catch(() => toast.error("Impossible de charger la quête."));
        }
    }, [questId, reset]);

    const submit = async (quest) => {
        try {
            const saved = await QuestMakerApi.save(quest);
            // reset avec la réponse : les éléments créés récupèrent leurs ids définitifs.
            reset(saved);
            toast.success("Quête sauvegardée.");
            onSaved(saved);
        } catch (error) {
            toast.error(error.response?.data?.error || "La sauvegarde a échoué.");
        }
    };

    if(isLoading){
        return <div>Chargement de la quête…</div>;
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
            <input type="hidden" {...register("id", {valueAsNumber: true})}/>
            <div className="quest-info-form">
                <h2> Informations de la quête </h2>
                <div className="field-group gold-border">
                    <label> Nom de la quête </label>
                    <input {...register("name", {required: true})}/>
                </div>
                <div className="field-group gold-border">
                    <label> Niveau requis (0 = aucun) </label>
                    <input type="number" {...register("minimalLevel", {valueAsNumber: true})}/>
                </div>

                <div className="field-group gold-border">
                    <label> Alignement requis </label>
                    <select {...register("alignementId", {valueAsNumber: true})}>
                        <option value={0}>Aucun alignement requis</option>
                        {referentiels.alignements.map(alignement =>
                            <option key={alignement.id} value={alignement.id}>{alignement.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group gold-border">
                    <label> Objet requis </label>
                    <select {...register("objetId", {valueAsNumber: true})}>
                        <option value={0}>Aucun objet requis</option>
                        {referentiels.objets.map(objet =>
                            <option key={objet.id} value={objet.id}>{objet.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group gold-border">
                    <label> Quête à terminer d'abord </label>
                    <select {...register("prerequisiteQueteId", {valueAsNumber: true})}>
                        <option value={0}>Aucune quête prérequise</option>
                        {referentiels.quetes.filter(quete => quete.id !== questId).map(quete =>
                            <option key={quete.id} value={quete.id}>{quete.name}</option>
                        )}
                    </select>
                </div>

                <button className="form-btn" type="submit">Sauvegarder la quête</button>
            </div>

            <div className="quest-maker-central-part sequences">
                <div className="add-form-btn" onClick={() => append(emptySequence)}>Ajouter une séquence</div>
                {fields.map((sequence, index) =>
                    <SequenceForm
                        key={sequence.fieldId}
                        index={index}
                        total={fields.length}
                        control={control}
                        register={register}
                        removeSequence={remove}
                        moveSequence={move}
                    />
                )}
            </div>
        </form>
    );
}
