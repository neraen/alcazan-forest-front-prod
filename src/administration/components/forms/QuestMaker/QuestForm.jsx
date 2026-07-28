import React, {useEffect, useState} from 'react'
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {toast} from "react-toastify";
import QuestMakerApi from "../../../services/QuestMakerApi";
import {useQuestEditor} from "../../../contexts/QuestEditorContext";
import SequenceForm from "./SequenceForm";
import QuestFlowMap from "./QuestFlowMap";

/** Où mène un choix, en texte court, pour le résumé du rail. */
function targetLabel(nextSequenceKey, fromIndex, sequences){
    if(nextSequenceKey === "__END__"){
        return "🏁 fin";
    }
    if(nextSequenceKey){
        const idx = sequences.findIndex(s => String(s?.clientKey || s?.id || "") === nextSequenceKey);
        if(idx >= 0){
            return "→ " + (sequences[idx]?.nomSequence || `Séq. ${idx + 1}`);
        }
    }
    return fromIndex + 1 < sequences.length ? "→ suivante" : "🏁 fin";
}

const emptyQuest = {
    id: 0,
    name: "",
    introduction: "",
    minimalLevel: 0,
    alignementId: 0,
    objetId: 0,
    prerequisiteQueteId: 0,
    sequences: []
};

const emptySequence = {
    id: 0,
    // Clé stable côté client pour cibler cette séquence dans un branchement
    // avant qu'elle n'ait un id serveur (générée à l'ajout).
    clientKey: "",
    nomSequence: "",
    dialogueTitre: "",
    dialogueContenu: "",
    pnjId: 0,
    actions: []
};

/** Clé client unique pour une séquence neuve (non encore persistée). */
const newClientKey = () =>
    "new-" + (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2));

/**
 * Formulaire d'une quête complète (création si questId = 0). Le payload
 * soumis est exactement la valeur du formulaire : miroir de ce que renvoie
 * /quest/editor/get. La position des séquences est déduite de l'ordre de la
 * liste (et recalculée côté serveur), plus de champs position/isLast manuels.
 */
export default function QuestForm({questId, onSaved}){

    const {referentiels} = useQuestEditor();
    const [isLoading, setIsLoading] = useState(questId > 0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const {register, handleSubmit, control, reset} = useForm({defaultValues: emptyQuest});
    // keyName fieldId : ne pas écraser l'id (base de données) des séquences.
    const {fields, append, remove, move} = useFieldArray({control, name: "sequences", keyName: "fieldId"});

    // Valeurs live des séquences (noms, choix, branchements) pour le rail + la carte.
    const watchedSequences = useWatch({control, name: "sequences"}) || [];

    // Index affiché borné à la liste courante (séquence supprimée / quête vide).
    const activeIndex = fields.length === 0 ? -1 : Math.min(selectedIndex, fields.length - 1);

    const handleAddSequence = () => {
        append({...emptySequence, clientKey: newClientKey()});
        setSelectedIndex(fields.length); // la nouvelle séquence = dernier index
    };

    const handleMoveSequence = (from, to) => {
        move(from, to);
        setSelectedIndex(to);
    };

    const handleRemoveSequence = (index) => {
        remove(index);
        setSelectedIndex(current => Math.max(0, Math.min(current, fields.length - 2)));
    };

    useEffect(() => {
        if(questId > 0){
            QuestMakerApi.get(questId)
                .then(quest => {
                    reset(quest);
                    setIsLoading(false);
                })
                .catch(() => toast.error("Impossible de charger la quête."));
        }
    }, [questId, reset]);

    const submit = async (quest) => {
        try {
            const saved = await QuestMakerApi.save(quest);
            // reset avec la réponse : les éléments créés récupèrent leurs ids définitifs.
            reset(saved);
            toast.success("Quête sauvegardée.");
            onSaved(saved);
        } catch (error) {
            toast.error(error.response?.data?.error || "La sauvegarde a échoué.");
        }
    };

    if(isLoading){
        return <div>Chargement de la quête…</div>;
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
            <input type="hidden" {...register("id", {valueAsNumber: true})}/>
            <div className="quest-info-form">
                <h2> Informations de la quête </h2>
                <div className="qm-quest-info-grid">
                <div className="field-group gold-border">
                    <label> Nom de la quête </label>
                    <input {...register("name", {required: true})}/>
                </div>
                <div className="field-group gold-border qm-intro-field">
                    <label> Texte d'introduction (accroche affichée avant d'accepter) </label>
                    <textarea rows={4} {...register("introduction")}
                              placeholder="Ce que le PNJ dit pour proposer la quête. Laisser vide = description du PNJ."/>
                </div>
                <div className="field-group gold-border">
                    <label> Niveau requis (0 = aucun) </label>
                    <input type="number" {...register("minimalLevel", {valueAsNumber: true})}/>
                </div>

                <div className="field-group gold-border">
                    <label> Alignement requis </label>
                    <select {...register("alignementId", {valueAsNumber: true})}>
                        <option value={0}>Aucun alignement requis</option>
                        {referentiels.alignements.map(alignement =>
                            <option key={alignement.id} value={alignement.id}>{alignement.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group gold-border">
                    <label> Objet requis </label>
                    <select {...register("objetId", {valueAsNumber: true})}>
                        <option value={0}>Aucun objet requis</option>
                        {referentiels.objets.map(objet =>
                            <option key={objet.id} value={objet.id}>{objet.name}</option>
                        )}
                    </select>
                </div>

                <div className="field-group gold-border">
                    <label> Quête à terminer d'abord </label>
                    <select {...register("prerequisiteQueteId", {valueAsNumber: true})}>
                        <option value={0}>Aucune quête prérequise</option>
                        {referentiels.quetes.filter(quete => quete.id !== questId).map(quete =>
                            <option key={quete.id} value={quete.id}>{quete.name}</option>
                        )}
                    </select>
                </div>
                </div>

                <button className="form-btn qm-save-quest" type="submit">Sauvegarder la quête</button>
            </div>

            <div className="quest-maker-central-part">
                <div className="qm-workspace">
                    <aside className="qm-rail">
                        <QuestFlowMap
                            sequences={watchedSequences}
                            selectedIndex={activeIndex}
                            onSelect={setSelectedIndex}
                        />

                        <div className="qm-seq-list">
                            <div className="add-form-btn qm-add-seq" onClick={handleAddSequence}>+ Ajouter une séquence</div>
                            {fields.map((sequence, index) => {
                                const data = watchedSequences[index] || {};
                                const choices = data.actions || [];
                                return (
                                    <button
                                        type="button"
                                        key={sequence.fieldId}
                                        className={`qm-seq-item${index === activeIndex ? " selected" : ""}`}
                                        onClick={() => setSelectedIndex(index)}
                                    >
                                        <span className="qm-seq-item-title">
                                            <span className="qm-seq-item-num">{index + 1}</span>
                                            {data.nomSequence || <em>Séquence sans nom</em>}
                                        </span>
                                        <span className="qm-seq-item-choices">
                                            {choices.length === 0
                                                ? <span className="qm-muted">aucun choix</span>
                                                : choices.map((choice, ci) =>
                                                    <span key={ci} className="qm-seq-item-choice">
                                                        {choice.label || "Choix"} <span className="qm-arrow">{targetLabel(choice.nextSequenceKey || "", index, watchedSequences)}</span>
                                                    </span>
                                                )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="qm-detail">
                        {activeIndex < 0 ? (
                            <div className="qm-detail-empty">
                                Cette quête n'a pas encore de séquence.<br/>
                                Clique sur « + Ajouter une séquence » pour commencer.
                            </div>
                        ) : (
                            <SequenceForm
                                key={fields[activeIndex].fieldId}
                                index={activeIndex}
                                total={fields.length}
                                control={control}
                                register={register}
                                removeSequence={handleRemoveSequence}
                                moveSequence={handleMoveSequence}
                            />
                        )}
                    </section>
                </div>
            </div>
        </form>
    );
}
