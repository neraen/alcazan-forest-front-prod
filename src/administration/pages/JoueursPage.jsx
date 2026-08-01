import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import AdminStatsApi from "../services/AdminStatsApi";
import AdminCatalog from "../components/AdminCatalog";

/**
 * Fiche d'enquête d'un joueur : qui il est, ses totaux de partie, et ce qu'il a fait ET subi.
 *
 * Cet écran remplit le `NavLink to="/administration/joueurs"` qui était déclaré dans le menu
 * d'administration SANS route correspondante — un lien mort depuis l'origine du projet.
 *
 * Le rail est celui d'`AdminCatalog` (recherche + liste + aperçu), avec `allowNew={false}` :
 * on n'y crée rien, c'est un écran d'observation. Le journal est chargé à la demande, à la
 * sélection : le rail liste tous les comptes, mais personne n'a besoin de cent événements
 * pour vingt-deux joueurs d'un coup.
 */
const JoueursPage = () => {

    const [joueurs, setJoueurs] = useState([]);
    const [selection, setSelection] = useState(null);
    const [fiche, setFiche] = useState(null);
    const [chargementFiche, setChargementFiche] = useState(false);

    useEffect(() => {
        AdminStatsApi.joueurs()
            .then((donnees) => setJoueurs(donnees.joueurs))
            .catch(() => toast.error("Impossible de charger la liste des joueurs."));
    }, []);

    const choisir = (id) => {
        setSelection(id);
        setFiche(null);
        setChargementFiche(true);
        AdminStatsApi.joueur(id)
            .then(setFiche)
            .catch(() => toast.error("Impossible de charger la fiche."))
            .finally(() => setChargementFiche(false));
    };

    const or = (valeur) => `${Number(valeur).toLocaleString("fr-FR")} po`;

    return <AdminCatalog
        items={joueurs}
        selectedId={selection}
        onSelect={choisir}
        allowNew={false}
        getId={(joueur) => joueur.id}
        getName={(joueur) => joueur.pseudo}
        getMeta={(joueur) => `${joueur.classe || "sans classe"} · niveau ${joueur.niveau ?? "?"}`}
    >
        {selection === null && <p className="journal-vide">Choisissez un joueur dans la liste.</p>}
        {chargementFiche && <p className="journal-vide">Chargement de la fiche…</p>}

        {fiche && <div className="fiche-joueur">
            <div className="stats-tuiles">
                <Tuile label="Or" valeur={or(fiche.joueur.money)}/>
                <Tuile label="Honneur PvP" valeur={fiche.joueur.honneur}/>
                <Tuile label="Karma" valeur={fiche.joueur.karma}/>
                <Tuile label="Dernière connexion" valeur={fiche.joueur.derniereConnexion || "jamais"}/>
            </div>

            {fiche.joueur.horsClassement && (
                <p className="fiche-note">Ce compte est exclu des classements publics.</p>
            )}

            <h3 className="stats-titre">Faits d'armes</h3>
            <div className="fiche-cumuls">
                {fiche.cumuls.map((cumul) => (
                    <div key={cumul.cle} className="stats-ligne">
                        <span>{cumul.label}</span>
                        <span className="stats-valeur">
                            {cumul.format === "or"
                                ? or(cumul.valeur)
                                : cumul.valeur.toLocaleString("fr-FR")}
                        </span>
                    </div>
                ))}
            </div>

            <h3 className="stats-titre">
                Journal
                <span className="stats-compteur">
                    {fiche.evenements.length} affiché(s) sur {fiche.evenementsTotal}
                </span>
            </h3>
            {fiche.evenements.length === 0
                ? <p className="stats-vide">Ce joueur n'a encore rien fait.</p>
                : <table className="journal-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Catégorie</th>
                            <th>Événement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fiche.evenements.map((evenement) => (
                            <tr key={evenement.id} className={`journal-categorie-${evenement.categorie}`}>
                                <td className="journal-date">{evenement.creeLe}</td>
                                <td><span className="journal-badge">{evenement.categorieLabel}</span></td>
                                <td>
                                    <div className="journal-phrase">{evenement.phrase}</div>
                                    <div className="journal-meta">{evenement.typeLabel}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
        </div>}
    </AdminCatalog>;
};

const Tuile = ({label, valeur}) => (
    <div className="stats-tuile">
        <span className="stats-tuile-label">{label}</span>
        <span className="stats-tuile-valeur">{valeur}</span>
    </div>
);

export default JoueursPage;
