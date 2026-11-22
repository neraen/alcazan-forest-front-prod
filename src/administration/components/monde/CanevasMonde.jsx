import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import styles from './MondeAtlas.module.scss';
import {fondCarte, imageCarte} from "../../../components/map/imageCarte";
import IconeAtlas, {iconeDeCarte} from "./IconeAtlas";
import {CONDITIONS, correspond, directionsLibres, grilleDeRegion} from "./atlasModele";

/**
 * Une région du monde posée sur sa grille : vignettes des cartes, frontières dessinées AUX
 * VRAIES POSITIONS des passages, portes vers les intérieurs, emplacements libres.
 *
 * Toute la géographie vient du serveur ; ce composant ne fait que la dessiner et gérer la
 * caméra (glisser pour se déplacer, molette pour zoomer).
 */

// Une case de jeu = 9 px : une carte 24×16 fait 216×144, au ratio exact du jeu.
const TUILE_L = 216;
const TUILE_H = 144;
const ECART = 52;
const PAS_X = TUILE_L + ECART;
const PAS_Y = TUILE_H + ECART;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2.5;

const origine = (carte) => ({x: (carte.x + 1) * PAS_X, y: (carte.y + 1) * PAS_Y});

/** Point d'un passage sur le bord (ou à l'intérieur) d'une vignette. */
function pointSurTuile(carte, caseX, caseY, bord) {
    const o = origine(carte);
    const fx = (caseX + 0.5) / (carte.largeur || 24);
    const fy = (caseY + 0.5) / (carte.hauteur || 16);
    switch (bord) {
        case 'est': return {x: o.x + TUILE_L, y: o.y + fy * TUILE_H};
        case 'ouest': return {x: o.x, y: o.y + fy * TUILE_H};
        case 'nord': return {x: o.x + fx * TUILE_L, y: o.y};
        case 'sud': return {x: o.x + fx * TUILE_L, y: o.y + TUILE_H};
        default: return {x: o.x + fx * TUILE_L, y: o.y + fy * TUILE_H};
    }
}

const OPPOSE = {nord: 'sud', sud: 'nord', est: 'ouest', ouest: 'est'};

const CanevasMonde = ({
    atlas, index, regionId, selectionId, onSelect, onProlonger,
    terme = "", options = {}, focus = null, compact = false,
}) => {
    const region = atlas.regions.find(r => r.id === regionId);
    const grille = useMemo(() => grilleDeRegion(atlas, regionId), [atlas, regionId]);
    const cartes = useMemo(() => [...grille.values()], [grille]);

    const viewport = useRef(null);
    const [vue, setVue] = useState({x: 0, y: 0, z: 0.6});
    const [survolId, setSurvolId] = useState(null);
    const glisse = useRef(null);
    const aGlisse = useRef(false);

    const largeurContenu = (region.largeur + 2) * PAS_X;
    const hauteurContenu = (region.hauteur + 2) * PAS_Y;

    const ajuster = useCallback(() => {
        const el = viewport.current;
        if (!el) return;
        const {width, height} = el.getBoundingClientRect();
        const z = Math.min(width / largeurContenu, height / hauteurContenu, 1.1);
        setVue({z, x: (width - largeurContenu * z) / 2, y: (height - hauteurContenu * z) / 2});
    }, [largeurContenu, hauteurContenu]);

    useLayoutEffect(() => { ajuster(); }, [ajuster]);

    // Centrer sur une carte demandée de l'extérieur (recherche, fiche, alerte).
    useEffect(() => {
        if (!focus) return;
        const carte = [...grille.values()].find(c => c.id === focus.id);
        const el = viewport.current;
        if (!carte || !el) return;
        const {width, height} = el.getBoundingClientRect();
        setVue(v => {
            const z = Math.max(v.z, 0.75);
            const o = origine(carte);
            return {z, x: width / 2 - (o.x + TUILE_L / 2) * z, y: height / 2 - (o.y + TUILE_H / 2) * z};
        });
    }, [focus, grille]);

    // Molette : listener natif non passif, sinon impossible d'empêcher le défilement de la page.
    useEffect(() => {
        const el = viewport.current;
        if (!el) return undefined;
        const surMolette = (event) => {
            event.preventDefault();
            const rect = el.getBoundingClientRect();
            const mx = event.clientX - rect.left;
            const my = event.clientY - rect.top;
            const facteur = Math.exp(-event.deltaY * 0.0015);
            setVue(v => {
                const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.z * facteur));
                return {z, x: mx - (mx - v.x) * (z / v.z), y: my - (my - v.y) * (z / v.z)};
            });
        };
        el.addEventListener('wheel', surMolette, {passive: false});
        return () => el.removeEventListener('wheel', surMolette);
    }, []);

    const zoomer = (facteur) => {
        const el = viewport.current;
        const {width, height} = el.getBoundingClientRect();
        setVue(v => {
            const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.z * facteur));
            return {z, x: width / 2 - (width / 2 - v.x) * (z / v.z), y: height / 2 - (height / 2 - v.y) * (z / v.z)};
        });
    };

    // Seuil au-delà duquel un appui devient un glisser : une main qui clique bouge toujours
    // un peu, et un clic avalé sur une carte se lit comme un bug.
    const SEUIL_GLISSER = 8;

    const debutGlisse = (event) => {
        if (event.button !== 0) return;
        glisse.current = {x: event.clientX, y: event.clientY, vx: vue.x, vy: vue.y};
        aGlisse.current = false;
    };
    const pendantGlisse = (event) => {
        const g = glisse.current;
        if (!g) return;
        const dx = event.clientX - g.x;
        const dy = event.clientY - g.y;
        if (!aGlisse.current && Math.hypot(dx, dy) < SEUIL_GLISSER) return;
        aGlisse.current = true;
        setVue(v => ({...v, x: g.vx + dx, y: g.vy + dy}));
    };
    const finGlisse = (event) => {
        const g = glisse.current;
        // Le verdict se rend au RELÂCHEMENT : un aller-retour de la souris n'est pas un glisser.
        if (g && event && Math.hypot(event.clientX - g.x, event.clientY - g.y) < SEUIL_GLISSER) {
            aGlisse.current = false;
        }
        glisse.current = null;
    };

    /** Un clic qui termine un glisser n'est pas un clic. */
    const siClic = (action) => (event) => {
        event.stopPropagation();
        if (!aGlisse.current) action();
    };

    const focusId = survolId ?? selectionId;
    const concerne = (p) => focusId === null || p.de === focusId || p.vers === focusId;

    // Frontières : une ligne par paire réciproque, aux positions réelles des passages.
    const liens = useMemo(() => {
        const traces = [];
        atlas.passages.forEach(p => {
            const de = index.cartes.get(p.de);
            const vers = p.vers !== null ? index.cartes.get(p.vers) : null;
            if (!de || de.regionId !== regionId || !vers || vers.regionId !== regionId) return;
            if (p.retourId !== null && p.retourId < p.id) return; // dessiné par l'autre sens
            const bord = p.nature === 'bord' ? p.direction : null;
            const a = pointSurTuile(de, p.x, p.y, bord);
            const b = pointSurTuile(vers, p.versX, p.versY, bord ? OPPOSE[bord] : null);
            const retour = p.retourId !== null ? index.passages.get(p.retourId) : null;
            traces.push({p, a, b, condition: p.condition || retour?.condition || null});
        });
        return traces;
    }, [atlas, index, regionId]);

    const portes = useMemo(() => atlas.passages.filter(p => {
        const de = index.cartes.get(p.de);
        if (!de || de.regionId !== regionId) return false;
        const vers = p.vers !== null ? index.cartes.get(p.vers) : null;
        // Les portes ENTRE deux cartes de la grille sont déjà des liens dessinés.
        return p.nature !== 'bord' && !(vers && vers.regionId === regionId);
    }), [atlas, index, regionId]);

    const fantomes = useMemo(() => {
        if (!onProlonger) return [];
        const sources = options.extensions ? cartes : cartes.filter(c => c.id === focusId);
        const vus = new Set();
        const liste = [];
        sources.forEach(carte => directionsLibres(carte, index, grille).forEach(direction => {
            const cle = `${carte.x + direction.dx},${carte.y + direction.dy}`;
            if (vus.has(cle)) return;
            vus.add(cle);
            liste.push({carte, direction, x: carte.x + direction.dx, y: carte.y + direction.dy});
        }));
        return liste;
    }, [cartes, index, grille, focusId, options.extensions, onProlonger]);

    const couleurLien = (trace) => {
        if (trace.p.etat === 'conflit' || trace.p.etat === 'casse') return 'var(--danger)';
        if (trace.p.etat === 'sens_unique') return 'var(--pa-label)';
        if (trace.condition) return 'var(--mp-label)';
        return 'var(--gold)';
    };

    const cheminLien = ({a, b, p}) => {
        const adjacent = Math.abs(a.x - b.x) <= ECART + 2 || Math.abs(a.y - b.y) <= ECART + 2;
        if (p.nature === 'bord' && adjacent && p.etat !== 'conflit') {
            return `M${a.x},${a.y} L${b.x},${b.y}`;
        }
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 60;
        return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    };

    return <div className={`${styles.canevas} ${compact ? styles.canevasCompact : ""}`}
                ref={viewport}
                onPointerDown={debutGlisse} onPointerMove={pendantGlisse}
                onPointerUp={finGlisse} onPointerLeave={finGlisse}
                onClick={() => { if (!aGlisse.current) onSelect(null); }}>

        <div className={styles.contenu}
             style={{width: largeurContenu, height: hauteurContenu,
                 transform: `translate(${vue.x}px, ${vue.y}px) scale(${vue.z})`}}>

            {fantomes.map(f => {
                const o = origine(f);
                return <button key={`f-${f.x},${f.y}`} type="button"
                               className={styles.fantome}
                               style={{left: o.x, top: o.y, width: TUILE_L, height: TUILE_H}}
                               onClick={siClic(() => onProlonger(f.carte, f.direction))}
                               onPointerEnter={() => setSurvolId(f.carte.id)}
                               onPointerLeave={() => setSurvolId(null)}
                               title={`Créer une carte ${f.direction.locatif} de « ${f.carte.nom} »`}>
                    <IconeAtlas nom="plus" taille={28}/>
                    <span>Nouvelle carte</span>
                    <small>{f.direction.fleche} {f.direction.libelle} de {f.carte.nom}</small>
                </button>;
            })}

            {cartes.map(carte => {
                const o = origine(carte);
                const image = imageCarte(carte.id);
                const alertes = index.alertesParCarte.get(carte.id) || [];
                const enfants = index.enfants.get(carte.id) || [];
                const classes = [styles.tuile];
                if (carte.id === selectionId) classes.push(styles.tuileSelection);
                if (terme && !correspond(carte, terme)) classes.push(styles.tuileEteinte);
                if (terme && correspond(carte, terme)) classes.push(styles.tuileTrouvee);
                if (focusId !== null && carte.id !== focusId && !liens.some(t => concerne(t.p) && (t.p.de === carte.id || t.p.vers === carte.id))) {
                    classes.push(styles.tuileReculee);
                }
                return <div key={carte.id} className={classes.join(" ")}
                            style={{left: o.x, top: o.y, width: TUILE_L, height: TUILE_H,
                                backgroundImage: fondCarte(carte.id)}}
                            onClick={siClic(() => onSelect(carte.id))}
                            onPointerEnter={() => setSurvolId(carte.id)}
                            onPointerLeave={() => setSurvolId(null)}>
                    {!image && <div className={styles.sansFond}>
                        <IconeAtlas nom="image" taille={26}/>
                        <span>Fond à peindre</span>
                    </div>}

                    <div className={styles.tuileBadges}>
                        {carte.spawn && <span className={styles.badgeOr} title="Point d'apparition des nouveaux joueurs"><IconeAtlas nom="etoile" taille={12}/></span>}
                        {alertes.length > 0 && <span className={styles.badgeAlerte} title={alertes.map(a => a.message).join("\n")}><IconeAtlas nom="alerte" taille={12}/></span>}
                        {options.contenu && carte.compteurs.pnj > 0 && <span className={styles.badge} title="PNJ"><IconeAtlas nom="pnj" taille={11}/>{carte.compteurs.pnj}</span>}
                        {options.contenu && carte.compteurs.monstres > 0 && <span className={styles.badge} title="Cases de monstres"><IconeAtlas nom="monstre" taille={11}/>{carte.compteurs.monstres}</span>}
                        {options.contenu && carte.compteurs.interactions > 0 && <span className={styles.badge} title="Interactions"><IconeAtlas nom="interaction" taille={11}/>{carte.compteurs.interactions}</span>}
                        {options.contenu && carte.compteurs.joueurs > 0 && <span className={styles.badgeJoueurs} title="Joueurs présents"><IconeAtlas nom="joueurs" taille={11}/>{carte.compteurs.joueurs}</span>}
                    </div>

                    {portes.filter(p => p.de === carte.id).map(p => {
                        const vers = p.vers !== null ? index.cartes.get(p.vers) : null;
                        const left = (p.x + 0.5) / (carte.largeur || 24) * TUILE_L;
                        const top = (p.y + 0.5) / (carte.hauteur || 16) * TUILE_H;
                        const casse = p.etat === 'casse';
                        return <button key={p.id} type="button"
                                       className={`${styles.porte} ${casse ? styles.porteCassee : ""} ${vers?.donjonId !== null && vers ? styles.porteDonjon : ""}`}
                                       style={{left, top}}
                                       title={casse ? `Passage cassé (${p.x}, ${p.y})` : `(${p.x}, ${p.y}) → ${vers.nom}${p.condition ? ` · ${p.condition.libelle}` : ""}${p.etat === 'sens_unique' ? " · aller simple" : ""}`}
                                       onClick={siClic(() => vers && onSelect(vers.id))}>
                            <IconeAtlas nom={iconeDeCarte(vers)} taille={11}/>
                        </button>;
                    })}

                    {options.noms !== false && <div className={styles.tuileNom}>
                        <span>{carte.nom}</span>
                        {enfants.length > 0 && <small>{enfants.length} lieu{enfants.length > 1 ? "x" : ""} à l'intérieur</small>}
                    </div>}
                </div>;
            })}

            <svg className={styles.liens} width={largeurContenu} height={hauteurContenu}>
                <defs>
                    <marker id={`fleche-${regionId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M0,0 L10,5 L0,10 z" fill="var(--pa-label)"/>
                    </marker>
                </defs>
                {liens.map(trace => {
                    const actif = concerne(trace.p);
                    const couleur = couleurLien(trace);
                    const pointille = trace.p.etat !== 'ok' || trace.p.nature !== 'bord';
                    return <g key={trace.p.id} opacity={actif ? 1 : 0.25}>
                        <path d={cheminLien(trace)} stroke="rgba(0,0,0,.55)" strokeWidth={actif && focusId !== null ? 9 : 7} fill="none" strokeLinecap="round"/>
                        <path d={cheminLien(trace)} stroke={couleur} strokeWidth={actif && focusId !== null ? 5 : 3.5} fill="none" strokeLinecap="round"
                              strokeDasharray={pointille ? "7 6" : undefined}
                              markerEnd={trace.p.etat === 'sens_unique' ? `url(#fleche-${regionId})` : undefined}/>
                        <circle cx={trace.a.x} cy={trace.a.y} r={4} fill={couleur}/>
                        <circle cx={trace.b.x} cy={trace.b.y} r={4} fill={couleur}/>
                    </g>;
                })}
            </svg>

            {options.conditions !== false && liens.filter(t => t.condition).map(trace => (
                <span key={`c-${trace.p.id}`} className={styles.condition}
                      style={{left: (trace.a.x + trace.b.x) / 2, top: (trace.a.y + trace.b.y) / 2}}
                      title={trace.condition.libelle}>
                    <IconeAtlas nom="cadenas" taille={11}/>
                    {trace.condition.type === 'level' ? `Niv. ${trace.condition.valeur}` : (CONDITIONS[trace.condition.type] || trace.condition.type)}
                </span>
            ))}
        </div>

        <div className={styles.camera} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => zoomer(1.25)} title="Zoomer"><IconeAtlas nom="plus" taille={15}/></button>
            <span>{Math.round(vue.z * 100)} %</span>
            <button type="button" onClick={() => zoomer(0.8)} title="Dézoomer"><IconeAtlas nom="moins" taille={15}/></button>
            <button type="button" onClick={ajuster} title="Tout voir"><IconeAtlas nom="recentrer" taille={15}/></button>
        </div>
    </div>;
};

export default CanevasMonde;
