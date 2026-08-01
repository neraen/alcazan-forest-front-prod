import React, {useCallback, useEffect, useState} from 'react';
import {toast} from "react-toastify";
import AdminStatsApi from "../services/AdminStatsApi";

/**
 * Flux brut du journal d'événements : ce qui se passe dans le jeu, filtrable.
 *
 * Écran d'OBSERVATION — il ne modifie rien. Il ne connaît AUCUN type ni catégorie en dur :
 * la liste des filtres vient de `/api/admin/stats/referentiels`, comme le QuestMaker lit
 * ses champs depuis `QuestActionTypeConfig`. Ajouter un type d'événement reste donc une
 * modification back seulement.
 *
 * Les phrases affichées sont rendues côté serveur (`TypeEvenement::phrase()`) : c'est ce
 * qui garantit qu'un objet supprimé du contenu reste lisible dans l'historique, son nom
 * ayant été figé au moment du fait.
 */
const JournalPage = () => {

    const [referentiels, setReferentiels] = useState(null);
    const [filtre, setFiltre] = useState({userId: "", categorie: "", type: "", depuis: "", jusqua: ""});
    const [resultat, setResultat] = useState(null);
    const [page, setPage] = useState(1);
    const [chargement, setChargement] = useState(false);

    useEffect(() => {
        AdminStatsApi.referentiels()
            .then(setReferentiels)
            .catch(() => toast.error("Impossible de charger les référentiels du journal."));
    }, []);

    const charger = useCallback(() => {
        setChargement(true);
        AdminStatsApi.journal({
            userId: filtre.userId === "" ? undefined : Number(filtre.userId),
            // Un type précis l'emporte sur la catégorie : le serveur traduit la catégorie
            // en liste de types, donc envoyer les deux serait ambigu.
            types: filtre.type === "" ? undefined : [filtre.type],
            categorie: filtre.type !== "" || filtre.categorie === "" ? undefined : filtre.categorie,
            depuis: filtre.depuis === "" ? undefined : filtre.depuis,
            jusqua: filtre.jusqua === "" ? undefined : filtre.jusqua,
            page,
        })
            .then(setResultat)
            .catch(() => toast.error("Impossible de charger le journal."))
            .finally(() => setChargement(false));
    }, [filtre, page]);

    useEffect(() => { charger(); }, [charger]);

    const modifier = (champ, valeur) => {
        setPage(1);
        setFiltre(precedent => ({...precedent, [champ]: valeur}));
    };

    const reinitialiser = () => {
        setPage(1);
        setFiltre({userId: "", categorie: "", type: "", depuis: "", jusqua: ""});
    };

    // Les types proposés suivent la catégorie choisie : proposer « Récolte » alors que le
    // rayon « Économie » est sélectionné donnerait un filtre vide sans rien expliquer.
    const typesProposes = (referentiels?.types ?? [])
        .filter(type => filtre.categorie === "" || type.categorie === filtre.categorie);

    const evenements = resultat?.evenements ?? [];
    const total = resultat?.total ?? 0;
    const parPage = resultat?.parPage ?? 50;
    const pagesTotal = Math.max(1, Math.ceil(total / parPage));

    return <div className="journal-page">
        <p className="donjon-maker-aide">
            Tout ce que le jeu produit, du plus récent au plus ancien. Les événements sont
            purgés automatiquement au-delà de la durée de rétention.
        </p>

        <div className="journal-filtres">
            <label className="journal-filtre">
                <span>Joueur</span>
                <select className="select-form-field"
                        value={filtre.userId}
                        onChange={event => modifier("userId", event.target.value)}>
                    <option value="">Tous</option>
                    {(referentiels?.joueurs ?? []).map(joueur => (
                        <option key={joueur.id} value={joueur.id}>{joueur.pseudo}</option>
                    ))}
                </select>
            </label>

            <label className="journal-filtre">
                <span>Catégorie</span>
                <select className="select-form-field"
                        value={filtre.categorie}
                        onChange={event => {
                            modifier("categorie", event.target.value);
                            modifier("type", "");
                        }}>
                    <option value="">Toutes</option>
                    {(referentiels?.categories ?? []).map(categorie => (
                        <option key={categorie.valeur} value={categorie.valeur}>{categorie.label}</option>
                    ))}
                </select>
            </label>

            <label className="journal-filtre">
                <span>Type</span>
                <select className="select-form-field"
                        value={filtre.type}
                        onChange={event => modifier("type", event.target.value)}>
                    <option value="">Tous</option>
                    {typesProposes.map(type => (
                        <option key={type.valeur} value={type.valeur}>{type.label}</option>
                    ))}
                </select>
            </label>

            <label className="journal-filtre">
                <span>Depuis</span>
                <input type="date"
                       className="select-form-field"
                       value={filtre.depuis}
                       onChange={event => modifier("depuis", event.target.value)}/>
            </label>

            <label className="journal-filtre">
                <span>Jusqu'au</span>
                <input type="date"
                       className="select-form-field"
                       value={filtre.jusqua}
                       onChange={event => modifier("jusqua", event.target.value)}/>
            </label>

            <button type="button" className="journal-bouton" onClick={reinitialiser}>
                Réinitialiser
            </button>
        </div>

        <div className="journal-resume">
            {chargement
                ? "Chargement…"
                : `${total} événement${total > 1 ? "s" : ""} — page ${page} / ${pagesTotal}`}
        </div>

        {evenements.length === 0 && !chargement
            ? <p className="journal-vide">
                {total === 0 && resultat !== null
                    ? "Aucun événement ne correspond à ces filtres."
                    : "Le journal est vide : jouez un peu, il se remplira."}
            </p>
            : <table className="journal-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Catégorie</th>
                        <th>Événement</th>
                        <th>Quantité</th>
                        <th>Or</th>
                    </tr>
                </thead>
                <tbody>
                    {evenements.map(evenement => (
                        <tr key={evenement.id} className={`journal-categorie-${evenement.categorie}`}>
                            <td className="journal-date">{evenement.creeLe}</td>
                            <td>
                                <span className="journal-badge">{evenement.categorieLabel}</span>
                            </td>
                            <td>
                                <div className="journal-phrase">{evenement.phrase}</div>
                                <div className="journal-meta">{evenement.typeLabel}</div>
                            </td>
                            <td>{evenement.quantite === 0 ? "—" : evenement.quantite}</td>
                            <td>{evenement.montantOr === 0 ? "—" : evenement.montantOr}</td>
                        </tr>
                    ))}
                </tbody>
            </table>}

        <div className="journal-pagination">
            <button type="button"
                    className="journal-bouton"
                    disabled={page <= 1}
                    onClick={() => setPage(actuelle => Math.max(1, actuelle - 1))}>
                ← Précédent
            </button>
            <span>{page} / {pagesTotal}</span>
            <button type="button"
                    className="journal-bouton"
                    disabled={page >= pagesTotal}
                    onClick={() => setPage(actuelle => actuelle + 1)}>
                Suivant →
            </button>
        </div>
    </div>;
};

export default JournalPage;
