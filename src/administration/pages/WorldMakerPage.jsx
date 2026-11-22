import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import MondeApi from "../services/MondeApi";
import CanevasMonde from "../components/monde/CanevasMonde";
import FicheCarte from "../components/monde/FicheCarte";
import ProlongerCarte from "../components/monde/ProlongerCarte";
import HorsMonde from "../components/monde/HorsMonde";
import IconeAtlas from "../components/monde/IconeAtlas";
import {correspond, indexer, TYPES_CARTE} from "../components/monde/atlasModele";
import styles from "../components/monde/MondeAtlas.module.scss";

/**
 * Onglet « Monde » : l'atlas du jeu, DÉDUIT des passages (wraps) — rien n'est stocké.
 *
 * Une frontière (passage de bord vers le bord opposé) place les cartes côte à côte ; une
 * porte (passage intérieur) range sa destination parmi les intérieurs ; les donjons sont
 * des instances hors du monde, présentés à part salle par salle. Cf. doc §24.
 */
const WorldMakerPage = () => {
    const history = useHistory();
    const location = useLocation();
    const selectionId = useMemo(() => {
        const valeur = new URLSearchParams(location.search).get('carte');
        return valeur ? Number(valeur) : null;
    }, [location.search]);

    const [atlas, setAtlas] = useState(null);
    const [prolonger, setProlonger] = useState(null);
    const [terme, setTerme] = useState("");
    const [focus, setFocus] = useState(null);
    const [options, setOptions] = useState({noms: true, conditions: true, contenu: true, extensions: false});

    const charger = useCallback(() => MondeApi.atlas()
        .then(setAtlas)
        .catch(() => toast.error("Impossible de charger l'atlas du monde.")), []);

    useEffect(() => { charger(); }, [charger]);

    const index = useMemo(() => atlas && indexer(atlas), [atlas]);

    // Arrivée par un lien `?carte=` (retour du MapMaker, F5) : la caméra va droit dessus.
    const dejaCentre = useRef(false);
    useEffect(() => {
        if (!index || dejaCentre.current) return;
        dejaCentre.current = true;
        const carte = selectionId !== null ? index.cartes.get(selectionId) : null;
        if (carte && carte.regionId !== null) setFocus({id: carte.id, nonce: Date.now()});
    }, [index, selectionId]);

    const selectionner = useCallback((carteId) => {
        setProlonger(null);
        history.replace(carteId ? `/administration/world?carte=${carteId}` : "/administration/world");
    }, [history]);

    const centrer = (carteId) => setFocus({id: carteId, nonce: Date.now()});

    const choisirResultat = (carte) => {
        setTerme("");
        selectionner(carte.id);
        if (carte.regionId !== null) centrer(carte.id);
    };

    const creer = async (nom) => {
        const {source, direction} = prolonger;
        const reponse = await MondeApi.prolonger(source.id, direction.cle, nom);
        toast.success(`« ${nom} » créée ${direction.locatif} de « ${source.nom} ».`);
        await charger();
        selectionner(reponse.carteId);
        centrer(reponse.carteId);
    };

    if (!atlas || !index) {
        return <p className={styles.chargement}>Lecture des passages du monde…</p>;
    }

    const principale = atlas.regions.find(r => r.principale);
    const selection = selectionId !== null ? index.cartes.get(selectionId) : null;
    const resultats = terme ? atlas.cartes.filter(c => correspond(c, terme)).slice(0, 8) : [];
    const surGrille = atlas.cartes.filter(c => c.type === 'monde').length;
    const erreurs = atlas.alertes.filter(a => a.niveau === 'erreur').length;
    const basculer = (cle) => setOptions(o => ({...o, [cle]: !o[cle]}));

    return <div className={styles.page}>
        <header className={styles.barre}>
            <div className={styles.titre}>
                <h1>Atlas du monde</h1>
                <p>{surGrille} cartes dans le monde · {atlas.cartes.length - surGrille} hors du monde · {atlas.passages.length} passages</p>
            </div>

            <div className={styles.recherche}>
                <input type="search" value={terme} placeholder="Chercher une carte (nom ou #id)"
                       onChange={(e) => setTerme(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter' && resultats[0]) choisirResultat(resultats[0]); }}/>
                {resultats.length > 0 && <ul className={styles.resultats}>
                    {resultats.map(c => <li key={c.id}>
                        <button type="button" onClick={() => choisirResultat(c)}>
                            {c.nom} <small>#{c.id} · {TYPES_CARTE[c.type]}</small>
                        </button>
                    </li>)}
                </ul>}
            </div>

            <div className={styles.options}>
                {[['noms', 'Noms'], ['conditions', 'Conditions'], ['contenu', 'Contenu'], ['extensions', 'Toutes les extensions']].map(([cle, libelle]) => (
                    <label key={cle} className={options[cle] ? styles.optionActive : ""}>
                        <input type="checkbox" checked={options[cle]} onChange={() => basculer(cle)}/> {libelle}
                    </label>
                ))}
            </div>
        </header>

        <div className={styles.espace}>
            <div className={styles.colonneCanevas}>
                {principale
                    ? <CanevasMonde atlas={atlas} index={index} regionId={principale.id}
                                    selectionId={selectionId} onSelect={selectionner}
                                    onProlonger={(source, direction) => setProlonger({source, direction})}
                                    terme={terme} options={options} focus={focus}/>
                    : <p className={styles.vide}>Aucune frontière entre deux cartes : le monde n'a pas encore de géographie.</p>}
                <ul className={styles.legende}>
                    <li><i className={styles.legendeOk}/> Frontière</li>
                    <li><i className={styles.legendeCondition}/> Sous condition</li>
                    <li><i className={styles.legendeSensUnique}/> Aller simple</li>
                    <li><i className={styles.legendeConflit}/> Contradiction</li>
                    <li><span className={styles.legendePorte}><IconeAtlas nom="porte" taille={10}/></span> Porte</li>
                    <li><span className={`${styles.legendePorte} ${styles.porteDonjon}`}><IconeAtlas nom="donjon" taille={10}/></span> Donjon</li>
                </ul>
            </div>

            {prolonger
                ? <ProlongerCarte source={prolonger.source} direction={prolonger.direction}
                                  onValider={creer} onAnnuler={() => setProlonger(null)}/>
                : selection
                    ? <FicheCarte carte={selection} atlas={atlas} index={index}
                                  onSelect={selectionner} onCentrer={centrer}
                                  onProlonger={(source, direction) => setProlonger({source, direction})}
                                  onFermer={() => selectionner(null)}/>
                    : <aside className={styles.fiche}>
                        <header className={styles.ficheEntete}><div><h2>Vue d'ensemble</h2><p>Cliquez une carte pour l'ouvrir</p></div></header>
                        <ul className={styles.astuces}>
                            <li>Glisser pour se déplacer, molette pour zoomer.</li>
                            <li>Survoler une carte fait ressortir ses liens ; un <IconeAtlas nom="plus" taille={12}/> apparaît là où on peut l'agrandir.</li>
                            <li>Les petites pastilles sur une carte sont ses portes : un clic ouvre l'intérieur.</li>
                            <li>Tout est déduit des passages en base : relier deux cartes dans le MapMaker les rapproche ici.</li>
                        </ul>
                        <section className={styles.section}>
                            <h3>Points d'attention <small>{atlas.alertes.length}{erreurs ? ` · ${erreurs} erreur${erreurs > 1 ? "s" : ""}` : ""}</small></h3>
                            {atlas.alertes.length === 0 && <p className={styles.vide}>Rien à signaler : chaque passage a son retour.</p>}
                            {atlas.alertes.map((a, i) => (
                                <button key={i} type="button" className={`${styles.alerte} ${styles['alerte_' + a.niveau]}`}
                                        onClick={() => { if (a.carteId) { selectionner(a.carteId); centrer(a.carteId); } }}>
                                    {a.message}
                                </button>
                            ))}
                        </section>
                    </aside>}
        </div>

        <HorsMonde atlas={atlas} index={index} selectionId={selectionId}
                   onSelect={(id) => { selectionner(id); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                   terme={terme} options={options}/>
    </div>;
};

export default WorldMakerPage;
