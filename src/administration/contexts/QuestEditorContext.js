import {createContext, useContext} from "react";

/**
 * Contexte du QuestMaker : les référentiels (catalogues d'objets, PNJ, boss…)
 * et la config des types d'action, fetchés UNE fois par QuestMakerPage.
 * Remplace le prop-drilling sur 4 niveaux et les refetchs de catalogues
 * que faisait chaque ActionForm.
 */
const QuestEditorContext = createContext({
    referentiels: {},
    actionTypeConfig: {}
});

export const useQuestEditor = () => useContext(QuestEditorContext);

export default QuestEditorContext;
