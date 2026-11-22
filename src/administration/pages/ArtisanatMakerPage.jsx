import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useHistory, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import ArtisanatMakerApi from "../services/ArtisanatMakerApi";
import ItemMakerApi from "../services/ItemMakerApi";
import MetierForm from "../components/forms/ArtisanatMaker/MetierForm";
import RessourceForm from "../components/forms/ArtisanatMaker/RessourceForm";
import RecetteForm from "../components/forms/ArtisanatMaker/RecetteForm";
import IconeAtlas from "../components/monde/IconeAtlas";
import {DetailFabrication, DetailRecolte, GrilleMetiers, IconeMetier} from "../components/artisanat/VuesMetier";
import styles from "../components/artisanat/Artisanat.module.scss";

/**
 * ArtisanatMaker : les métiers en cartes ; un clic ouvre le métier.
 *
 * - métier de RÉCOLTE → ses ressources (une carte par objet, niveau, sources, prix) ;
 * - métier de FABRICATION → ses recettes (produit, composants en mini-icônes, niveau, temps).
 *
 * Les formulaires (métier, ressource, recette) sont les mêmes qu'avant, ouverts dans un
 * panneau latéral : leurs règles (ids stables, resynchronisation des maîtres, XP suggérée)
 * restent les leurs. Noms et images des items viennent du catalogue de l'Item Maker, indexé
 * par clé `type:id` — la liste de l'ArtisanatMaker ne connaît aucun chemin d'image.
 *
 * Le métier ouvert vit dans l'URL (`?metier=5`) : F5 et lien direct rouvrent la même fiche.
 */
const ArtisanatMakerPage = () => {
    const history = useHistory();
    const location = useLocation();
    const metierId = useMemo(() => Number(new URLSearchParams(location.search).get('metier')) || null, [location.search]);

    const [listes, setListes] = useState(null);
    const [referentiels, setReferentiels] = useState(null);
    const [config, setConfig] = useState(null);
    const [catalogue, setCatalogue] = useState(new Map());
    // null | {type: 'metier', id, famille} | {type: 'ressource', ressource} | {type: 'recette', id}
    const [panneau, setPanneau] = useState(null);

    const chargerCatalogue = useCallback(() => ItemMakerApi.catalogue()
        .then(donnees => setCatalogue(new Map(donnees.items.map(item => [item.cle, item]))))
        .catch(() => toast.error("Impossible de charger les images des items.")), []);

    const rafraichir = useCallback(async () => {
        const [liste, refs] = await Promise.all([ArtisanatMakerApi.list(), ArtisanatMakerApi.referentiels()]);
        setListes(liste);
        setReferentiels(refs);
        chargerCatalogue();
    }, [chargerCatalogue]);

    useEffect(() => {
        Promise.all([ArtisanatMakerApi.list(), ArtisanatMakerApi.referentiels(), ArtisanatMakerApi.config()])
            .then(([liste, refs, conf]) => {
                setListes(liste);
                setReferentiels(refs);
                setConfig(conf);
            })
            .catch(() => toast.error("Impossible de charger l'ArtisanatMaker."));
        chargerCatalogue();
    }, [chargerCatalogue]);

    // Changer de métier (clic, retour arrière, lien direct) ferme le panneau : un formulaire
    // de l'ancien métier resterait sinon ouvert à côté du nouveau.
    useEffect(() => { setPanneau(null); }, [metierId]);

    const ouvrirMetier = (id) => {
        setPanneau(null);
        history.push(id ? `/administration/artisanat?metier=${id}` : "/administration/artisanat");
    };

    const supprimerMetier = async (metier) => {
        if (!window.confirm(`Supprimer définitivement le métier « ${metier.nom} » ?`)) return;
        try {
            await ArtisanatMakerApi.deleteMetier(metier.id);
            toast.success("Métier supprimé.");
            await rafraichir();
            ouvrirMetier(null);
        } catch (error) {
            // Le serveur refuse tant que c'est référencé : son message dit quoi faire.
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    const supprimerRecette = async (id) => {
        if (!window.confirm("Supprimer définitivement cette recette ?")) return;
        try {
            await ArtisanatMakerApi.deleteRecette(id);
            toast.success("Recette supprimée.");
            setPanneau(null);
            await rafraichir();
        } catch (error) {
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if (!listes || !referentiels || !config) {
        return <p className={styles.chargement}>Chargement de l'artisanat…</p>;
    }

    const metier = metierId ? listes.metiers.find(m => m.id === metierId) : null;

    const contenuPanneau = () => {
        if (!panneau) return null;
        const fermer = () => setPanneau(null);
        let titre;
        let corps;
        switch (panneau.type) {
            case 'metier':
                titre = panneau.id ? "Modifier le métier" : "Nouveau métier";
                corps = <MetierForm metierId={panneau.id} referentiels={referentiels} config={config}
                                    familleParDefaut={panneau.famille || null}
                                    onSaved={async (sauve) => { await rafraichir(); setPanneau(null); if (!panneau.id) ouvrirMetier(sauve.id); }}/>;
                break;
            case 'ressource':
                titre = panneau.ressource.id ? `Modifier « ${panneau.ressource.nom} »` : "Nouvelle ressource";
                corps = <RessourceForm key={panneau.ressource.id || 'neuve'} ressource={panneau.ressource} referentiels={referentiels}
                                       onSaved={async () => { await rafraichir(); setPanneau(null); }}/>;
                break;
            default:
                titre = panneau.id ? "Modifier la recette" : "Nouvelle recette";
                corps = <>
                    <RecetteForm recetteId={panneau.id} referentiels={referentiels} config={config}
                                 metierParDefaut={metier?.id ?? null}
                                 onSaved={async (sauvee) => { await rafraichir(); setPanneau({type: 'recette', id: sauvee.id}); }}/>
                    {panneau.id && <button type="button" className={styles.boutonDanger} onClick={() => supprimerRecette(panneau.id)}>
                        Supprimer cette recette
                    </button>}
                </>;
        }
        return <aside className={styles.panneau}>
            <header className={styles.panneauEntete}>
                <h2>{titre}</h2>
                <button type="button" className={styles.boutonIcone} onClick={fermer} title="Fermer"><IconeAtlas nom="fermer" taille={16}/></button>
            </header>
            {corps}
        </aside>;
    };

    // Créer depuis la colonne « récolte » ou « fabrication » pré-choisit la famille.
    const creerMetier = (famille) => setPanneau({type: 'metier', id: null, famille});

    return <div className={`${styles.page} ${panneau ? styles.avecPanneau : ''}`}>
        <div className={styles.colonne}>
            {!metier ? <>
                <header className={styles.entete}>
                    <div>
                        <h1>Artisanat</h1>
                        <p>Les métiers, ce qu'ils récoltent et ce qu'ils fabriquent. Les points de récolte se posent dans
                            l'onglet Interactions, puis avec l'outil « Poser une interaction » du Map Maker.</p>
                    </div>
                </header>
                <GrilleMetiers metiers={listes.metiers} config={config} onOuvrir={ouvrirMetier} onCreer={creerMetier}/>
            </> : <>
                <button type="button" className={styles.retour} onClick={() => ouvrirMetier(null)}>← Tous les métiers</button>
                <header className={styles.ficheMetier}>
                    <IconeMetier metier={metier} taille={72}/>
                    <div className={styles.ficheMetierCorps}>
                        <h1>{metier.nom}</h1>
                        <p>
                            <span className={`${styles.chipFamille} ${styles['famille_' + metier.famille]}`}>
                                {config.familles.find(f => f.value === metier.famille)?.label || metier.famille}
                            </span>
                            <span>Niveau max {metier.niveauMax}</span>
                            <span>{metier.famille === 'recolte' ? `${metier.ressources} ressource(s)` : `${metier.recettes} recette(s)`}</span>
                        </p>
                        {metier.description && <p className={styles.description}>{metier.description}</p>}
                    </div>
                    <div className={styles.ficheActions}>
                        <button type="button" className={styles.bouton} onClick={() => setPanneau({type: 'metier', id: metier.id})}>
                            <IconeAtlas nom="crayon" taille={14}/> Modifier le métier
                        </button>
                        <button type="button" className={styles.boutonDanger} onClick={() => supprimerMetier(metier)}>Supprimer</button>
                    </div>
                </header>

                {metier.famille === 'recolte'
                    ? <DetailRecolte metier={metier} ressources={listes.ressources} catalogue={catalogue}
                                     selectionId={panneau?.type === 'ressource' ? panneau.ressource.id : null}
                                     onOuvrir={(ressource) => setPanneau({type: 'ressource', ressource})}
                                     onCreer={() => setPanneau({type: 'ressource', ressource: {id: 0, metierId: metier.id, niveauRessource: 1}})}/>
                    : <DetailFabrication metier={metier} recettes={listes.recettes} catalogue={catalogue}
                                         selectionId={panneau?.type === 'recette' ? panneau.id : null}
                                         onOuvrir={(id) => setPanneau({type: 'recette', id})}
                                         onCreer={() => setPanneau({type: 'recette', id: null})}/>}
            </>}
        </div>
        {contenuPanneau()}
    </div>;
};

export default ArtisanatMakerPage;
