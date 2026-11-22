import React from 'react';

/**
 * Contenu d'un coffre (et de toute interaction qui n'est pas une récolte) : une liste de
 * lignes, chacune GARANTIE ou AU TIRAGE. À chaque ouverture, le serveur donne toutes les
 * garanties puis tire `tirages` lignes distinctes parmi les autres, au prorata du poids
 * (`RecompenseService::lignesObtenues`). Le front ne fait que saisir et annoncer ; les
 * chances affichées sont une aide de lecture, le tirage reste serveur.
 */

const cleNeuve = () => Math.random().toString(36).slice(2);

export const ligneVide = (type = "or") => ({
    cle: cleNeuve(), id: null, type, itemId: null, quantiteMin: 1, quantiteMax: 1, garanti: true, poids: 1,
});

/**
 * Un coffre d'avant les lignes ne porte que les champs historiques (un item de chaque
 * sorte, une quantité, de l'or, de l'XP) : on les présente en lignes garanties. Le premier
 * enregistrement les convertit pour de bon (le serveur vide alors les champs historiques).
 */
export function lignesDepuisHistorique(recompense) {
    if (!recompense) return [];
    const quantite = Math.max(1, Number(recompense.quantity) || 1);
    const lignes = [];
    if (recompense.objetId) lignes.push({...ligneVide("objet"), itemId: recompense.objetId, quantiteMin: quantite, quantiteMax: quantite});
    if (recompense.equipementId) lignes.push({...ligneVide("equipement"), itemId: recompense.equipementId});
    if (recompense.consommableId) lignes.push({...ligneVide("consommable"), itemId: recompense.consommableId, quantiteMin: quantite, quantiteMax: quantite});
    if (recompense.money > 0) lignes.push({...ligneVide("or"), quantiteMin: recompense.money, quantiteMax: recompense.money});
    if (recompense.experience > 0) lignes.push({...ligneVide("experience"), quantiteMin: recompense.experience, quantiteMax: recompense.experience});
    return lignes;
}

const CATALOGUE = {objet: "objets", equipement: "equipements", consommable: "consommables"};

const ContenuRecompenseForm = ({lignes, tirages, referentiels, onChange}) => {
    const types = referentiels.typesLigneRecompense || [];
    const auTirage = lignes.filter(l => !l.garanti);
    const poidsTotal = auTirage.reduce((total, l) => total + (Number(l.poids) || 0), 0);
    const nbTirages = Math.min(Math.max(1, Number(tirages) || 1), auTirage.length);

    const maj = (nouvelles, nouveauxTirages = tirages) => onChange({lignes: nouvelles, tirages: nouveauxTirages});
    const majLigne = (cle, champs) => maj(lignes.map(l => (l.cle ?? l.id) === cle ? {...l, ...champs} : l));
    const nombre = (valeur) => (valeur === "" ? "" : Number(valeur));

    /** Chance qu'une ouverture donne cette ligne au tirage — approximation lisible. */
    const chance = (ligne) => poidsTotal > 0
        ? Math.min(100, Math.round((Number(ligne.poids) || 0) / poidsTotal * nbTirages * 100))
        : 0;

    return <>
        <div className="contenu-coffre-modes">
            <span>Tout passer en :</span>
            <button type="button" onClick={() => maj(lignes.map(l => ({...l, garanti: true})))}>Tout donner</button>
            <button type="button" onClick={() => maj(lignes.map(l => ({...l, garanti: false})))}>Tirage au sort</button>
        </div>

        {lignes.length === 0 && <p className="donjon-maker-aide">Vide : l'interaction ne donne rien (seul l'effet scripté joue).</p>}

        <ul className="contenu-coffre-lignes">
            {lignes.map(ligne => {
                const cle = ligne.cle ?? ligne.id;
                const typeItem = CATALOGUE[ligne.type];
                return <li key={cle} className={ligne.garanti ? "" : "is-tirage"}>
                    <select className="select-form-field" value={ligne.type} aria-label="Ce que donne la ligne"
                            onChange={(e) => majLigne(cle, {type: e.target.value, itemId: null})}>
                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {typeItem
                        ? <select className="select-form-field" value={ligne.itemId ?? ""} aria-label="Item"
                                  onChange={(e) => majLigne(cle, {itemId: e.target.value ? Number(e.target.value) : null})}>
                            <option value="">— Choisir —</option>
                            {(referentiels[typeItem] || []).map(entree => <option key={entree.id} value={entree.id}>{entree.nom}</option>)}
                        </select>
                        : <span className="contenu-coffre-sans-item">{ligne.type === "or" ? "pièces d'or" : "points d'expérience"}</span>}
                    <label className="contenu-coffre-quantite">
                        <input type="number" min="1" value={ligne.quantiteMin} aria-label="Quantité minimum"
                               onChange={(e) => majLigne(cle, {quantiteMin: nombre(e.target.value)})}/>
                        à
                        <input type="number" min="1" value={ligne.quantiteMax} aria-label="Quantité maximum"
                               onChange={(e) => majLigne(cle, {quantiteMax: nombre(e.target.value)})}/>
                    </label>
                    <select className="select-form-field" value={ligne.garanti ? "garanti" : "tirage"} aria-label="Garanti ou au tirage"
                            onChange={(e) => majLigne(cle, {garanti: e.target.value === "garanti"})}>
                        <option value="garanti">Toujours donné</option>
                        <option value="tirage">Au tirage</option>
                    </select>
                    {ligne.garanti
                        ? <span className="contenu-coffre-chance">100 %</span>
                        : <label className="contenu-coffre-poids" title="Plus le poids est grand, plus la ligne sort souvent">
                            poids
                            <input type="number" min="1" value={ligne.poids} aria-label="Poids"
                                   onChange={(e) => majLigne(cle, {poids: nombre(e.target.value)})}/>
                            <span className="contenu-coffre-chance">≈ {chance(ligne)} %</span>
                        </label>}
                    <button type="button" className="contenu-coffre-retirer" title="Retirer la ligne"
                            onClick={() => maj(lignes.filter(l => (l.cle ?? l.id) !== cle))}>✕</button>
                </li>;
            })}
        </ul>

        <button type="button" className="contenu-coffre-ajouter" onClick={() => maj([...lignes, ligneVide()])}>+ Ajouter une ligne</button>

        {auTirage.length > 0 && <div className="form-group contenu-coffre-tirages">
            <label>Lignes tirées à chaque ouverture</label>
            <input type="number" min="1" max={auTirage.length} value={tirages ?? 1}
                   onChange={(e) => maj(lignes, nombre(e.target.value))}/>
            <small>parmi {auTirage.length} au tirage — jamais deux fois la même</small>
        </div>}

        <p className="donjon-maker-aide">
            À chaque ouverture : {lignes.length - auTirage.length} ligne{lignes.length - auTirage.length > 1 ? "s" : ""} toujours
            donnée{lignes.length - auTirage.length > 1 ? "s" : ""}
            {auTirage.length > 0 && ` + ${nbTirages} tirée${nbTirages > 1 ? "s" : ""} au sort parmi ${auTirage.length}`}.
            Une quantité « 1 à 3 » est tirée à chaque fois ; égale des deux côtés, elle est fixe.
        </p>
    </>;
};

export default ContenuRecompenseForm;
