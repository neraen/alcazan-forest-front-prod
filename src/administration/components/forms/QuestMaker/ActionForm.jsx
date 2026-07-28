import React from 'react'
import {useQuestEditor} from "../../../contexts/QuestEditorContext";
import RecompenseForm from "./RecompenseForm";

/**
 * Une action d'une séquence. Le rendu des champs métier est piloté par la
 * config du type (/quest/editor/config). En plus : le branchement (« suite de
 * ce choix » → séquence cible / fin de quête / linéaire par défaut), le karma
 * engagé par ce choix et la récompense propre à cette action (= à cette branche).
 *
 * Le karma est rendu EN DUR, comme le libellé et le branchement, et non via la
 * config du type : il ne dépend d'aucun type d'action — n'importe quel bouton
 * peut peser sur la réputation du joueur, c'est même sur un CHOIX narratif qu'il
 * a le plus de sens.
 *
 * sequenceOptions : [{key, label}] des séquences de la quête (clé = clientKey),
 * pour alimenter le sélecteur de branchement.
 */
export default function ActionForm({action, register, sequenceIndex, actionIndex, removeAction, sequenceOptions}) {

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
                        {field.catalog && (referentiels[field.catalog] || []).map(item =>
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

            {/* Valeur SIGNÉE : négatif = ce choix coûte en réputation. Le serveur
                borne le karma, le formulaire n'a donc rien à plafonner ici. */}
            <div className="field-group">
                <label>Karma engagé par ce choix (négatif = réputation perdue)</label>
                <input className="input-form-field" type="number"
                       {...register(`${basePath}.karma`, {valueAsNumber: true})}/>
            </div>

            <div className="field-group">
                <label>Suite de ce choix</label>
                <select className="select-form-field" {...register(`${basePath}.nextSequenceKey`)}>
                    <option value="">Séquence suivante (défaut)</option>
                    <option value="__END__">Terminer la quête</option>
                    {sequenceOptions.map(option =>
                        <option key={option.key} value={option.key}>→ {option.label}</option>
                    )}
                </select>
            </div>

            <RecompenseForm basePath={`${basePath}.recompense`} register={register}/>
        </div>
    )
}
