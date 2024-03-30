import React, {useEffect, useState} from 'react'
import '../../../../styles/app.css'
import {useFieldArray, useForm} from "react-hook-form";
import QuestMakerApi from "../../../services/QuestMakerApi";
import SequenceForm from "./SequenceForm";

export default function QuestForm({questId}){

    const [questInfos, setQuestInfo] = useState([])
    const [selectContent, setSelectContent] = useState([])

    const {
        register,
        handleSubmit,
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
                            return <SequenceForm key={index} index={index} control={control} remove={remove} register={register}/>
                        })}
                    </div>
                </form>
             )}
        </div>
    );
}
