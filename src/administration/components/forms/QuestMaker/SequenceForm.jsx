import React, {useState} from 'react'
import {useFieldArray, useWatch} from "react-hook-form";
import {useQuestEditor} from "../../../contexts/QuestEditorContext";
import ActionForm from "./ActionForm";

/**
 * Une séquence de la quête : dialogue + actions (chaque action porte son
 * branchement et sa récompense). L'ordre des séquences EST leur position
 * (boutons monter/descendre) — plus de champs position / isLast à la main.
 */
export default function SequenceForm({index, total, register, control, removeSequence, moveSequence}){

    const {actionTypeConfig, referentiels} = useQuestEditor();
    const typeNames = Object.keys(actionTypeConfig);
    const [newActionType, setNewActionType] = useState(typeNames[0]);

    const {fields, append, remove} = useFieldArray({control, name: `sequences.${index}.actions`, keyName: "fieldId"});

    // Cibles de branchement : toutes les séquences de la quête (clé = clientKey),
    // observées en direct pour refléter noms et réordonnancements.
    const allSequences = useWatch({control, name: "sequences"}) || [];
    const sequenceOptions = allSequences
        .filter(sequence => sequence && sequence.clientKey)
        .map((sequence, i) => ({
            key: sequence.clientKey,
            label: `Séquence ${i + 1}${sequence.nomSequence ? ` — ${sequence.nomSequence}` : ""}`,
        }));

    const handleAddAction = () => {
        append({
            id: 0,
            type: newActionType,
            label: "",
            message: "",
            quantity: 0,
            objetId: 0,
            equipementId: 0,
            consommableId: 0,
            bossId: 0,
            monstreId: 0,
            recetteId: 0,
            pnjId: 0,
            carteId: 0,
            karma: 0,
            effect: "",
            effectParams: "",
            nextSequenceKey: "",
            recompense: {money: 0, experience: 0, quantity: 0, objetId: 0, equipementId: 0, consommableId: 0}
        });
    };

    return (
        <div className="sequence-container">
            <h2>Séquence {index + 1}</h2>
            <div className="sequence-toolbar">
                <button type="button" disabled={index === 0} onClick={() => moveSequence(index, index - 1)}>▲ Monter</button>
                <button type="button" disabled={index === total - 1} onClick={() => moveSequence(index, index + 1)}>▼ Descendre</button>
                <button type="button" onClick={() => removeSequence(index)}>Supprimer la séquence</button>
            </div>
            <input type="hidden" {...register(`sequences.${index}.id`, {valueAsNumber: true})}/>
            <input type="hidden" {...register(`sequences.${index}.clientKey`)}/>

            <div className="sequence-form-container">
                <div className="sequence-info-form">
                    <div className="sequence-form-left">
                        <div className="field-group">
                            <label htmlFor={`sequences.${index}.nomSequence`}> Nom de la séquence </label>
                            <input className="input-form-field" type="text" {...register(`sequences.${index}.nomSequence`)}/>
                        </div>
                        <div className="field-group">
                            <label htmlFor={`sequences.${index}.pnjId`}> PNJ de la séquence </label>
                            <select className="select-form-field" {...register(`sequences.${index}.pnjId`, {valueAsNumber: true})}>
                                <option value={0}>— Choisir un PNJ —</option>
                                {referentiels.pnjs.map(pnj =>
                                    <option key={pnj.id} value={pnj.id}>{pnj.name}</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sequence-dialogue-container">
                <div className="field-group">
                    <label htmlFor={`sequences.${index}.dialogueTitre`}> Titre du dialogue </label>
                    <input className="input-form-field" {...register(`sequences.${index}.dialogueTitre`)}/>
                </div>
                <div className="field-group">
                    <label htmlFor={`sequences.${index}.dialogueContenu`}> Contenu du dialogue (un paragraphe par ligne) </label>
                    <textarea className="textarea-form-field" {...register(`sequences.${index}.dialogueContenu`)}/>
                </div>
            </div>

            <hr className="quest-form-separator"/>

            <div className="quest-maker-actions-container">
                <div className="quest-maker-actions-form">
                    <div className="add-form-btn" onClick={handleAddAction}>Ajouter une action</div>
                    <select className="select-form-field" value={newActionType} onChange={(event) => setNewActionType(event.target.value)}>
                        {typeNames.map(typeName =>
                            <option key={typeName} value={typeName}>{actionTypeConfig[typeName].label}</option>
                        )}
                    </select>
                </div>

                <div className="quest-maker-actions">
                    {fields.map((action, actionIndex) =>
                        <ActionForm
                            key={action.fieldId}
                            action={action}
                            sequenceIndex={index}
                            actionIndex={actionIndex}
                            register={register}
                            removeAction={remove}
                            sequenceOptions={sequenceOptions}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
