import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import InteractionMakerApi from "../services/InteractionMakerApi";
import InteractionForm from "../components/forms/InteractionMaker/InteractionForm";

/**
 * InteractionMaker : liste des interactions + édition (InteractionForm).
 * Référentiels et config sont fetchés UNE fois ici — patron du QuestMaker et du
 * DonjonMaker.
 */
const InteractionMakerPage = () => {

    const [interactions, setInteractions] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [editorData, setEditorData] = useState(null);

    useEffect(() => {
        const charger = async () => {
            const [liste, referentiels, config] = await Promise.all([
                InteractionMakerApi.list(),
                InteractionMakerApi.referentiels(),
                InteractionMakerApi.config()
            ]);
            setInteractions(liste);
            setEditorData({referentiels, config});
        };

        charger().catch(() => toast.error("Impossible de charger l'InteractionMaker."));
    }, []);

    const rafraichir = async (sauvegarde) => {
        setInteractions(await InteractionMakerApi.list());
        setSelectedId(sauvegarde.interaction.id);
    };

    const supprimer = async () => {
        if(!selectedId || !window.confirm("Supprimer définitivement cette interaction ?")){
            return;
        }
        try {
            await InteractionMakerApi.remove(selectedId);
            toast.success("Interaction supprimée.");
            setSelectedId(null);
            setInteractions(await InteractionMakerApi.list());
        } catch (error) {
            // Le serveur refuse si elle est encore posée sur des cases : son message dit
            // quoi faire (la retirer des cartes, ou la désactiver).
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if(!editorData){
        return <h1>Chargement de l'InteractionMaker…</h1>;
    }

    return (
        <>
            <h1>Interactions</h1>
            <p className="donjon-maker-aide">
                Ressources à récolter, coffres, leviers et mécanismes. Définissez-les ici,
                puis posez-les sur les cartes avec l'outil « Poser une interaction » du Map Maker.
            </p>
            <div className="quest-page-maker-container">
                <div className="quest-maker-toolbar">
                    <select
                        className="select-form-field"
                        value={selectedId ?? ""}
                        onChange={(event) => setSelectedId(event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value="">— Choisir une interaction —</option>
                        {interactions.map(interaction =>
                            <option key={interaction.id} value={interaction.id}>
                                {interaction.nom}{interaction.actif ? "" : " (inactive)"}
                                {interaction.posees > 0 ? ` — posée ${interaction.posees}×` : " — non posée"}
                            </option>
                        )}
                    </select>
                    <button type="button" className="map-maker-btn-validation" onClick={() => setSelectedId(0)}>
                        Créer une interaction
                    </button>
                    {selectedId > 0 && (
                        <button type="button" className="map-maker-btn-validation" onClick={supprimer}>
                            Supprimer
                        </button>
                    )}
                </div>

                {selectedId !== null && (
                    <InteractionForm key={selectedId}
                                     interactionId={selectedId}
                                     referentiels={editorData.referentiels}
                                     config={editorData.config}
                                     onSaved={rafraichir}/>
                )}
            </div>
        </>
    );
};

export default InteractionMakerPage;
