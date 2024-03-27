import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import {useFieldArray, useForm} from "react-hook-form";
import QuestMakerApi from "../../../services/QuestMakerApi";
import SequenceFormHooked from "./SequenceFormHooked";

export default function QuestFormHooked({questId}){

    const [questInfos, setQuestInfo] = useState([])
    const [selectContent, setSelectContent] = useState([])
    const [sequences, setSequences] = useState([])
    const [defaultValues, setDefaultValues] = useState([])

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        formState: {isSubmitting}
    } = useForm({
        questInfos
    });

    useEffect(() => {
        fetchQuestInfo();
        fetchSelectContent();
    }, []);

    useEffect(() => {
        if (questInfos) {
            reset(questInfos);
        }
    }, [questInfos, reset]);


    const fetchQuestInfo = async () => {
        const questInfosFetch = await QuestMakerApi.getQuest(questId);
        console.log(questInfosFetch)
        if(questInfosFetch.sequences !== undefined){
            setSequences(questInfosFetch.sequences);
        }
        setQuestInfo(questInfosFetch);
    }

    const fetchSelectContent = async () => {
        const selectContentFetch = await QuestMakerApi.getQuestsInfoForSelect();
        setSelectContent(selectContentFetch);
    }

    const emptySequence = {
        id: 0,
        position: 0,
        hasAction: 0,
        isLast: false,
        dialogueContent:"",
        dialogueId: 0,
        pnjName: "",
        pnjId: 0,
        actions: [],
        recompense: []
    };

    const { fields, append, remove } = useFieldArray({ control, name: "sequences" });

    async function submit(values){
        console.log(values);
    }

    return (

        <div>
            {selectContent && (
                <form onSubmit={handleSubmit(submit)}>
                    <input {...register("level")} />
                    <input {...register("name")} />
                    <select {...register("alignement")} label="Alignement requis">
                        <option  value={0}>Aucun alignement requis</option>
                        {selectContent.alignements && selectContent.alignements.map((alignement) => {
                            return <option key={alignement.id} value={alignement.id}>{alignement.name}</option>
                        })}
                    </select>
                    <select {...register("objet")} label="Objet requis">
                        <option value={0}>Aucun objet requis</option>
                        {selectContent.objets && selectContent.objets.map((objet) => {
                            return <option key={objet.id} value={objet.id}>{objet.name}</option>
                        })}
                    </select>
                    <button type="submit">Submit</button>

                    <div className="quest-maker-central-part sequences">
                        <div className="map-maker-btn-validation" onClick={() => append(emptySequence)}>Ajouter une sequence</div>
                        {fields && fields.map((sequence, index) => {
                            return <SequenceFormHooked key={index} index={index} control={control} remove={remove} register={register}/>
                        })}
                    </div>
                </form>
             )}
        </div>
    );
}
