import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import EquipementApi from "../../../../services/EquipementApi";

/** Colonnes fixes du modèle, dans l'ordre où le back les attend (les alias sont tolérés). */
const COLONNES_FIXES = ["nom", "description", "position", "rarete", "prix achat", "prix revente", "niveau min", "classes", "icone"];

/** Un export tableur français lit le `;` ; le back accepte aussi la virgule et la tabulation. */
const SEPARATEUR = ";";

/** Échappe une cellule contenant le séparateur, un guillemet ou un saut de ligne. */
const cellule = (valeur) => {
    const texte = String(valeur ?? "");
    return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
};

const libelleStatut = {
    cree: "Créé",
    maj: "Mis à jour",
    ignore: "Ignoré",
    erreur: "Erreur"
};

/**
 * Import en masse d'équipements par CSV. Pensé pour peupler le catalogue d'un coup puis venir
 * accrocher les images une par une : le rapport donne, pour chaque objet, le chemin d'image
 * que l'EquipementMaker produira.
 */
const ImportEquipementCsv = ({onImported}) => {

    const [formElements, setFormElements] = useState(null);
    const [fichier, setFichier] = useState(null);
    const [mettreAJour, setMettreAJour] = useState(true);
    const [enCours, setEnCours] = useState(false);
    const [rapport, setRapport] = useState(null);

    useEffect(() => {
        EquipementApi.fetchFormElements().then(setFormElements).catch(() => {});
    }, []);

    /**
     * Modèle CSV construit à partir du référentiel réel (positions, raretés, classes et
     * caractéristiques du jeu) : ajouter une caractéristique en base la fait apparaître ici
     * sans toucher au code.
     */
    const telechargerModele = () => {
        if (!formElements) {
            return;
        }
        const caracteristiques = formElements.caracteristiques.map(caracteristique => caracteristique.nom);
        const entete = [...COLONNES_FIXES, ...caracteristiques];

        const exemple = (nom, description, position, rarete, achat, revente, niveau, classes) => {
            const ligne = [nom, description, position, rarete, achat, revente, niveau, classes, ""];
            return [...ligne, ...caracteristiques.map(() => 0)].map(cellule).join(SEPARATEUR);
        };

        const contenu = [
            entete.map(cellule).join(SEPARATEUR),
            exemple("Cape des Brumes", "Une cape légère tissée dans la brume.", formElements.positions[0]?.name || "corps", formElements.rarities[0]?.name || "commun", 450, 120, 12, ""),
            exemple("Dague du Sylvain", "Lame courte au fil vert.", formElements.positions[0]?.name || "corps", formElements.rarities[0]?.name || "commun", 220, 60, 8, formElements.classes.slice(0, 2).map(classe => classe.nom).join("|"))
        ].join("\n");

        // Le BOM évite qu'Excel n'affiche les accents en mojibake à l'ouverture.
        const blob = new Blob(["﻿" + contenu], {type: "text/csv;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const lien = document.createElement("a");
        lien.href = url;
        lien.download = "modele-equipements.csv";
        lien.click();
        URL.revokeObjectURL(url);
    };

    const importer = async (event) => {
        // Sans preventDefault, la soumission implicite rechargerait la page en plein envoi.
        event.preventDefault();
        if (!fichier || enCours) {
            return;
        }

        setEnCours(true);
        try {
            const resultat = await EquipementApi.importCsv(fichier, {mettreAJour});
            setRapport(resultat);
            toast.success(`${resultat.crees} créé(s), ${resultat.misAJour} mis à jour, ${resultat.ignores} en échec.`);
            if (onImported) {
                onImported();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Échec de l'import.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <form className="import-csv" onSubmit={importer}>
            <div className="import-csv-actions">
                <label className="import-csv-file">
                    <span>{fichier ? fichier.name : "Choisir un fichier CSV"}</span>
                    <input type="file" accept=".csv,text/csv"
                           onChange={(event) => setFichier(event.currentTarget.files?.[0] || null)}/>
                </label>

                <label className="import-csv-option">
                    <input type="checkbox" checked={mettreAJour}
                           onChange={(event) => setMettreAJour(event.currentTarget.checked)}/>
                    Compléter les équipements portant déjà le même nom
                </label>

                <button type="submit" disabled={!fichier || enCours}>
                    {enCours ? "Import en cours…" : "Importer"}
                </button>

                <button type="button" onClick={telechargerModele} disabled={!formElements}>
                    Télécharger le modèle
                </button>
            </div>

            <p className="import-csv-aide">
                Colonnes attendues&nbsp;: <code>{COLONNES_FIXES.join(", ")}</code>
                {formElements && <>, puis une colonne par caractéristique (<code>{formElements.caracteristiques.map(caracteristique => caracteristique.nom).join(", ")}</code>).</>}
                <br/>
                <code>position</code>&nbsp;: {formElements ? formElements.positions.map(position => position.name).join(", ") : "…"}.
                &nbsp;<code>rarete</code>&nbsp;: {formElements ? formElements.rarities.map(rarity => rarity.name).join(", ") : "…"}.
                &nbsp;<code>classes</code>&nbsp;: noms séparés par <code>|</code>, <strong>vide = toutes les classes</strong>.
                &nbsp;<code>icone</code> peut rester vide&nbsp;: les images s'ajoutent ensuite objet par objet, le rapport donne le chemin attendu.
            </p>

            {rapport && (
                <div className="import-csv-rapport">
                    <p className="import-csv-resume">
                        <strong>{rapport.crees}</strong> créé(s) · <strong>{rapport.misAJour}</strong> mis à jour · <strong>{rapport.ignores}</strong> en échec
                        {rapport.colonnesIgnorees.length > 0 && <> · colonnes ignorées&nbsp;: {rapport.colonnesIgnorees.join(", ")}</>}
                    </p>
                    <table className="import-csv-table">
                        <thead>
                            <tr><th>Ligne</th><th>Nom</th><th>Statut</th><th>Détail</th><th>Image attendue</th></tr>
                        </thead>
                        <tbody>
                            {rapport.lignes.map(ligne => (
                                <tr key={ligne.ligne} className={`import-csv-statut-${ligne.statut}`}>
                                    <td>{ligne.ligne}</td>
                                    <td>{ligne.nom || <em>—</em>}</td>
                                    <td>{libelleStatut[ligne.statut] || ligne.statut}</td>
                                    <td>{ligne.message}</td>
                                    <td>{ligne.image ? <code>{ligne.image}</code> : ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </form>
    );
};

export default ImportEquipementCsv;
