import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useHistory, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import ItemMakerApi from "../services/ItemMakerApi";
import IconeAtlas from "../components/monde/IconeAtlas";
import CartographieItems from "../components/itemMaker/CartographieItems";
import FicheItem from "../components/itemMaker/FicheItem";
import {ButinsForm, ConsommableForm, ObjetForm} from "../components/itemMaker/FormulairesItem";
import CreateEquipementForm from "../components/forms/CreateEquipement/CreateEquipementForm";
import {FAMILLES, ICONE_TYPE, TYPES_SOURCE, familleDe, filtrer, grouper, imageItem, sousTitre} from "../components/itemMaker/itemModele";
import styles from "../components/itemMaker/ItemMaker.module.scss";

/**
 * Item Maker : TOUT le contenu d'items du jeu (objets, ressources de métier, consommables,
 * équipements), d'où chacun vient et à quoi il sert, et leur édition — butins de monstres
 * compris, qui n'avaient jusqu'ici aucun écran. Cf. doc §25.
 *
 * La sélection vit dans l'URL (`?item=objet:12`) : un lien depuis un autre outil, ou un F5,
 * rouvre la même fiche.
 */
const CREATIONS = [
    {cle: 'ressource', libelle: 'Ressource de métier', icone: 'recolte'},
    {cle: 'objet', libelle: 'Objet', icone: 'sac'},
    {cle: 'consommable', libelle: 'Consommable', icone: 'potion'},
    {cle: 'equipement', libelle: 'Équipement', icone: 'epee'},
];

const ItemMakerPage = () => {
    const history = useHistory();
    const location = useLocation();
    const selectionCle = useMemo(() => new URLSearchParams(location.search).get('item'), [location.search]);

    const [donnees, setDonnees] = useState(null);
    const [vue, setVue] = useState('catalogue');
    const [filtre, setFiltre] = useState({famille: 'tous', metierId: '', terme: '', aTraiter: false});
    // `edition` : null (fiche), {mode: 'modifier'|'butins'} ou {mode: 'creer', type}.
    const [edition, setEdition] = useState(null);
    const [menuCreation, setMenuCreation] = useState(false);

    const charger = useCallback(() => ItemMakerApi.catalogue()
        .then(setDonnees)
        .catch(() => toast.error("Impossible de charger le catalogue d'items.")), []);
    useEffect(() => { charger(); }, [charger]);

    const selectionner = useCallback((cle) => {
        setEdition(null);
        history.replace(cle ? `/administration/items?item=${cle}` : "/administration/items");
    }, [history]);

    const filtres = useMemo(() => donnees ? filtrer(donnees.items, filtre) : [], [donnees, filtre]);
    const groupes = useMemo(() => grouper(filtres), [filtres]);

    if (!donnees) {
        return <p className={styles.chargement}>Inventaire du contenu…</p>;
    }

    const {items, referentiels} = donnees;
    const selection = selectionCle ? items.find(i => i.cle === selectionCle) : null;
    const compte = (famille) => famille === 'tous' ? items.length : items.filter(i => familleDe(i) === famille).length;
    const aTraiter = items.filter(i => i.alertes.some(a => a.code !== 'sans_image')).length;

    /** Toute écriture renvoie `{cle, catalogue}` : on adopte le catalogue frais et on suit l'item. */
    const apresEcriture = (verbe) => (reponse) => {
        setDonnees(reponse.catalogue);
        const item = reponse.catalogue.items.find(i => i.cle === reponse.cle);
        toast.success(`« ${item?.nom || 'Item'} » ${verbe}.`);
        selectionner(reponse.cle);
    };

    /** Un bonus enregistré : catalogue frais (effets et cartes à jour), et l'id pour le formulaire. */
    const enregistrerBuff = (data) => ItemMakerApi.enregistrerBuff(data).then(reponse => {
        setDonnees(reponse.catalogue);
        toast.success(`Bonus « ${data.nom} » enregistré.`);
        return reponse.buffId;
    });

    const panneau = () => {
        if (edition?.mode === 'creer') {
            const fermer = () => setEdition(null);
            switch (edition.type) {
                case 'consommable':
                    return <ConsommableForm referentiels={referentiels} onAnnuler={fermer} onEnregistrerBuff={enregistrerBuff}
                                            onEnregistrer={(data) => ItemMakerApi.enregistrerConsommable(data).then(apresEcriture('créé'))}/>;
                case 'equipement':
                    return <aside className={`${styles.panneau} ${styles.panneauEquipement}`}>
                        <CreateEquipementForm hideSelector={true} externalSelectedId={0}
                                              onSaved={async (id) => { await charger(); if (id) selectionner(`equipement:${id}`); }}/>
                    </aside>;
                default:
                    return <ObjetForm referentiels={referentiels} ressource={edition.type === 'ressource'} onAnnuler={fermer}
                                      onEnregistrer={(data) => ItemMakerApi.enregistrerObjet(data).then(apresEcriture('créé'))}/>;
            }
        }
        if (!selection) {
            return <aside className={styles.panneau}>
                <header className={styles.panneauEntete}><div className={styles.panneauTitre}><h2>Vue d'ensemble</h2><p>Cliquez un item pour l'ouvrir</p></div></header>
                <dl className={styles.caracs}>
                    {FAMILLES.slice(1).map(f => <div key={f.cle}><dt>{f.libelle}</dt><dd>{compte(f.cle)}</dd></div>)}
                </dl>
                <section className={styles.section}>
                    <h3>D'où viennent les items</h3>
                    <ul className={styles.repartition}>
                        {Object.entries(TYPES_SOURCE).map(([type, meta]) => {
                            const n = items.filter(i => i.sources.some(s => s.type === type)).length;
                            return <li key={type} style={{'--teinte': meta.couleur}}>
                                <IconeAtlas nom={meta.icone} taille={14}/> {meta.libelle}
                                <span className={styles.jauge}><i style={{width: `${n / items.length * 100}%`}}/></span>
                                <b>{n}</b>
                            </li>;
                        })}
                    </ul>
                </section>
                <section className={styles.section}>
                    <h3>À traiter <small>{aTraiter}</small></h3>
                    {aTraiter === 0 && <p className={styles.vide}>Tous les items s'obtiennent et servent à quelque chose.</p>}
                    {items.filter(i => i.alertes.some(a => a.code !== 'sans_image')).slice(0, 12).map(i => (
                        <button key={i.cle} type="button" className={styles.alerteLigne} onClick={() => selectionner(i.cle)}>
                            <b>{i.nom}</b> {i.alertes.find(a => a.code !== 'sans_image').message}
                        </button>
                    ))}
                    {aTraiter > 12 && <button type="button" className={styles.lienTexte} onClick={() => setFiltre({...filtre, aTraiter: true})}>Voir les {aTraiter}</button>}
                </section>
            </aside>;
        }

        const fermerEdition = () => setEdition(null);
        if (edition?.mode === 'butins') {
            return <ButinsForm key={selection.cle} item={selection} referentiels={referentiels} onAnnuler={fermerEdition}
                               onEnregistrer={(butins) => ItemMakerApi.enregistrerButins(selection.id, butins).then(apresEcriture('mis à jour'))}/>;
        }
        if (edition?.mode === 'modifier') {
            if (selection.type === 'equipement') {
                return <aside className={`${styles.panneau} ${styles.panneauEquipement}`}>
                    <button type="button" className={styles.lienTexte} onClick={fermerEdition}>← Retour à la fiche</button>
                    <CreateEquipementForm key={selection.id} hideSelector={true} externalSelectedId={selection.id}
                                          onSaved={async () => { await charger(); toast.success("Équipement enregistré."); setEdition(null); }}/>
                </aside>;
            }
            if (selection.type === 'consommable') {
                return <ConsommableForm key={selection.cle} item={selection} referentiels={referentiels} onAnnuler={fermerEdition} onEnregistrerBuff={enregistrerBuff}
                                        onEnregistrer={(data) => ItemMakerApi.enregistrerConsommable(data).then(apresEcriture('enregistré'))}/>;
            }
            return <ObjetForm key={selection.cle} item={selection} referentiels={referentiels} onAnnuler={fermerEdition}
                              onEnregistrer={(data) => ItemMakerApi.enregistrerObjet(data).then(apresEcriture('enregistré'))}/>;
        }
        return <FicheItem item={selection} onFermer={() => selectionner(null)}
                          onModifier={() => setEdition({mode: 'modifier'})}
                          onButins={() => setEdition({mode: 'butins'})}/>;
    };

    return <div className={styles.page}>
        <header className={styles.barre}>
            <div className={styles.titre}>
                <h1>Item Maker</h1>
                <p>{items.length} items · {items.reduce((n, i) => n + i.sources.length, 0)} sources · {items.reduce((n, i) => n + i.usages.length, 0)} usages</p>
            </div>

            <input type="search" className={styles.recherche} value={filtre.terme}
                   placeholder="Chercher un item, un monstre, une recette…"
                   onChange={(e) => setFiltre({...filtre, terme: e.target.value})}/>

            <div className={styles.bascule} role="tablist">
                <button type="button" role="tab" aria-selected={vue === 'catalogue'} className={vue === 'catalogue' ? styles.basculeActive : ''} onClick={() => setVue('catalogue')}>Catalogue</button>
                <button type="button" role="tab" aria-selected={vue === 'carte'} className={vue === 'carte' ? styles.basculeActive : ''} onClick={() => setVue('carte')}>Cartographie</button>
            </div>

            <div className={styles.creation}>
                <button type="button" className={styles.boutonPrincipal} onClick={() => setMenuCreation(!menuCreation)}>
                    <IconeAtlas nom="plus" taille={15}/> Créer un item
                </button>
                {menuCreation && <ul className={styles.menuCreation}>
                    {CREATIONS.map(c => <li key={c.cle}>
                        <button type="button" onClick={() => { setMenuCreation(false); setEdition({mode: 'creer', type: c.cle}); }}>
                            <IconeAtlas nom={c.icone} taille={15}/> {c.libelle}
                        </button>
                    </li>)}
                </ul>}
            </div>
        </header>

        <div className={styles.filtres}>
            {FAMILLES.map(f => (
                <button key={f.cle} type="button" className={filtre.famille === f.cle ? styles.filtreActif : styles.filtre}
                        onClick={() => setFiltre({...filtre, famille: f.cle})}>
                    {f.libelle} <small>{compte(f.cle)}</small>
                </button>
            ))}
            <select className={styles.filtreSelect} value={filtre.metierId} onChange={(e) => setFiltre({...filtre, metierId: e.target.value})} aria-label="Métier">
                <option value="">Tous les métiers</option>
                {referentiels.metiers.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
            <button type="button" className={filtre.aTraiter ? styles.filtreAlerteActif : styles.filtreAlerte}
                    onClick={() => setFiltre({...filtre, aTraiter: !filtre.aTraiter})}>
                <IconeAtlas nom="alerte" taille={13}/> À traiter <small>{aTraiter}</small>
            </button>
        </div>

        <div className={styles.espace}>
            <div className={styles.colonneVue}>
                {vue === 'carte'
                    ? <CartographieItems groupes={groupes} selectionCle={selectionCle} onSelect={selectionner}/>
                    : <div className={styles.catalogue}>
                        {groupes.length === 0 && <p className={styles.vide}>Aucun item ne correspond aux filtres.</p>}
                        {groupes.map(groupe => (
                            <section key={groupe.cle} className={styles.groupe}>
                                <h2>{groupe.titre} <small>{groupe.items.length}</small></h2>
                                <div className={styles.grille}>
                                    {groupe.items.map(item => {
                                        const image = imageItem(item);
                                        const alerte = item.alertes.find(a => a.code !== 'sans_image');
                                        const types = [...new Set(item.sources.map(s => s.type))];
                                        return <button key={item.cle} type="button"
                                                       className={`${styles.carteItem} ${item.cle === selectionCle ? styles.carteItemActive : ''} ${item.rarete ? styles['rarete_' + item.rarete] : ''}`}
                                                       onClick={() => selectionner(item.cle)} title={alerte?.message || item.nom}>
                                            <span className={styles.carteImage}>
                                                {image ? <img src={image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}/> : <IconeAtlas nom={ICONE_TYPE[item.type]} taille={22}/>}
                                                {alerte && <span className={styles.pastilleAlerte}/>}
                                            </span>
                                            <span className={styles.carteNom}>{item.nom}</span>
                                            <span className={styles.carteSous}>{sousTitre(item)}</span>
                                            <span className={styles.carteFlux}>
                                                {types.length === 0 && <span className={styles.fluxVide}>aucune source</span>}
                                                {types.map(t => <span key={t} style={{color: TYPES_SOURCE[t].couleur}} title={TYPES_SOURCE[t].libelle}><IconeAtlas nom={TYPES_SOURCE[t].icone} taille={12}/></span>)}
                                                {item.usages.length > 0 && <span className={styles.fluxUsage} title="Usages">→ {item.usages.length}</span>}
                                            </span>
                                        </button>;
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>}
            </div>
            {panneau()}
        </div>
    </div>;
};

export default ItemMakerPage;
