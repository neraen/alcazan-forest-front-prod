import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import QuestMakerApi from "../services/QuestMakerApi";
import QuestEditorContext from "../contexts/QuestEditorContext";
import QuestForm from "../components/forms/QuestMaker/QuestForm";

/**
 * QuestMaker : liste des quêtes + édition d'une quête (QuestForm).
 * Les référentiels et la config des types d'action sont fetchés UNE fois
 * ici et distribués par contexte. La création passe par le même formulaire
 * que l'édition (save sans id).
 */
const QuestMakerPage = () => {

    const [quests, setQuests] = useState([]);
    const [selectedQuestId, setSelectedQuestId] = useState(null);
    const [editorData, setEditorData] = useState(null);

    useEffect(() => {
        const fetchEditorData = async () => {
            const [questList, referentiels, actionTypeConfig] = await Promise.all([
                QuestMakerApi.list(),
                QuestMakerApi.referentiels(),
                QuestMakerApi.config()
            ]);
            setQuests(questList);
            setEditorData({referentiels, actionTypeConfig});
        };

        fetchEditorData().catch(() => toast.error("Impossible de charger le QuestMaker."));
    }, []);

    const refreshList = async (savedQuest) => {
        setQuests(await QuestMakerApi.list());
        setSelectedQuestId(savedQuest.id);
    };

    const handleDelete = async () => {
        if(!selectedQuestId || !window.confirm("Supprimer définitivement cette quête ?")){
            return;
        }
        try {
            await QuestMakerApi.remove(selectedQuestId);
            toast.success("Quête supprimée.");
            setSelectedQuestId(null);
            setQuests(await QuestMakerApi.list());
        } catch (error) {
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if(!editorData){
        return <h1>Chargement du QuestMaker…</h1>;
    }

    return (
        <QuestEditorContext.Provider value={editorData}>
            <h1>QuestMaker</h1>
            <div className="quest-page-maker-container">
                <div className="quest-maker-toolbar">
                    <select
                        className="select-form-field"
                        value={selectedQuestId ?? ""}
                        onChange={(event) => setSelectedQuestId(event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value="">— Choisir une quête —</option>
                        {quests.map(quest =>
                            <option key={quest.id} value={quest.id}>{quest.name}</option>
                        )}
                    </select>
                    <button type="button" className="map-maker-btn-validation" onClick={() => setSelectedQuestId(0)}>
                        Créer une quête
                    </button>
                    {selectedQuestId > 0 && (
                        <button type="button" className="map-maker-btn-validation" onClick={handleDelete}>
                            Supprimer la quête
                        </button>
                    )}
                </div>

                {selectedQuestId !== null && (
                    <QuestForm key={selectedQuestId} questId={selectedQuestId} onSaved={refreshList}/>
                )}
            </div>
        </QuestEditorContext.Provider>
    );
};

export default QuestMakerPage;
