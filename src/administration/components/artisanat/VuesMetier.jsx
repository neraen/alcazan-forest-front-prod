import React, {useMemo, useState} from 'react';
import styles from './Artisanat.module.scss';
import IconeAtlas from "../monde/IconeAtlas";
import {urlImage} from "../../services/adminImageApi";
import {ICONE_TYPE, TYPES_SOURCE, imageItem} from "../itemMaker/itemModele";

/**
 * Les vues en cartes de l'ArtisanatMaker. Aucune règle : niveaux, sources et images viennent
 * du serveur (liste de l'ArtisanatMaker + catalogue de l'Item Maker, indexé par clé `type:id`).
 */

const normaliser = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const duree = (secondes) => {
    if (secondes < 60) return `${secondes} s`;
    if (secondes < 3600) return `${Math.round(secondes / 60)} min`;
    const h = Math.floor(secondes / 3600);
    const m = Math.round((secondes % 3600) / 60);
    return m ? `${h} h ${m}` : `${h} h`;
};

/** Icône de métier, avec repli sur l'initiale : les icônes n'existent pas encore sur le disque. */
export const IconeMetier = ({metier, taille = 56}) => {
    const [absente, setAbsente] = useState(false);
    const url = urlImage('metier', metier.icone);
    return <span className={`${styles.iconeMetier} ${styles['famille_' + metier.famille]}`} style={{width: taille, height: taille, fontSize: taille * 0.42}}>
        {url && !absente
            ? <img src={url} alt="" onError={() => setAbsente(true)}/>
            : metier.nom.charAt(0)}
    </span>;
};

/** Vignette d'item (image du catalogue, ou pictogramme de sa famille). */
export const VignetteItem = ({item, cle, taille = 40}) => {
    const [absente, setAbsente] = useState(false);
    const image = item ? imageItem(item) : null;
    const type = (item?.type) || (cle || '').split(':')[0];
    return <span className={styles.vignette} style={{width: taille, height: taille}}>
        {image && !absente
            ? <img src={image} alt="" onError={() => setAbsente(true)}/>
            : <IconeAtlas nom={ICONE_TYPE[type] || 'sac'} taille={Math.round(taille * 0.5)}/>}
    </span>;
};

/* ---------------------------------------------------------- accueil */

export const GrilleMetiers = ({metiers, config, onOuvrir, onCreer}) => {
    const familles = config.familles || [{value: 'recolte', label: 'Récolte'}, {value: 'craft', label: 'Fabrication'}];
    return <div className={styles.familles}>
        {familles.map(famille => {
            const liste = metiers.filter(m => m.famille === famille.value);
            return <section key={famille.value} className={styles.famille}>
                <h2>
                    <IconeAtlas nom={famille.value === 'recolte' ? 'recolte' : 'recette'} taille={18}/>
                    Métiers de {famille.label.toLowerCase()} <small>{liste.length}</small>
                </h2>
                <div className={styles.grilleMetiers}>
                    {liste.map(metier => (
                        <button key={metier.id} type="button" className={styles.carteMetier} onClick={() => onOuvrir(metier.id)}>
                            <IconeMetier metier={metier}/>
                            <span className={styles.carteMetierCorps}>
                                <strong>{metier.nom}</strong>
                                {metier.description && <span className={styles.carteMetierDesc}>{metier.description}</span>}
                                <span className={styles.carteMetierStats}>
                                    {metier.famille === 'recolte'
                                        ? <><b>{metier.ressources}</b> ressource{metier.ressources > 1 ? 's' : ''}</>
                                        : <><b>{metier.recettes}</b> recette{metier.recettes > 1 ? 's' : ''}</>}
                                    <span>· niv. max {metier.niveauMax}</span>
                                </span>
                            </span>
                        </button>
                    ))}
                    <button type="button" className={styles.carteAjout} onClick={() => onCreer(famille.value)}>
                        <IconeAtlas nom="plus" taille={22}/>
                        <span>Nouveau métier de {famille.label.toLowerCase()}</span>
                    </button>
                </div>
            </section>;
        })}
    </div>;
};

/* ---------------------------------------------------------- récolte */

export const DetailRecolte = ({metier, ressources, catalogue, selectionId, onOuvrir, onCreer}) => {
    const [terme, setTerme] = useState('');
    const liste = useMemo(() => ressources
        .filter(r => r.metierId === metier.id)
        .filter(r => !terme || normaliser(r.nom).includes(normaliser(terme)))
        .sort((a, b) => a.niveauRessource - b.niveauRessource || a.nom.localeCompare(b.nom)), [ressources, metier, terme]);

    return <>
        <div className={styles.outils}>
            <input type="search" value={terme} onChange={(e) => setTerme(e.target.value)} placeholder="Chercher une ressource…"/>
            <span className={styles.compte}>{liste.length} ressource{liste.length > 1 ? 's' : ''}, triées par niveau</span>
        </div>
        <div className={styles.grilleItems}>
            <button type="button" className={styles.carteAjout} onClick={onCreer}>
                <IconeAtlas nom="plus" taille={22}/>
                <span>Nouvelle ressource</span>
                <small>{metier.nom}</small>
            </button>
            {liste.map(ressource => {
                const item = catalogue.get(`objet:${ressource.id}`);
                const types = item ? [...new Set(item.sources.map(s => s.type))] : [];
                const points = item ? item.sources.filter(s => s.type === 'recolte').length : 0;
                const monstres = item ? item.sources.filter(s => s.type === 'monstre').length : 0;
                const alerte = item?.alertes.find(a => a.code === 'inobtenable' || a.code === 'monstres_absents');
                return <button key={ressource.id} type="button"
                               className={`${styles.carteRessource} ${selectionId === ressource.id ? styles.carteActive : ''}`}
                               onClick={() => onOuvrir(ressource)} title={alerte?.message || ressource.description || ressource.nom}>
                    <span className={styles.niveau}>Niv. {ressource.niveauRessource}</span>
                    {alerte && <span className={styles.pastilleAlerte}/>}
                    <VignetteItem item={item} cle={`objet:${ressource.id}`} taille={58}/>
                    <strong>{ressource.nom}</strong>
                    <span className={styles.sources}>
                        {points > 0 && <span style={{color: TYPES_SOURCE.recolte.couleur}}><IconeAtlas nom="recolte" taille={12}/> {points} point{points > 1 ? 's' : ''}</span>}
                        {monstres > 0 && <span style={{color: TYPES_SOURCE.monstre.couleur}}><IconeAtlas nom="monstre" taille={12}/> {monstres}</span>}
                        {types.filter(t => t !== 'recolte' && t !== 'monstre').map(t => (
                            <span key={t} style={{color: TYPES_SOURCE[t].couleur}} title={TYPES_SOURCE[t].libelle}><IconeAtlas nom={TYPES_SOURCE[t].icone} taille={12}/></span>
                        ))}
                        {types.length === 0 && <span className={styles.aucune}>aucune source</span>}
                    </span>
                    <span className={styles.prix}>{ressource.prixVente ? `${ressource.prixVente} po` : 'ne se revend pas'}</span>
                    {item && item.usages.length > 0 && <span className={styles.usages}>→ {item.usages.length} recette{item.usages.length > 1 ? 's' : ''}</span>}
                </button>;
            })}
        </div>
        {liste.length === 0 && <p className={styles.vide}>{terme ? "Aucune ressource ne correspond." : "Ce métier ne récolte encore rien : créez sa première ressource."}</p>}
    </>;
};

/* ---------------------------------------------------------- fabrication */

const PALIER = 20;

export const DetailFabrication = ({metier, recettes, catalogue, selectionId, onOuvrir, onCreer}) => {
    const [terme, setTerme] = useState('');
    const liste = useMemo(() => recettes
        .filter(r => r.metierId === metier.id)
        .filter(r => {
            if (!terme) return true;
            const t = normaliser(terme);
            return normaliser(r.nom).includes(t)
                || r.ingredients.some(i => normaliser(catalogue.get(i.cle)?.nom).includes(t));
        })
        .sort((a, b) => a.niveauRequis - b.niveauRequis || a.nom.localeCompare(b.nom)), [recettes, metier, terme, catalogue]);

    // Paliers de niveau : 80 recettes d'alchimie en vrac ne se lisent pas.
    const paliers = useMemo(() => {
        const groupes = new Map();
        liste.forEach(r => {
            const debut = Math.floor(r.niveauRequis / PALIER) * PALIER;
            if (!groupes.has(debut)) groupes.set(debut, []);
            groupes.get(debut).push(r);
        });
        return [...groupes.entries()];
    }, [liste]);

    const carteRecette = (recette) => {
        const produit = recette.produit?.cle ? catalogue.get(recette.produit.cle) : null;
        return <button key={recette.id} type="button"
                       className={`${styles.carteRecette} ${selectionId === recette.id ? styles.carteActive : ''} ${recette.actif ? '' : styles.inactive}`}
                       onClick={() => onOuvrir(recette.id)}>
            <span className={styles.recetteTete}>
                <VignetteItem item={produit} cle={recette.produit?.cle} taille={52}/>
                <span className={styles.recetteTitre}>
                    <strong>{produit?.nom || recette.nom}</strong>
                    {produit && produit.nom !== recette.nom && <small>{recette.nom}</small>}
                    {!recette.produit?.cle && <small className={styles.aucune}>ne produit rien</small>}
                </span>
                {recette.produit?.quantite > 1 && <span className={styles.quantiteProduit}>× {recette.produit.quantite}</span>}
            </span>
            <span className={styles.recetteMeta}>
                <span className={styles.niveauInline}>Niv. {recette.niveauRequis}</span>
                <span title="Temps de fabrication"><IconeAtlas nom="cible" taille={11}/> {duree(recette.tempsSecondes)}</span>
                <span className={styles.difficulte} title={`Difficulté ${recette.difficulte}/5`}>
                    {[1, 2, 3, 4, 5].map(n => <i key={n} className={n <= recette.difficulte ? styles.pleine : ''}/>)}
                </span>
                {!recette.actif && <span className={styles.badgeInactif}>inactive</span>}
                {recette.enCours > 0 && <span className={styles.badgeEnCours} title="Fabrications en cours">{recette.enCours} en cours</span>}
            </span>
            <ul className={styles.composants}>
                {recette.ingredients.length === 0 && <li className={styles.aucune}>aucun ingrédient</li>}
                {recette.ingredients.map((ingredient, index) => {
                    const item = ingredient.cle ? catalogue.get(ingredient.cle) : null;
                    return <li key={index}>
                        <VignetteItem item={item} cle={ingredient.cle} taille={22}/>
                        <b>{ingredient.quantite} ×</b>
                        <span>{item?.nom || 'item inconnu'}</span>
                    </li>;
                })}
            </ul>
        </button>;
    };

    return <>
        <div className={styles.outils}>
            <input type="search" value={terme} onChange={(e) => setTerme(e.target.value)} placeholder="Chercher une recette ou un composant…"/>
            <span className={styles.compte}>{liste.length} recette{liste.length > 1 ? 's' : ''}</span>
        </div>
        <div className={styles.grilleRecettes}>
            <button type="button" className={`${styles.carteAjout} ${styles.carteAjoutRecette}`} onClick={onCreer}>
                <IconeAtlas nom="plus" taille={22}/>
                <span>Nouvelle recette</span>
                <small>{metier.nom}</small>
            </button>
        </div>
        {paliers.map(([debut, groupe]) => (
            <section key={debut} className={styles.palier}>
                <h3>Niveau {debut} – {debut + PALIER - 1} <small>{groupe.length}</small></h3>
                <div className={styles.grilleRecettes}>{groupe.map(carteRecette)}</div>
            </section>
        ))}
        {liste.length === 0 && <p className={styles.vide}>{terme ? "Aucune recette ne correspond." : "Ce métier ne fabrique encore rien : créez sa première recette."}</p>}
    </>;
};
