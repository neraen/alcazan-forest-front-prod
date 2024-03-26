import React, {useEffect, useState} from 'react'
import '../../../styles/app.css'
import sequenceApi from "../../../services/sequenceApi";
import actionTypeApi from "../../services/actionTypeApi";
import ActionFormHooked from "./ActionFormHooked";
import EquipementApi from "../../../services/EquipementApi";
import consommableApi from "../../../services/consommableApi";
import objectApi from "../../../services/objectApi";
import RecompenseForm from "./RecompenseForm";
import {useFieldArray, useFormContext} from "react-hook-form";
import MapMakerApi from "../../services/MapMakerApi";

export default function SequenceFormHooked({index, removeSequence, register, control}){

    const [currentActionType, setCurrentActionType] = useState(1);
    const [currentActionTypeName, setCurrentActionTypeName] = useState("");
    const [sequences, setSequences] = useState([]);
    const [actionTypes, setActionTypes] = useState([]);
    const [actions, setActions] = useState([]);
    const [pnjs, setPnjs] = useState([]);
    const [equipements, setEquipements] = useState([]);
    const [consommables, setConsommables] = useState([]);
    const [objets, setObjets] = useState([]);
    
    useEffect(() => {
        fetchSequences();
        fetchActionTypes();
        fetchselectElements();
    }, []);

    const { fields, append, remove } = useFieldArray({ control, name: `sequences[${index}].actions` });

   // const { control, register } = useFormContext();
   // const { register } = useFormContext();

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
        console.log(sequences);
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
            <button type="button" onClick={onRemove}>
                Supprimer
            </button>
            <div className="sequence-form-container">
                
                <div className="sequence-form-left">
                    <input type="text" {...register( `sequences[${index}].nomSequence`)}/>
                    <input type="checkbox" {...register( `sequences[${index}].isLast`)} />
                    <input type="number" {...register( `sequences[${index}].position`)}/>
                </div>

                <div className="sequence-form-right">
                    <select {...register( `sequences[${index}].lastSequence`)} >
                        <option value="0">Aucune séquence précédante</option>
                        {sequences.length > 0 && sequences.map(sequence => <option key={sequence.id} value={sequence.id}>{sequence.name}</option>)}
                    </select>

                    <select {...register( `sequences[${index}].nextSequence`)}>
                        <option value="0">Aucune séquence suivante</option>
                        {sequences.length > 0 && sequences.map(sequence => <option key={sequence.id} value={sequence.id}>{sequence.name}</option>)}
                    </select>

                    <select {...register( `sequences[${index}].pnj`)} >
                        <option value="0">Aucun pnj</option>
                        {pnjs.length > 0 && pnjs.map(pnj => <option key={pnj.id} value={pnj.id}>{pnj.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="sequence-actions-container">
                <input {...register( `sequences[${index}].dialogueTitre`)}/>
                <textarea  {...register( `sequences[${index}].dialogueContent`)}/>
            </div>
            
            <div className="quest-maker-actions-container">
                <div className="quest-maker-actions-form">
                    <div className="map-maker-btn-validation" onClick={() => handleAddAction()}>Ajouter une action</div>
                    <select value={currentActionType} onChange={(event) => handleActionTypeChange(event)}>
                        {actionTypes.length > 0 && actionTypes.map(actionType => <option key={actionType.id} value={actionType.id}>{actionType.name}</option>)}
                    </select>
                </div>

                <div className="quest-maker-actions">
                    {fields.map((action, actionIndex) => {
                        return <ActionFormHooked key={index} action={action} sequenceIndex={index} actionIndex={actionIndex} register={register}/>
                    })}
                </div>

                recompense
                <div className="quest-maker-actions">
                    <RecompenseForm recompense={recompense} sequenceIndex={index}
                                    objets={objets}
                                    equipements={equipements}
                                    consommables={consommables}/>
                </div>

            </div>
        </div>
    )
}

