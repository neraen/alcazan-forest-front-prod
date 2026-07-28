import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import InteractionMakerApi from "../../../services/InteractionMakerApi";
import ConditionsForm from "./ConditionsForm";
import ImageUploadField from "../imageUpload/ImageUploadField";

const VIDE = {
    id: null,
    nom: "",
    type: "recolter",
    skin: "",
    messageSucces: "",
    coutPa: 0,
    effect: null,
    effectParams: null,
    metierId: null,
    niveauMetierMin: 1,
    experienceMetier: 0,
    cooldownSecondes: 0,
    porteeRecharge: "joueur",
    usageUnique: false,
    recolteChoix: false,
    actif: true
};

const RECOMPENSE_VIDE = {
    objetId: null, equipementId: null, consommableId: null,
    money: null, experience: null, quantity: null
};

/**
 * Édition complète d'une interaction : fiche + récompense + conditions, sauvegardées en
 * UN appel (le serveur fait la transaction et conserve les ids).
 *
 * Aucune règle de jeu ici : le formulaire n'est qu'une saisie, tout est revalidé côté
 * serveur (métier existant, JSON de l'effet, bornes).
 */
const InteractionForm = ({interactionId, referentiels, config, onSaved}) => {

    const [interaction, setInteraction] = useState(VIDE);
    const [recompense, setRecompense] = useState(RECOMPENSE_VIDE);
    const [conditions, setConditions] = useState([]);
    const [posees, setPosees] = useState([]);
    const [chargement, setChargement] = useState(interactionId > 0);
    const [enregistrement, setEnregistrement] = useState(false);

    useEffect(() => {
        if(!interactionId){
            setInteraction(VIDE);
            setRecompense(RECOMPENSE_VIDE);
            setConditions([]);
            setPosees([]);
            setChargement(false);
            return;
        }

        InteractionMakerApi.get(interactionId)
            .then(donnees => {
                setInteraction(donnees.interaction);
                setRecompense(donnees.recompense);
                setConditions(donnees.conditions);
                setPosees(donnees.posees);
            })
            .catch(() => toast.error("Impossible de charger cette interaction."))
            .finally(() => setChargement(false));
    }, [interactionId]);

    const champ = (nom) => (event) => {
        const {type, checked, value} = event.target;
        const valeur = type === "checkbox" ? checked
            : (type === "number" ? (value === "" ? 0 : Number(value)) : value);
        setInteraction(precedent => ({...precedent, [nom]: valeur}));
    };

    const champRecompense = (nom, numerique = true) => (event) => {
        const value = event.target.value;
        setRecompense(precedent => ({
            ...precedent,
            [nom]: value === "" ? null : (numerique ? Number(value) : value)
        }));
    };

    const enregistrer = async (event) => {
        event.preventDefault();
        if(enregistrement){
            return;
        }
        setEnregistrement(true);
        try {
            const sauvegarde = await InteractionMakerApi.save({...interaction, recompense, conditions});
            setInteraction(sauvegarde.interaction);
            setRecompense(sauvegarde.recompense);
            setConditions(sauvegarde.conditions);
            setPosees(sauvegarde.posees);
            toast.success("Interaction enregistrée.");
            onSaved(sauvegarde);
        } catch (error) {
            toast.error(error.response?.data?.error || "L'enregistrement a échoué.");
        } finally {
            setEnregistrement(false);
        }
    };

    if(chargement){
        return <p>Chargement…</p>;
    }

    const typeCourant = config.types.find(t => t.value === interaction.type);
    const porteeCourante = config.portees.find(p => p.value === interaction.porteeRecharge);

    return (
        <form onSubmit={enregistrer}>
            {posees.length > 0 && (
                <p className="donjon-maker-avertissement">
                    Posée sur {posees.length} case{posees.length > 1 ? "s" : ""} :{" "}
                    {posees.map(c => `${c.carte} (${c.abscisse},${c.ordonnee})`).join(" · ")}
                </p>
            )}

            <fieldset className="donjon-maker-bloc">
                <legend>Fiche</legend>

                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Nom</label>
                        <input type="text" value={interaction.nom} onChange={champ("nom")} required/>
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select className="select-form-field" value={interaction.type} onChange={champ("type")}>
                            {config.types.map(type =>
                                <option key={type.value} value={type.value}>{type.label}</option>
                            )}
                        </select>
                    </div>
                    <ImageUploadField id="interaction-skin" collection="interaction" label="Image (skin)"
                                      nom={interaction.nom} valeur={interaction.skin}
                                      onChange={(fichier) => setInteraction(precedent => ({...precedent, skin: fichier}))}/>
                    <div className="form-group">
                        <label>Coût en PA</label>
                        <input type="number" min="0" value={interaction.coutPa} onChange={champ("coutPa")}/>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={interaction.actif} onChange={champ("actif")}/> Active
                        </label>
                    </div>
                </div>
                {typeCourant && <p className="donjon-maker-aide">{typeCourant.aide}</p>}

                <div className="form-group">
                    <label>Message de réussite</label>
                    <input type="text" value={interaction.messageSucces ?? ""} onChange={champ("messageSucces")}
                           placeholder="Laissé vide : seuls les gains sont annoncés"/>
                </div>
            </fieldset>

            <fieldset className="donjon-maker-bloc">
                <legend>Disponibilité</legend>
                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Délai de recharge (s)</label>
                        <input type="number" min="0" value={interaction.cooldownSecondes}
                               onChange={champ("cooldownSecondes")}/>
                        <small>0 = réutilisable immédiatement</small>
                    </div>
                    <div className="form-group">
                        <label>Portée du délai</label>
                        <select className="select-form-field" value={interaction.porteeRecharge}
                                onChange={champ("porteeRecharge")}>
                            {config.portees.map(portee =>
                                <option key={portee.value} value={portee.value}>{portee.label}</option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={interaction.usageUnique}
                                   onChange={champ("usageUnique")}/> Usage unique
                        </label>
                        <small>Jamais rechargée, dans la limite de la portée</small>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={interaction.recolteChoix}
                                   onChange={champ("recolteChoix")}/> Propose le choix de récolte
                        </label>
                        <small>Le joueur choisit entre prélever avec mesure et saigner le gisement</small>
                    </div>
                </div>
                {porteeCourante && <p className="donjon-maker-aide">{porteeCourante.aide}</p>}

                {/* Les curseurs ne se règlent PAS par case : ils sont globaux
                    (RecolteConfig). On les affiche pour que l'auteur sache ce qu'il arme
                    en cochant la case, sans lui laisser croire qu'il peut les modifier ici. */}
                {interaction.recolteChoix && (config.modesRecolte || []).map(mode => (
                    <p key={mode.value} className="donjon-maker-aide">
                        <strong>{mode.label}</strong> — butin ×{mode.quantite}, rechargement
                        personnel ×{mode.cooldown}
                        {mode.epuisement > 0
                            ? `, gisement mort pour tous pendant ${mode.epuisement} × le délai`
                            : ", aucun épuisement partagé"}
                        , karma {mode.karma > 0 ? `+${mode.karma}` : mode.karma}.
                    </p>
                ))}
            </fieldset>

            <fieldset className="donjon-maker-bloc">
                <legend>Métier</legend>
                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Métier requis</label>
                        <select className="select-form-field"
                                value={interaction.metierId ?? ""}
                                onChange={(event) => setInteraction(p => ({
                                    ...p, metierId: event.target.value ? Number(event.target.value) : null
                                }))}>
                            <option value="">— Aucun —</option>
                            {referentiels.metiers.map(metier =>
                                <option key={metier.id} value={metier.id}>{metier.nom}</option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Niveau minimum</label>
                        <input type="number" min="1" value={interaction.niveauMetierMin}
                               onChange={champ("niveauMetierMin")} disabled={!interaction.metierId}/>
                    </div>
                    <div className="form-group">
                        <label>XP de métier donnée</label>
                        <input type="number" min="0" value={interaction.experienceMetier}
                               onChange={champ("experienceMetier")} disabled={!interaction.metierId}/>
                    </div>
                </div>
            </fieldset>

            <fieldset className="donjon-maker-bloc">
                <legend>Récompense</legend>
                <div className="donjon-maker-ligne">
                    {[
                        ["objetId", "Objet", "objets"],
                        ["equipementId", "Équipement", "equipements"],
                        ["consommableId", "Consommable", "consommables"]
                    ].map(([cle, label, catalogue]) => (
                        <div className="form-group" key={cle}>
                            <label>{label}</label>
                            <select className="select-form-field"
                                    value={recompense[cle] ?? ""}
                                    onChange={champRecompense(cle)}>
                                <option value="">— Aucun —</option>
                                {referentiels[catalogue].map(entree =>
                                    <option key={entree.id} value={entree.id}>{entree.nom}</option>
                                )}
                            </select>
                        </div>
                    ))}
                    <div className="form-group">
                        <label>Quantité</label>
                        <input type="number" min="1" value={recompense.quantity ?? ""} onChange={champRecompense("quantity")}/>
                    </div>
                    <div className="form-group">
                        <label>Or</label>
                        <input type="number" min="0" value={recompense.money ?? ""} onChange={champRecompense("money")}/>
                    </div>
                    <div className="form-group">
                        <label>Expérience</label>
                        <input type="number" min="0" value={recompense.experience ?? ""} onChange={champRecompense("experience")}/>
                    </div>
                </div>
            </fieldset>

            <ConditionsForm conditions={conditions}
                            onChange={setConditions}
                            config={config.conditions}
                            catalogues={referentiels}/>

            <fieldset className="donjon-maker-bloc">
                <legend>Effet scripté (avancé)</legend>
                <div className="donjon-maker-ligne">
                    <div className="form-group">
                        <label>Effet</label>
                        <select className="select-form-field"
                                value={interaction.effect ?? ""}
                                onChange={(event) => setInteraction(p => ({...p, effect: event.target.value || null}))}>
                            <option value="">— Aucun —</option>
                            {config.effets.map(effet =>
                                <option key={effet.value} value={effet.value}>{effet.label}</option>
                            )}
                        </select>
                        <small>Butin de boss, levier de donjon… en plus de la récompense</small>
                    </div>
                    <div className="form-group">
                        <label>Paramètres (JSON)</label>
                        <input type="text"
                               value={interaction.effectParams ? JSON.stringify(interaction.effectParams) : ""}
                               onChange={(event) => setInteraction(p => ({...p, effectParams: event.target.value}))}
                               placeholder='ex : {"bossId": 1}'/>
                    </div>
                </div>
            </fieldset>

            <button type="submit" className="map-maker-btn-validation" disabled={enregistrement}>
                {enregistrement ? "Enregistrement…" : "Enregistrer l'interaction"}
            </button>
        </form>
    );
};

export default InteractionForm;
