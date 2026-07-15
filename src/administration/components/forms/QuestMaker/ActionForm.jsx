import React from 'react'
import '../../../../styles/app.css'
import {useQuestEditor} from "../../../contexts/QuestEditorContext";

/**
 * Une action d'une séquence. Le rendu est 100 % piloté par la config du
 * type (/quest/editor/config) : chaque champ déclare son nom, son type
 * (select / number / json) et son catalogue. Plus aucun fetch local ni
 * construction de nom de champ par concaténation.
 */
export default function ActionForm({action, register, sequenceIndex, actionIndex, removeAction}) {

    const {actionTypeConfig, referentiels} = useQuestEditor();
    const config = actionTypeConfig[action.type];
    const basePath = `sequences.${sequenceIndex}.actions.${actionIndex}`;

    if(!config){
        return (
            <div className="action-container">
                Type d'action inconnu : {action.type}
                <button type="button" onClick={() => removeAction(actionIndex)}>Supprimer</button>
            </div>
        );
    }

    const renderField = (field) => {
        switch (field.type){
            case "select":
                return (
                    <select className="select-form-field" {...register(`${basePath}.${field.name}`, field.catalog ? {valueAsNumber: true} : {})}>
                        <option value={field.catalog ? 0 : ""}>— {field.label} —</option>
                        {field.catalog && referentiels[field.catalog].map(item =>
                            <option key={item.id} value={item.id}>{item.name}</option>
                        )}
                        {field.options && field.options.map(option =>
                            <option key={option.value} value={option.value}>{option.label}</option>
                        )}
                    </select>
                );
            case "json":
                return <textarea className="textarea-form-field" placeholder='{"clé": "valeur"}' {...register(`${basePath}.${field.name}`)}/>;
            case "number":
            default:
                return <input className="input-form-field" type={field.type} {...register(`${basePath}.${field.name}`, field.type === "number" ? {valueAsNumber: true} : {})}/>;
        }
    };

    return (
        <div className="action-container">
            <button type="button" onClick={() => removeAction(actionIndex)}>Supprimer</button>
            <h6>{config.label}</h6>
            <input type="hidden" {...register(`${basePath}.id`, {valueAsNumber: true})}/>
            <input type="hidden" {...register(`${basePath}.type`)}/>

            <div className="field-group">
                <label>Libellé du bouton</label>
                <input className="input-form-field" type="text" {...register(`${basePath}.label`)}/>
            </div>

            {config.fields.map(field =>
                <div className="field-group" key={field.name}>
                    <label>{field.label}</label>
                    {renderField(field)}
                </div>
            )}

            {config.isCondition && (
                <div className="field-group">
                    <label>Message si la condition n'est pas remplie</label>
                    <input className="input-form-field" type="text" {...register(`${basePath}.message`)}/>
                </div>
            )}
        </div>
    )
}
