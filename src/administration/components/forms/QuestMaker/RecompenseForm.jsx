import React from 'react'
import '../../../../styles/app.css'
import {useQuestEditor} from "../../../contexts/QuestEditorContext";

/**
 * Récompense d'une séquence (une seule par séquence). Tout à 0 = pas de
 * récompense (le back supprime la ligne).
 */
export default function RecompenseForm({sequenceIndex, register}){

    const {referentiels} = useQuestEditor();
    const basePath = `sequences.${sequenceIndex}.recompense`;

    return (
        <div className="recompense-section">
            <h3 className="d-flex justify-content-center">Récompense pour cette séquence</h3>
            <div className="recompense-form-container">
                <div className="field-group">
                    <label> Argent </label>
                    <input className="input-form-field" type="number" {...register(`${basePath}.money`, {valueAsNumber: true})}/>
                </div>
                <div className="field-group">
                    <label> Expérience </label>
                    <input className="input-form-field" type="number" {...register(`${basePath}.experience`, {valueAsNumber: true})}/>
                </div>

                <div className="field-group">
                    <label> Quantité </label>
                    <input className="input-form-field" type="number" {...register(`${basePath}.quantity`, {valueAsNumber: true})}/>
                </div>

                <div className="field-group">
                    <label> Objet </label>
                    <select className="select-form-field" {...register(`${basePath}.objetId`, {valueAsNumber: true})}>
                        <option value={0}>Aucun objet</option>
                        {referentiels.objets.map(objet =>
                            <option key={objet.id} value={objet.id}>{objet.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group">
                    <label> Équipement </label>
                    <select className="select-form-field" {...register(`${basePath}.equipementId`, {valueAsNumber: true})}>
                        <option value={0}>Aucun équipement</option>
                        {referentiels.equipements.map(equipement =>
                            <option key={equipement.id} value={equipement.id}>{equipement.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group">
                    <label> Consommable </label>
                    <select className="select-form-field" {...register(`${basePath}.consommableId`, {valueAsNumber: true})}>
                        <option value={0}>Aucun consommable</option>
                        {referentiels.consommables.map(consommable =>
                            <option key={consommable.id} value={consommable.id}>{consommable.name}</option>
                        )}
                    </select>
                </div>
            </div>
        </div>
    )
}
