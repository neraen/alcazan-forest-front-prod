import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import DonjonMakerApi from "../services/DonjonMakerApi";
import DonjonForm from "../components/forms/DonjonMaker/DonjonForm";

/**
 * DonjonMaker : liste des donjons + édition d'un donjon (DonjonForm).
 * Référentiels (cartes, monstres, types de salle) et config des mécaniques sont
 * fetchés UNE fois ici et passés en props. La création passe par le même formulaire
 * que l'édition (save sans id) — patron du QuestMaker.
 */
const DonjonMakerPage = () => {

    const [donjons, setDonjons] = useState([]);
    const [selectedDonjonId, setSelectedDonjonId] = useState(null);
    const [editorData, setEditorData] = useState(null);

    useEffect(() => {
        const charger = async () => {
            const [liste, referentiels, mecaniqueConfig] = await Promise.all([
                DonjonMakerApi.list(),
                DonjonMakerApi.referentiels(),
                DonjonMakerApi.config()
            ]);
            setDonjons(liste);
            setEditorData({referentiels, mecaniqueConfig});
        };

        charger().catch(() => toast.error("Impossible de charger le DonjonMaker."));
    }, []);

    const rafraichirListe = async (donjonSauvegarde) => {
        setDonjons(await DonjonMakerApi.list());
        setSelectedDonjonId(donjonSauvegarde.donjon.id);
    };

    const supprimer = async () => {
        if(!selectedDonjonId || !window.confirm("Supprimer définitivement ce donjon ?")){
            return;
        }
        try {
            await DonjonMakerApi.remove(selectedDonjonId);
            toast.success("Donjon supprimé.");
            setSelectedDonjonId(null);
            setDonjons(await DonjonMakerApi.list());
        } catch (error) {
            // Le serveur refuse la suppression d'un donjon qui a des expéditions :
            // son message explique quoi faire (désactiver), on le montre tel quel.
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if(!editorData){
        return <h1>Chargement du DonjonMaker…</h1>;
    }

    return (
        <>
            <h1>DonjonMaker</h1>
            <div className="quest-page-maker-container">
                <div className="quest-maker-toolbar">
                    <select
                        className="select-form-field"
                        value={selectedDonjonId ?? ""}
                        onChange={(event) => setSelectedDonjonId(event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value="">— Choisir un donjon —</option>
                        {donjons.map(donjon =>
                            <option key={donjon.id} value={donjon.id}>
                                {donjon.nom}{donjon.actif ? "" : " (inactif)"} — {donjon.salles} salle{donjon.salles > 1 ? "s" : ""}
                            </option>
                        )}
                    </select>
                    <button type="button" className="map-maker-btn-validation" onClick={() => setSelectedDonjonId(0)}>
                        Créer un donjon
                    </button>
                    {selectedDonjonId > 0 && (
                        <button type="button" className="map-maker-btn-validation" onClick={supprimer}>
                            Supprimer le donjon
                        </button>
                    )}
                </div>

                {selectedDonjonId !== null && (
                    <DonjonForm key={selectedDonjonId}
                                donjonId={selectedDonjonId}
                                referentiels={editorData.referentiels}
                                mecaniqueConfig={editorData.mecaniqueConfig}
                                onSaved={rafraichirListe}/>
                )}
            </div>
        </>
    );
};

export default DonjonMakerPage;
