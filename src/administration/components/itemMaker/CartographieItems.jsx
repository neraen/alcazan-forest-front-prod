import React, {useMemo, useState} from 'react';
import styles from './ItemMaker.module.scss';
import IconeAtlas from "../monde/IconeAtlas";
import {ICONE_TYPE, TYPES_SOURCE, TYPES_USAGE, formatChance, imageItem} from "./itemModele";

/**
 * L'économie des items en trois colonnes : d'où ils viennent → les items → à quoi ils
 * servent. Une source ou un usage partagé par plusieurs items n'apparaît qu'une fois : c'est
 * ce qui fait voir qu'un monstre nourrit trois recettes, ou qu'une recette ne se nourrit de rien.
 *
 * Ordre des nœuds : les items suivent les groupes du catalogue, puis sources et usages sont
 * rangés par BARYCENTRE (position moyenne de leurs items) — l'heuristique classique qui
 * limite les croisements sans calcul coûteux — et posés À LA HAUTEUR de ce barycentre,
 * repoussés vers le bas seulement s'ils se chevauchent : une source reste en face de ses items.
 */

const LIGNE = 34;
const NOEUD_H = 26;
const COL_L = 205;
const ECART = 105;
const X_SOURCES = 0;
const X_ITEMS = COL_L + ECART;
const X_USAGES = (COL_L + ECART) * 2;
const LARGEUR = X_USAGES + COL_L;

const CartographieItems = ({groupes, selectionCle, onSelect}) => {
    const [survol, setSurvol] = useState(null);

    const modele = useMemo(() => {
        const items = groupes.flatMap(g => g.items);
        const rang = new Map(items.map((item, index) => [item.cle, index]));

        const noeuds = (champ, typesConnus) => {
            const parCle = new Map();
            items.forEach(item => item[champ].forEach(lien => {
                const cle = `${lien.type}:${lien.refId}`;
                if (!parCle.has(cle)) {
                    parCle.set(cle, {cle, type: lien.type, nom: lien.nom, lieu: lien.lieux?.[0]?.nom || null, items: [], liens: []});
                }
                const noeud = parCle.get(cle);
                if (!noeud.items.includes(item.cle)) noeud.items.push(item.cle);
                noeud.liens.push({item: item.cle, lien});
                if (!noeud.lieu && lien.lieux?.[0]) noeud.lieu = lien.lieux[0].nom;
            }));
            const liste = [...parCle.values()];
            liste.forEach(n => {
                n.barycentre = n.items.reduce((s, c) => s + rang.get(c), 0) / n.items.length;
                n.meta = typesConnus[n.type] || {libelle: n.type, icone: 'cible', couleur: 'var(--text-dim)'};
            });
            return liste.sort((a, b) => a.barycentre - b.barycentre || a.nom.localeCompare(b.nom));
        };

        const sources = noeuds('sources', TYPES_SOURCE);
        const usages = noeuds('usages', TYPES_USAGE);

        const y = new Map();
        items.forEach((item, i) => y.set(`i|${item.cle}`, 10 + i * LIGNE));
        const poser = (prefixe, liste) => {
            let plancher = 10;
            liste.forEach(n => {
                const voulu = 10 + n.barycentre * LIGNE;
                const pose = Math.max(voulu, plancher);
                y.set(`${prefixe}|${n.cle}`, pose);
                plancher = pose + LIGNE;
            });
            return plancher;
        };
        const basSources = poser('s', sources);
        const basUsages = poser('u', usages);
        const hauteur = Math.max(10 + items.length * LIGNE, basSources, basUsages) + 20;

        const aretes = [
            ...sources.flatMap(n => n.liens.map(({item, lien}) => ({
                id: `s|${n.cle}|${item}`, de: `s|${n.cle}`, vers: `i|${item}`, item, noeud: `s|${n.cle}`,
                couleur: n.meta.couleur, titre: `${n.nom} → ${lien.quantite > 1 ? lien.quantite + ' × ' : ''}${items[rang.get(item)].nom}${lien.chance !== null && lien.chance !== undefined ? ' · ' + formatChance(lien.chance) : ''}`,
            }))),
            ...usages.flatMap(n => n.liens.map(({item, lien}) => ({
                id: `u|${n.cle}|${item}`, de: `i|${item}`, vers: `u|${n.cle}`, item, noeud: `u|${n.cle}`,
                couleur: n.meta.couleur, titre: `${lien.quantite > 1 ? lien.quantite + ' × ' : ''}${items[rang.get(item)].nom} → ${n.nom}`,
            }))),
        ];

        return {items, sources, usages, hauteur, y, aretes};
    }, [groupes]);

    const {items, sources, usages, hauteur, y, aretes} = modele;

    // Ce que le survol (ou, à défaut, la sélection) met en lumière.
    const actif = survol || (selectionCle ? `i|${selectionCle}` : null);
    const allume = useMemo(() => {
        if (!actif) return null;
        const set = new Set([actif]);
        if (actif.startsWith('i|')) {
            aretes.filter(a => a.de === actif || a.vers === actif).forEach(a => { set.add(a.de); set.add(a.vers); });
        } else {
            // Source ou usage : ses items, et ce que ces items touchent de l'autre côté.
            const lies = aretes.filter(a => a.noeud === actif).map(a => `i|${a.item}`);
            lies.forEach(i => set.add(i));
        }
        return set;
    }, [actif, aretes]);

    const areteAllumee = (a) => !allume || (allume.has(a.de) && allume.has(a.vers)
        && (actif.startsWith('i|') ? (a.de === actif || a.vers === actif) : true));

    if (!items.length) {
        return <p className={styles.vide}>Aucun item ne correspond aux filtres.</p>;
    }

    const courbe = (a) => {
        const xa = a.de.startsWith('s|') ? X_SOURCES + COL_L : X_ITEMS + COL_L;
        const xb = a.vers.startsWith('u|') ? X_USAGES : X_ITEMS;
        const ya = y.get(a.de) + NOEUD_H / 2;
        const yb = y.get(a.vers) + NOEUD_H / 2;
        const m = (xa + xb) / 2;
        return `M${xa},${ya} C${m},${ya} ${m},${yb} ${xb},${yb}`;
    };

    const classeNoeud = (cle, base) => {
        const classes = [styles.noeud, base];
        if (allume && !allume.has(cle)) classes.push(styles.noeudEteint);
        if (allume && allume.has(cle)) classes.push(styles.noeudAllume);
        return classes.join(' ');
    };

    const noeudLien = (prefixe, n) => {
        const cle = `${prefixe}|${n.cle}`;
        return <div key={cle} className={classeNoeud(cle, prefixe === 's' ? styles.noeudSource : styles.noeudUsage)}
                    style={{top: y.get(cle), left: prefixe === 's' ? X_SOURCES : X_USAGES, width: COL_L, height: NOEUD_H, '--teinte': n.meta.couleur}}
                    onMouseEnter={() => setSurvol(cle)} onMouseLeave={() => setSurvol(null)}
                    title={`${n.meta.libelle} : ${n.nom}${n.lieu ? ' · ' + n.lieu : ''} — ${n.items.length} item${n.items.length > 1 ? 's' : ''}`}>
            <IconeAtlas nom={n.meta.icone} taille={14}/>
            <span className={styles.noeudNom}>{n.nom}</span>
            {n.lieu && <small>{n.lieu}</small>}
            {n.items.length > 1 && <em>{n.items.length}</em>}
        </div>;
    };

    return <div className={styles.cartographie}>
        <div className={styles.carteEntetes} style={{width: LARGEUR}}>
            <span style={{left: X_SOURCES, width: COL_L}}>D'où ça vient <small>{sources.length}</small></span>
            <span style={{left: X_ITEMS, width: COL_L}}>Items <small>{items.length}</small></span>
            <span style={{left: X_USAGES, width: COL_L}}>À quoi ça sert <small>{usages.length}</small></span>
        </div>
        <div className={styles.carteCorps} style={{width: LARGEUR, height: hauteur}}>
            <svg className={styles.carteLiens} width={LARGEUR} height={hauteur}>
                {aretes.map(a => {
                    const on = areteAllumee(a);
                    return <path key={a.id} d={courbe(a)} fill="none" stroke={a.couleur}
                                 strokeWidth={on && allume ? 2.6 : 1.4} opacity={on ? (allume ? 0.95 : 0.45) : 0.06}>
                        <title>{a.titre}</title>
                    </path>;
                })}
            </svg>

            {sources.map(n => noeudLien('s', n))}
            {usages.map(n => noeudLien('u', n))}

            {items.map(item => {
                const cle = `i|${item.cle}`;
                const image = imageItem(item);
                const alerte = item.alertes.find(a => a.code !== 'sans_image');
                const classes = classeNoeud(cle, styles.noeudItem) + (item.cle === selectionCle ? ' ' + styles.noeudSelection : '');
                return <button key={cle} type="button" className={classes}
                               style={{top: y.get(cle), left: X_ITEMS, width: COL_L, height: NOEUD_H}}
                               onMouseEnter={() => setSurvol(cle)} onMouseLeave={() => setSurvol(null)}
                               onClick={() => onSelect(item.cle)}
                               title={alerte ? alerte.message : item.nom}>
                    {!item.sources.length && <span className={styles.sansSource} title="Aucune source">∅</span>}
                    {image ? <img src={image} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}/> : <IconeAtlas nom={ICONE_TYPE[item.type]} taille={14}/>}
                    <span className={styles.noeudNom}>{item.nom}</span>
                    {alerte && <span className={styles.pastilleAlerte}/>}
                </button>;
            })}
        </div>
    </div>;
};

export default CartographieItems;
