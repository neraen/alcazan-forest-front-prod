import React, {useEffect, useState} from 'react'
import '../../../styles/app.css'
import actionTypeApi from "../../services/actionTypeApi";
import objectApi from "../../../services/objectApi";
import EquipementApi from "../../../services/EquipementApi";
import MapApi from "../../../services/MapApi";
import consommableApi from "../../../services/consommableApi";
import bossApi from "../../../services/bossApi";
import mapMakerApi from "../../services/MapMakerApi";
import monsterApi from "../../../services/monsterApi";


export default function ActionFormHooked({action}) {

    const [fields, setFields] =  useState([]);
    const [fieldContent, setFieldContent] =  useState([]);

    useEffect(() => {
        fetchAllFieldsAndValues();
    }, []);

    const fetchAllFieldsAndValues = async () => {
        const fields = await actionTypeApi.getAllFields(action.actionTypeId);
        setFields(fields);

        console.log(fields);

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
            <h6>{action.actionName + " : " + action.actionTypeName}</h6>
            <input name="actionName" label="Nom de l'action"/>
            {fields && fields.length > 0 && fields.map((field, index) => {
                if(field.type === "select"){
                    return <select key={index} name={field.name} label={field.name}>
                        <option value={0}>selectionner un {field.name}</option>
                        {fieldContent && fieldContent.length > 0 && fieldContent.map((content, index) => {
                            return <option key={index} value={content.id}>{content.name}</option>
                        })}
                    </select>
                }
                else{
                    return <input key={index} name={"action"+ field.name[0].toUpperCase() + field.name.substring(1)} type={field.type} label={field.name} value={action["action"+ field.name[0].toUpperCase() + field.name.substring(1)]}/>
                }

            })}
        </div>
    )

}