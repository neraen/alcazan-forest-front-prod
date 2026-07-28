import React, {useCallback, useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ArtisanatMakerApi from "../services/ArtisanatMakerApi";
import MetierForm from "../components/forms/ArtisanatMaker/MetierForm";
import RessourceForm from "../components/forms/ArtisanatMaker/RessourceForm";
import RecetteForm from "../components/forms/ArtisanatMaker/RecetteForm";

const ONGLETS = [
    {cle: "metiers", label: "Métiers"},
    {cle: "ressources", label: "Ressources"},
    {cle: "recettes", label: "Recettes"},
];

/**
 * ArtisanatMaker : les trois faces du contenu d'artisanat.
 *
 * Un seul écran parce que les trois se répondent — une recette exige un métier, une
 * ressource appartient à un métier. Les séparer obligerait à naviguer entre trois pages
 * pour écrire une seule chaîne de production.
 *
 * Référentiels et config sont fetchés UNE fois ici — patron du QuestMaker, du DonjonMaker
 * et de l'InteractionMaker. Le front ne connaît ni famille ni mode en dur : tout vient de
 * `/config`.
 */
const ArtisanatMakerPage = () => {

    const [onglet, setOnglet] = useState("metiers");
    const [listes, setListes] = useState(null);
    const [referentiels, setReferentiels] = useState(null);
    const [config, setConfig] = useState(null);
    const [selection, setSelection] = useState({metiers: null, ressources: null, recettes: null});

    const rafraichir = useCallback(() => ArtisanatMakerApi.list().then(setListes), []);

    useEffect(() => {
        Promise.all([ArtisanatMakerApi.list(), ArtisanatMakerApi.referentiels(), ArtisanatMakerApi.config()])
            .then(([liste, refs, conf]) => {
                setListes(liste);
                setReferentiels(refs);
                setConfig(conf);
            })
            .catch(() => toast.error("Impossible de charger l'ArtisanatMaker."));
    }, []);

    const choisir = (cle, id) => setSelection(precedent => ({...precedent, [cle]: id}));

    const apresSauvegarde = async (cle, id) => {
        await rafraichir();
        // Les référentiels contiennent les métiers et objets : ils bougent avec eux.
        setReferentiels(await ArtisanatMakerApi.referentiels());
        choisir(cle, id ?? null);
    };

    const supprimer = async (cle, appel, question) => {
        const id = selection[cle];
        if(!id || !window.confirm(question)){
            return;
        }
        try {
            await appel(id);
            toast.success("Supprimé.");
            choisir(cle, null);
            await rafraichir();
        } catch (error) {
            // Le serveur refuse tant que c'est référencé : son message dit quoi faire.
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if(!listes || !referentiels || !config){
        return <h1>Chargement de l'ArtisanatMaker…</h1>;
    }

    const selecteur = (cle, options, libelle, rendreOption) => (
        <select className="select-form-field"
                value={selection[cle] ?? ""}
                onChange={(event) => choisir(cle, event.target.value ? Number(event.target.value) : null)}>
            <option value="">— {libelle} —</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>{rendreOption(option)}</option>
            ))}
        </select>
    );

    return (
        <>
            <h1>Artisanat</h1>
            <p className="donjon-maker-aide">
                Les métiers, les ressources qu'ils récoltent et les recettes qu'ils fabriquent.
                Les cases de récolte se posent, elles, dans l'onglet Interactions puis avec
                l'outil « Poser une interaction » du Map Maker.
            </p>

            <div className="quest-maker-toolbar">
                {ONGLETS.map(item => (
                    <button key={item.cle} type="button"
                            className={onglet === item.cle ? "quest-maker-tab-active" : ""}
                            onClick={() => setOnglet(item.cle)}>
                        {item.label}
                    </button>
                ))}
            </div>

            {onglet === "metiers" && (
                <div className="quest-page-maker-container">
                    <div className="quest-maker-toolbar">
                        {selecteur("metiers", listes.metiers, "Nouveau métier",
                            (m) => `${m.nom} (${m.famille}) — ${m.recettes} recette(s), ${m.ressources} ressource(s)`)}
                        <button type="button" onClick={() => choisir("metiers", null)}>Nouveau</button>
                        <button type="button"
                                onClick={() => supprimer("metiers", ArtisanatMakerApi.deleteMetier,
                                    "Supprimer définitivement ce métier ?")}>
                            Supprimer
                        </button>
                    </div>
                    <MetierForm metierId={selection.metiers}
                                referentiels={referentiels}
                                config={config}
                                onSaved={(metier) => apresSauvegarde("metiers", metier.id)}/>
                </div>
            )}

            {onglet === "ressources" && (
                <div className="quest-page-maker-container">
                    <div className="quest-maker-toolbar">
                        {selecteur("ressources", listes.ressources, "Nouvel objet",
                            (r) => `${r.nom}${r.metier ? ` — ${r.metier} niv. ${r.niveauRessource}` : " — (pas une ressource)"}`)}
                        <button type="button" onClick={() => choisir("ressources", null)}>Nouveau</button>
                    </div>
                    <RessourceForm ressource={listes.ressources.find(r => r.id === selection.ressources) || null}
                                   referentiels={referentiels}
                                   onSaved={() => apresSauvegarde("ressources", selection.ressources)}/>
                </div>
            )}

            {onglet === "recettes" && (
                <div className="quest-page-maker-container">
                    <div className="quest-maker-toolbar">
                        {selecteur("recettes", listes.recettes, "Nouvelle recette",
                            (r) => `${r.nom} — ${r.metier} niv. ${r.niveauRequis}${r.actif ? "" : " (inactive)"}`)}
                        <button type="button" onClick={() => choisir("recettes", null)}>Nouvelle</button>
                        <button type="button"
                                onClick={() => supprimer("recettes", ArtisanatMakerApi.deleteRecette,
                                    "Supprimer définitivement cette recette ?")}>
                            Supprimer
                        </button>
                    </div>
                    <RecetteForm recetteId={selection.recettes}
                                 referentiels={referentiels}
                                 config={config}
                                 onSaved={(recette) => apresSauvegarde("recettes", recette.id)}/>
                </div>
            )}
        </>
    );
};

export default ArtisanatMakerPage;
