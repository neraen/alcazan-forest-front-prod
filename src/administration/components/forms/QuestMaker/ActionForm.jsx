import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import actionTypeApi from "../../../services/actionTypeApi";
import objectApi from "../../../../services/objectApi";
import EquipementApi from "../../../../services/EquipementApi";
import MapApi from "../../../../services/MapApi";
import consommableApi from "../../../../services/consommableApi";
import bossApi from "../../../../services/bossApi";
import mapMakerApi from "../../../services/MapMakerApi";
import monsterApi from "../../../../services/monsterApi";


export default function ActionForm({action, register, sequenceIndex, actionIndex}) {

    const [fields, setFields] =  useState([]);
    const [fieldContent, setFieldContent] =  useState([]);

    useEffect(() => {
        fetchAllFieldsAndValues();
    }, []);

    const fetchAllFieldsAndValues = async () => {
        const fields = await actionTypeApi.getAllFields(action.actionTypeId);
        setFields(fields);

        console.log(fields)
        console.log(action)

        switch (action.actionTypeName) {
            case "donnerObjet":
                const objets = await objectApi.getAllObjects();
                setFieldContent(objets);
                break;
            case "donnerEquipement":
                const equipements = await EquipementApi.getAllEquipements();
                setFieldContent(equipements);
                break;
            case "donnerConsommable":
                const consommables = await consommableApi.getAllConsommables();
                setFieldContent(consommables);
                break;
            case "battreBoss":
                const bosses = await bossApi.getAllBosses();
                setFieldContent(bosses)
                break;
            case "battreMonstre":
                const monstres = await monsterApi.getAllMonsters();
                setFieldContent(monstres)
                break;
            case "visiterCarte":
                const cartes = await MapApi.getAllMaps();
                setFieldContent(cartes)
                break;
            case "parlerPnj":
                const pnjs = await mapMakerApi.getPnjInfoForSelect();
                setFieldContent(pnjs)
                break;
            default:
                break;
        }

    }

    return (
        <div className="action-container">
            <h6>{action.actionName && action.actionName || "Nouveau" + " : " + action.actionTypeName}</h6>
            <input className="input-form-field" {...register(`sequences[${sequenceIndex}].actions[${actionIndex}].actionName`)}/>
            {fields && fields.length > 0 && fields.map((field, index) => {
                return (field.type === "select" && fieldContent && fieldContent.length > 0) && (
                    <div className="field-group">
                        <label htmlFor=""></label>
                         <select className="select-form-field" key={index} {...register(`sequences[${sequenceIndex}].actions[${actionIndex}].${field.name}`)} >
                            <option value={0}>selectionner {field.name}</option>
                            {fieldContent && fieldContent.length > 0 && fieldContent.map((content, index) => {
                                return <option key={content.name + actionIndex} value={content.id}>{content.name}</option>
                            })}
                        </select>
                    </div>
                ) || (
                    <div className="field-group">
                        <label>{field.name[0].toUpperCase() + field.name.substring(1)}</label>
                        <input  className="input-form-field" key={"input"+field.name+index} {...register(`sequences[${sequenceIndex}].actions[${actionIndex}].${"action"+field.name[0].toUpperCase() + field.name.substring(1)}`)} type={field.type}/>
                    </div>
                )
            })}
        </div>
    )

}