import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import DonjonMakerApi from "../../../services/DonjonMakerApi";
import SallesForm from "./SallesForm";
import MecaniquesForm from "./MecaniquesForm";

const DONJON_VIDE = {
    id: null,
    nom: "",
    description: "",
    icone: "",
    niveauMin: 0,
    tailleGroupeMax: 5,
    dureeMaxMinutes: 180,
    heureReset: 5,
    actif: true,
    carteSortieId: null,
    sortieAbscisse: 0,
    sortieOrdonnee: 0
};

/**
 * Édition complète d'un donjon : fiche + plan des salles + mécaniques, sauvegardées
 * en UN appel (le serveur fait la transaction et conserve les ids).
 *
 * Aucune règle de jeu ici : le formulaire n'est qu'une saisie, tout est revalidé
 * côté serveur (bornes, unicité des cartes, paramètres des mécaniques).
 */
const DonjonForm = ({donjonId, referentiels, mecaniqueConfig, onSaved}) => {

    const [donjon, setDonjon] = useState(DONJON_VIDE);
    const [salles, setSalles] = useState([]);
    const [mecaniques, setMecaniques] = useState([]);
    const [instancesEnCours, setInstancesEnCours] = useState(0);
    const [chargement, setChargement] = useState(donjonId > 0);
    const [enregistrement, setEnregistrement] = useState(false);

    useEffect(() => {
        if(!donjonId){
            setDonjon(DONJON_VIDE);
            setSalles([]);
            setMecaniques([]);
            setChargement(false);
            return;
        }

        DonjonMakerApi.get(donjonId)
            .then(donnees => {
                setDonjon(donnees.donjon);
                setSalles(donnees.salles);
                setMecaniques(donnees.mecaniques);
                setInstancesEnCours(donnees.instancesEnCours);
            })
            .catch(() => toast.error("Impossible de charger ce donjon."))
            .finally(() => setChargement(false));
    }, [donjonId]);

    const champ = (nom) => (event) => {
        const {type, checked, value} = event.target;
        const valeur = type === "checkbox" ? checked
            : (type === "number" ? (value === "" ? 0 : Number(value)) : value);
        setDonjon(precedent => ({...precedent, [nom]: valeur}));
    };

    const enregistrer = async (event) => {
        event.preventDefault();
        if(enregistrement){
            return;
        }
        setEnregistrement(true);
        try {
            const sauvegarde = await DonjonMakerApi.save({...donjon, salles, mecaniques});
            setDonjon(sauvegarde.donjon);
            setSalles(sauvegarde.salles);
            setMecaniques(sauvegarde.mecaniques);
            toast.success("Donjon enregistré.");
            onSaved(sauvegarde);
        } catch (error) {
            toast.error(error.response?.data?.error || "L'enregistrement a échoué.");
        } finally {
            setEnregistrement(false);
        }
    };

    if(chargement){
        return <p>Chargement du donjon…</p>;
    }

    return (
        <form onSubmit={enregistrer}>
            {instancesEnCours > 0 && (
                <p className="donjon-maker-avertissement">
                    {instancesEnCours} expédition{instancesEnCours > 1 ? "s sont" : " est"} en cours dans ce
                    donjon. Vos modifications s'appliqueront à leur prochain tick de combat.
                </p>
            )}

            <fieldset className="donjon-maker-bloc">
                <legend>Fiche</legend>

                <div className="form-group">
                    <label>Nom</label>
                    <input type="text" value={donjon.nom} onChange={champ("nom")} required/>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea rows="2" value={donjon.description ?? ""} onChange={champ("description")}/>
                </div>

                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Niveau minimum</label>
                        <input type="number" min="0" value={donjon.niveauMin} onChange={champ("niveauMin")}/>
                    </div>
                    <div className="form-group">
                        <label>Joueurs maximum</label>
                        <input type="number" min="1" value={donjon.tailleGroupeMax} onChange={champ("tailleGroupeMax")}/>
                    </div>
                    <div className="form-group">
                        <label>Durée max (min)</label>
                        <input type="number" min="0" value={donjon.dureeMaxMinutes} onChange={champ("dureeMaxMinutes")}/>
                        <small>0 = pas de limite</small>
                    </div>
                    <div className="form-group">
                        <label>Heure de reset</label>
                        <input type="number" min="0" max="23" value={donjon.heureReset} onChange={champ("heureReset")}/>
                        <small>Le verrou quotidien tombe à cette heure, en heure de Paris</small>
                    </div>
                </div>

                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Carte de sortie</label>
                        <select className="select-form-field"
                                value={donjon.carteSortieId ?? ""}
                                onChange={(event) => setDonjon(precedent => ({
                                    ...precedent,
                                    carteSortieId: event.target.value ? Number(event.target.value) : null
                                }))}>
                            <option value="">— Aucune —</option>
                            {referentiels.cartes.map(carte =>
                                <option key={carte.id} value={carte.id}>{carte.nom}</option>
                            )}
                        </select>
                        <small>Où sont reposés les joueurs éjectés (instance expirée)</small>
                    </div>
                    <div className="form-group">
                        <label>Case de sortie X</label>
                        <input type="number" min="0" value={donjon.sortieAbscisse} onChange={champ("sortieAbscisse")}/>
                    </div>
                    <div className="form-group">
                        <label>Case de sortie Y</label>
                        <input type="number" min="0" value={donjon.sortieOrdonnee} onChange={champ("sortieOrdonnee")}/>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={donjon.actif} onChange={champ("actif")}/> Actif
                        </label>
                        <small>Inactif : plus de nouvelle expédition, celles en cours continuent</small>
                    </div>
                </div>
            </fieldset>

            <SallesForm salles={salles}
                        onChange={setSalles}
                        cartes={referentiels.cartes}
                        typesDeSalle={referentiels.typesDeSalle}
                        conditionsDeSalle={referentiels.conditionsDeSalle}
                        monstres={referentiels.monstres}
                        donjonId={donjon.id}/>

            <MecaniquesForm mecaniques={mecaniques}
                            onChange={setMecaniques}
                            config={mecaniqueConfig}
                            catalogues={referentiels}/>

            <button type="submit" className="map-maker-btn-validation" disabled={enregistrement}>
                {enregistrement ? "Enregistrement…" : "Enregistrer le donjon"}
            </button>
        </form>
    );
};

export default DonjonForm;
