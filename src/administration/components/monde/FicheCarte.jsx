import React, {useState} from 'react';
import {Link} from "react-router-dom";
import styles from './MondeAtlas.module.scss';
import {fondCarte, imageCarte} from "../../../components/map/imageCarte";
import IconeAtlas, {iconeDeCarte} from "./IconeAtlas";
import {DIRECTIONS, ETATS_PASSAGE, TYPES_CARTE, directionsLibres, grilleDeRegion} from "./atlasModele";

const FLECHE = Object.fromEntries(DIRECTIONS.map(d => [d.cle, d.fleche]));

/** Vignette cliquable d'une carte hors grille (intérieur, salle, lieu spécial). */
export const Vignette = ({carte, onSelect, sousTitre, active = false}) => (
    <button type="button" className={`${styles.vignette} ${active ? styles.vignetteActive : ""}`}
            onClick={() => onSelect(carte.id)} title={carte.nom}>
        <span className={styles.vignetteImage} style={{backgroundImage: fondCarte(carte.id)}}>
            {!imageCarte(carte.id) && <IconeAtlas nom="image" taille={18}/>}
        </span>
        <span className={styles.vignetteNom}>{carte.nom}</span>
        {sousTitre && <span className={styles.vignetteSous}>{sousTitre}</span>}
    </button>
);

/**
 * Fiche d'une carte : son image avec ses passages pointés, où ils mènent, ce qu'elle
 * contient, et comment la prolonger.
 */
const FicheCarte = ({carte, atlas, index, onSelect, onProlonger, onCentrer, onFermer}) => {
    const [survol, setSurvol] = useState(null);

    const sortants = index.sortants.get(carte.id) || [];
    const arriveesSimples = (index.entrants.get(carte.id) || [])
        .filter(p => p.de !== carte.id && p.retourId === null && p.etat !== 'casse');
    const enfants = index.enfants.get(carte.id) || [];
    const alertes = index.alertesParCarte.get(carte.id) || [];
    const libres = directionsLibres(carte, index, grilleDeRegion(atlas, carte.regionId));
    const donjon = carte.donjonId !== null ? index.donjons.get(carte.donjonId) : null;
    const salle = donjon?.salles.find(s => s.carteId === carte.id);
    const parent = carte.parentId !== null ? index.cartes.get(carte.parentId) : null;
    const c = carte.compteurs;

    const pct = (v, total) => `${(v + 0.5) / total * 100}%`;

    return <aside className={styles.fiche}>
        <header className={styles.ficheEntete}>
            <div>
                <h2>{carte.nom}</h2>
                <p>
                    #{carte.id} · {TYPES_CARTE[carte.type]}
                    {parent && <> · dans <button type="button" className={styles.lienTexte} onClick={() => onSelect(parent.id)}>{parent.nom}</button></>}
                </p>
            </div>
            <button type="button" className={styles.boutonIcone} onClick={onFermer} title="Fermer la fiche">
                <IconeAtlas nom="fermer" taille={16}/>
            </button>
        </header>

        <div className={styles.apercu} style={{backgroundImage: fondCarte(carte.id)}}>
            {!imageCarte(carte.id) && <div className={styles.sansFond}><IconeAtlas nom="image" taille={30}/><span>Fond à peindre : <code>src/img/map/{carte.id}.png</code></span></div>}
            {carte.pnj.map(p => (
                <span key={`pnj-${p.id}-${p.x}-${p.y}`} className={styles.pointPnj}
                      style={{left: pct(p.x, carte.largeur), top: pct(p.y, carte.hauteur)}} title={p.nom}/>
            ))}
            {sortants.map(p => (
                <span key={p.id}
                      className={`${styles.pointPassage} ${survol === p.id ? styles.pointPassageActif : ""} ${p.etat !== 'ok' ? styles.pointPassageAlerte : ""}`}
                      style={{left: pct(p.x, carte.largeur), top: pct(p.y, carte.hauteur)}}
                      onMouseEnter={() => setSurvol(p.id)} onMouseLeave={() => setSurvol(null)}/>
            ))}
        </div>

        <div className={styles.ficheActions}>
            <Link className={styles.boutonPrincipal} to={`/administration/mapmaker?carte=${carte.id}`}>
                <IconeAtlas nom="crayon" taille={15}/> Éditer dans le MapMaker
            </Link>
            {carte.regionId !== null && <button type="button" className={styles.bouton} onClick={() => onCentrer(carte.id)}>
                <IconeAtlas nom="cible" taille={15}/> Centrer
            </button>}
        </div>

        <div className={styles.flags}>
            {carte.spawn && <span className={styles.chipOr}><IconeAtlas nom="etoile" taille={12}/> Apparition</span>}
            {carte.cimetiere && <span className={styles.chip}><IconeAtlas nom="cimetiere" taille={12}/> Cimetière</span>}
            {carte.auberge && <span className={styles.chip}><IconeAtlas nom="auberge" taille={12}/> Auberge</span>}
            {carte.instance && <span className={styles.chip}>Instance</span>}
            {donjon && <span className={styles.chipDonjon}><IconeAtlas nom="donjon" taille={12}/> {donjon.nom} · salle {salle?.ordre} ({salle?.type})</span>}
        </div>

        <dl className={styles.compteurs}>
            <div><dt>PNJ</dt><dd>{c.pnj}</dd></div>
            <div><dt>Monstres</dt><dd>{c.monstres}</dd></div>
            <div><dt>Interactions</dt><dd>{c.interactions}</dd></div>
            <div><dt>Joueurs</dt><dd>{c.joueurs}</dd></div>
            <div><dt>Obstacles</dt><dd>{c.cases ? Math.round(c.bloquees / c.cases * 100) : 0} %</dd></div>
        </dl>

        {alertes.length > 0 && <section className={styles.section}>
            <h3>Points d'attention</h3>
            {alertes.map((a, i) => <p key={i} className={`${styles.alerte} ${styles['alerte_' + a.niveau]}`}>{a.message}</p>)}
        </section>}

        <section className={styles.section}>
            <h3>Passages <small>{sortants.length}</small></h3>
            {sortants.length === 0 && <p className={styles.vide}>Aucun passage : personne ne peut quitter cette carte.</p>}
            <ul className={styles.listePassages}>
                {sortants.map(p => {
                    const vers = p.vers !== null ? index.cartes.get(p.vers) : null;
                    return <li key={p.id}
                               className={survol === p.id ? styles.passageActif : ""}
                               onMouseEnter={() => setSurvol(p.id)} onMouseLeave={() => setSurvol(null)}>
                        <span className={styles.passageSens} title={p.nature === 'bord' ? `Frontière ${p.direction}` : "Porte"}>
                            {p.nature === 'bord' ? FLECHE[p.direction] : <IconeAtlas nom={iconeDeCarte(vers)} taille={14}/>}
                        </span>
                        <span className={styles.passageCorps}>
                            {vers
                                ? <button type="button" className={styles.lienTexte} onClick={() => onSelect(vers.id)}>{vers.nom}</button>
                                : <em>Destination introuvable</em>}
                            <small>({p.x}, {p.y}) → {p.versX !== null ? `(${p.versX}, ${p.versY})` : "?"}</small>
                        </span>
                        <span className={styles.passageChips}>
                            {p.condition && <span className={styles.chipCondition} title={p.condition.libelle}><IconeAtlas nom="cadenas" taille={11}/> {p.condition.libelle}</span>}
                            {ETATS_PASSAGE[p.etat] && <span className={`${styles.chipEtat} ${styles['etat_' + p.etat]}`}>{ETATS_PASSAGE[p.etat]}</span>}
                        </span>
                    </li>;
                })}
            </ul>
        </section>

        {arriveesSimples.length > 0 && <section className={styles.section}>
            <h3>Arrivées sans retour</h3>
            <ul className={styles.listePassages}>
                {arriveesSimples.map(p => {
                    const de = index.cartes.get(p.de);
                    return <li key={p.id}>
                        <span className={styles.passageSens}>↘</span>
                        <span className={styles.passageCorps}>
                            <button type="button" className={styles.lienTexte} onClick={() => onSelect(de.id)}>{de.nom}</button>
                            <small>arrive en ({p.versX}, {p.versY})</small>
                        </span>
                    </li>;
                })}
            </ul>
        </section>}

        {enfants.length > 0 && <section className={styles.section}>
            <h3>À l'intérieur <small>{enfants.length}</small></h3>
            <div className={styles.vignettes}>
                {enfants.map(e => <Vignette key={e.id} carte={e} onSelect={onSelect}/>)}
            </div>
        </section>}

        {libres.length > 0 && <section className={styles.section}>
            <h3>Agrandir le monde</h3>
            <p className={styles.aide}>Crée une carte vierge collée à celle-ci, reliée par un passage au milieu de la frontière.</p>
            <div className={styles.rose}>
                {DIRECTIONS.map(d => {
                    const libre = libres.some(l => l.cle === d.cle);
                    return <button key={d.cle} type="button" disabled={!libre}
                                   className={`${styles.roseBouton} ${styles['rose_' + d.cle]}`}
                                   onClick={() => onProlonger(carte, d)}
                                   title={libre ? `Nouvelle carte ${d.locatif}` : `Déjà relié ${d.locatif}`}>
                        {libre && <IconeAtlas nom="plus" taille={13}/>} {d.libelle}
                    </button>;
                })}
                <span className={styles.roseCentre} style={{backgroundImage: fondCarte(carte.id)}}/>
            </div>
        </section>}

        {carte.pnj.length > 0 && <section className={styles.section}>
            <h3>PNJ</h3>
            <ul className={styles.listeSimple}>
                {carte.pnj.map(p => <li key={`${p.id}-${p.x}-${p.y}`}><IconeAtlas nom="pnj" taille={13}/> {p.nom} <small>{p.type} · ({p.x}, {p.y})</small></li>)}
            </ul>
        </section>}

        {carte.monstres.length > 0 && <section className={styles.section}>
            <h3>Monstres</h3>
            <ul className={styles.listeSimple}>
                {carte.monstres.map(m => <li key={m.id}><IconeAtlas nom="monstre" taille={13}/> {m.nom} <small>{m.cases} case{m.cases > 1 ? "s" : ""}</small></li>)}
            </ul>
        </section>}
    </aside>;
};

export default FicheCarte;
