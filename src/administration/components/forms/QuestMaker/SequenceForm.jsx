import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import sequenceApi from "../../../../services/sequenceApi";
import actionTypeApi from "../../../services/actionTypeApi";
import EquipementApi from "../../../../services/EquipementApi";
import consommableApi from "../../../../services/consommableApi";
import objectApi from "../../../../services/objectApi";
import RecompenseForm from "./RecompenseForm";
import {useFieldArray} from "react-hook-form";
import MapMakerApi from "../../../services/MapMakerApi";
import ActionForm from "./ActionForm";

export default function SequenceForm({index, removeSequence, register, control}){

    const [currentActionType, setCurrentActionType] = useState(1);
    const [currentActionTypeName, setCurrentActionTypeName] = useState("");
    const [sequences, setSequences] = useState([]);
    const [actionTypes, setActionTypes] = useState([]);
    const [pnjs, setPnjs] = useState([]);
    const [equipements, setEquipements] = useState([]);
    const [consommables, setConsommables] = useState([]);
    const [objets, setObjets] = useState([]);
    
    useEffect(() => {
        fetchSequences();
        fetchActionTypes();
        fetchselectElements();

        console.log(pnjs)
    }, []);

    const { fields, append, remove } = useFieldArray({ control, name: `sequences[${index}].actions` });

    const fetchselectElements = async () =>{
        const equipements = await EquipementApi.getAllEquipements();
        setEquipements(equipements);

        const consommables = await consommableApi.getAllConsommables();
        setConsommables(consommables);

        const objets = await objectApi.getAllObjects();
        setObjets(objets);

        const pnjs = await MapMakerApi.getPnjInfoForSelect();
        setPnjs(pnjs);
    }

    const fetchSequences = async () =>{
        const sequences = await sequenceApi.getAllSequences();
        setSequences(sequences);
    }

    const fetchActionTypes = async () =>{
        const actionTypes = await actionTypeApi.getAllActionTypes();
        setActionTypes(actionTypes);
    }

    const handleActionTypeChange = ({currentTarget}) => {
        setCurrentActionType(currentTarget.value)
    }
    
    const handleAddAction = () =>{
        const action = {
            actionTypeId: currentActionType,
            actionTypeName: actionTypes.find(actionType => actionType.id == currentActionType).name,
            actionName: ""
        }

        append(action)
    }

    const onRemove = () => {
        removeSequence(index);
    };
    
    return (
        <div className="sequence-container">
            <h2></h2>
            <button type="button" onClick={onRemove}>
                Supprimer
            </button>
            <div className="sequence-form-container">

                <div className="sequence-info-form">
                    <div className="sequence-form-left">
                        <div className="field-group">
                            <label htmlFor={`sequences[${index}].nomSequence`}> Nom de la séquence </label>
                            <input className="input-form-field" type="text" {...register( `sequences[${index}].nomSequence`)}/>
                        </div>
                        <div className="field-group">
                            <label htmlFor={ `sequences[${index}].isLast`}>Est-ce la dernière séquence ? </label>
                            <input className="input-form-field" type="checkbox" {...register( `sequences[${index}].isLast`)} />
                        </div>
                        <div className="field-group">
                            <label htmlFor={`sequences[${index}].position`}> Position de la séquence </label>
                            <input className="input-form-field" type="number" {...register( `sequences[${index}].position`)}/>
                        </div>
                    </div>

                    <div className="sequence-form-right">
                        <div className="field-group">
                            <label htmlFor={`sequences[${index}].lastSequence`}> Sequence précédante </label>
                            <select className="select-form-field" {...register( `sequences[${index}].lastSequence`)} >
                                <option value={0}>Aucune séquence précédante</option>
                                {sequences.length > 0 && sequences.map(sequence => <option key={sequence.id} value={sequence.id}>{sequence.name}</option>)}
                            </select>
                        </div>

                        <div className="field-group">
                            <label htmlFor={`sequences[${index}].nextSequence`}> Sequence suivante </label>
                            <select className="select-form-field" {...register( `sequences[${index}].nextSequence`)}>
                                <option value="0">Aucune séquence suivante</option>
                                {sequences.length > 0 && sequences.map(sequence => <option key={"next"+sequence.id} value={""+sequence.id}>{sequence.name}</option>)}
                            </select>
                        </div>

                        <div className="field-group">
                            <label htmlFor={`sequences[${index}].pnj`}> Pnj de la séquence </label>
                            <select className="select-form-field" {...register( `sequences[${index}].pnj`)} >
                                <option value="0">Aucun pnj</option>
                                {pnjs.length > 0 && pnjs.map(pnj => <option key={"pnj"+pnj.id} value={""+pnj.id}>{pnj.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sequence-dialogue-container">
                <div className="field-group">
                    <label htmlFor={`sequences[${index}].dialogueTitre`}> Titre du dialogue </label>
                    <input className="input-form-field" {...register(`sequences[${index}].dialogueTitre`)}/>
                </div>
                <div className="field-group">
                    <label htmlFor={`sequences[${index}].dialogueTitre`}> Titre du dialogue </label>
                    <textarea className="textarea-form-field" {...register( `sequences[${index}].dialogueContent`)}/>
                </div>
            </div>

            <hr className="quest-form-separator"/>
            
            <div className="quest-maker-actions-container">
                <div className="quest-maker-actions-form">
                    <div className="add-form-btn" onClick={() => handleAddAction()}>Ajouter une action</div>
                    <select className="select-form-field" value={currentActionType} onChange={(event) => handleActionTypeChange(event)}>
                        {actionTypes && actionTypes.length > 0 && actionTypes.map(actionType => <option key={"actionType"+actionType.id} value={actionType.id}>{actionType.name}</option>)}
                    </select>
                </div>

                <div className="quest-maker-actions">
                    {fields.map((action, actionIndex) => {
                        return <ActionForm key={"action"+actionIndex+index} action={action} sequenceIndex={index} actionIndex={actionIndex} register={register}/>
                    })}
                </div>

                <hr className="quest-form-separator"/>
                <div className="quest-maker-actions">
                    <RecompenseForm sequenceIndex={index}
                                    register={register}
                                    objets={objets}
                                    equipements={equipements}
                                    consommables={consommables}/>
                </div>

            </div>
        </div>
    )
}

