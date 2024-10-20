import React from 'react'
import '../../../../styles/app.css'
import Field from "../../../../components/forms/field/Field";
import Select from "../../../../components/forms/select/Select";
import {connect} from "react-redux";
import {
    updateQuestMakerSequenceRecompense
} from "../../../../store/actions";
import {intersectionobserver} from "caniuse-lite/data/features";


export default function RecompenseForm({consommables, equipements, objets, sequenceIndex, register}){
    
    return (
        <div className="recompense-section">
            <h3 className="d-flex justify-content-center">Recompense pour cette séquence</h3>
            <div className="recompense-form-container">
                <div className="field-group">
                    <label htmlFor=""> Argent </label>
                    <input className="input-form-field" {...register(`sequences[${sequenceIndex}].recompense.money`)}/>
                </div>
                <div className="field-group">
                    <label htmlFor=""> Experience </label>
                    <input className="input-form-field" {...register(`sequences[${sequenceIndex}].recompense.experience`)}/>
                </div>

                <div className="field-group">
                    <label htmlFor=""> Quantité </label>
                    <input className="input-form-field" {...register(`sequences[${sequenceIndex}].recompense.quantity`)}/>
                </div>

                <div className="field-group">
                    <label htmlFor=""> Objets </label>
                    <select className="select-form-field" {...register(`sequences[${sequenceIndex}].recompense.objet`)}>
                        <option value={0}>selectionner un objet</option>
                        {objets && objets.length > 0 && objets.map((objet, index) => {
                            return <option key={index} value={objet.id}>{objet.name}</option>
                        })}
                    </select>
                </div>

                <div className="field-group">
                    <label htmlFor=""> Equipements </label>
                    <select className="select-form-field" {...register(`sequences[${sequenceIndex}].recompense.equipement`)}>
                        <option value={0}>selectionner un équipement</option>
                        {equipements && equipements.length > 0 && equipements.map((equipement, index) => {
                            return <option key={index} value={equipement.id}>{equipement.name}</option>
                        })}
                    </select>
                </div>

                <div className="field-group">
                    <label htmlFor=""> Consommables </label>
                    <select className="select-form-field" {...register(`sequences[${sequenceIndex}].recompense.consommable`)}>
                        <option value={0}>selectionner une potion</option>
                        {consommables && consommables.length > 0 && consommables.map((consommable, index) => {
                            return <option key={index} value={consommable.id}>{consommable.name}</option>
                        })}
                    </select>
                </div>
            </div>
        </div>
    )
    
}