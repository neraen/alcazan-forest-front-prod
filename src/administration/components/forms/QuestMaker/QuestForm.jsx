import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import {useFieldArray, useForm} from "react-hook-form";
import QuestMakerApi from "../../../services/QuestMakerApi";
import SequenceForm from "./SequenceForm";
import EquipementApi from "../../../../services/EquipementApi";
import consommableApi from "../../../../services/consommableApi";
import objectApi from "../../../../services/objectApi";
import MapMakerApi from "../../../services/MapMakerApi";

export default function QuestForm({questId}){

    const [questInfos, setQuestInfo] = useState([])
    const [selectContent, setSelectContent] = useState([])
    const [pnjs, setPnjs] = useState([]);
    const [equipements, setEquipements] = useState([]);
    const [consommables, setConsommables] = useState([]);
    const [objets, setObjets] = useState([]);
    const [loading, setLoading] = useState(true);


    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {isSubmitting}
    } = useForm();

    useEffect(() => {
        fetchQuestInfo();
        fetchSelectContent();
        fetchSelectElements();
    }, []);

    useEffect(() => {
        if (questInfos) {
            console.log(questInfos)
            reset(questInfos);
        }

    }, [questInfos, reset]);


    const fetchQuestInfo = async () => {
        await QuestMakerApi.getQuest(questId).then((response) => {
            const quest = {...response.data}
            console.log(quest)

            setQuestInfo(quest);
        });
    }

    const fetchSelectContent = async () => {
        const selectContentFetch = await QuestMakerApi.getQuestsInfoForSelect();
        setSelectContent(selectContentFetch);
    }

    const fetchSelectElements = async () =>{
        const equipements = await EquipementApi.getAllEquipements();
        setEquipements(equipements);

        const consommables = await consommableApi.getAllConsommables();
        setConsommables(consommables);

        const objets = await objectApi.getAllObjects();
        setObjets(objets);

        const pnjs = await MapMakerApi.getPnjInfoForSelect();
        setPnjs(pnjs);

        setLoading(false);
        //reset(questInfos)
    }

    const emptySequence = {
        id: 0,
        position: 0,
        hasAction: 0,
        isLast: false,
        dialogueContent:"",
        dialogueId: 0,
        pnj: 0,
        actions: [],
        recompense: []
    };

    const { fields, append, remove } = useFieldArray({ control, name: "sequences" });

    async function submit(quest){
       QuestMakerApi.updateQuest(quest.id, quest)
    }

    return (

        <div>
            {selectContent && !loading && (
                <form onSubmit={handleSubmit(submit)}>
                    <div className="quest-info-form">
                        <h2> Informations de la quête </h2>
                        <div className="field-group gold-border">
                            <label> Niveau requis </label>
                            <input {...register("level")} />
                        </div>
                        <div className="field-group gold-border">
                            <label> Nom de la quête </label>
                            <input {...register("name")} />
                        </div>

                        <div className="field-group gold-border">
                            <label> Alignement requis  </label>
                            <select {...register("alignement")} label="Alignement requis">
                                <option  value={0}>Aucun alignement requis</option>
                                {selectContent.alignements && selectContent.alignements.map((alignement) => {
                                    return <option key={alignement.id} value={alignement.id}>{alignement.name}</option>
                                })}
                            </select>
                        </div>

                        <div className="field-group gold-border">
                            <label> Objet requis  </label>
                            <select {...register("objet")} label="Objet requis">
                                <option value={0}>Aucun objet requis</option>
                                {selectContent.objets && selectContent.objets.map((objet) => {
                                    return <option key={objet.id} value={objet.id}>{objet.name}</option>
                                })}
                            </select>
                        </div>

                        <button className="form-btn" type="submit">Valider la quête</button>
                    </div>

                    <div className="quest-maker-central-part sequences">
                        <div className="add-form-btn" onClick={() => append(emptySequence)}>Ajouter une sequence</div>
                        {fields && fields.map((sequence, index) => {
                            console.log(fields)
                            return <SequenceForm key={index}
                                                 index={index}
                                                 control={control}
                                                 remove={remove}
                                                 register={register}
                                                 pnjs={pnjs}
                                                 objets={objets}
                                                 consommables={consommables}
                                                 equipements={equipements}
                            />
                        })}
                    </div>
                </form>
             )}
        </div>
    );
}
