import React from 'react'
import '../../../../styles/app.css'
import Field from "../../../../components/forms/field/Field";
import Select from "../../../../components/forms/select/Select";
import {connect} from "react-redux";
import {
    updateQuestMakerSequenceRecompense
} from "../../../../store/actions";


export default function RecompenseForm({consommables, equipements, objets, sequenceIndex, register}){
    
    return (
        <div className="action-container">
            <h6>Recompense pour cette séquence</h6>
            <input name="argent" {...register(`sequences[${sequenceIndex}].recompense.money`)}/>
            <input name="experience" {...register(`sequences[${sequenceIndex}].recompense.experience`)}/>
            <input name="quantity" {...register(`sequences[${sequenceIndex}].recompense.quantity`)}/>

            <select name="objet" {...register(`sequences[${sequenceIndex}].recompense.objet`)}>
                <option value={0}>selectionner un objet</option>
                {objets && objets.length > 0 && objets.map((objet, index) => {
                    return <option key={index} value={objet.id}>{objet.name}</option>
                })}
            </select>

            <select name="equipement" {...register(`sequences[${sequenceIndex}].recompense.equipement`)}>
                <option value={0}>selectionner un équipement</option>
                {equipements && equipements.length > 0 && equipements.map((equipement, index) => {
                    return <option key={index} value={equipement.id}>{equipement.name}</option>
                })}
            </select>

            <select name="consommable" {...register(`sequences[${sequenceIndex}].recompense.consommable`)}>
                <option value={0}>selectionner une potion</option>
                {consommables && consommables.length > 0 && consommables.map((consommable, index) => {
                    return <option key={index} value={consommable.id}>{consommable.name}</option>
                })}
            </select>
        </div>
    )
    
}