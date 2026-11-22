import React from 'react';
import {Link} from "react-router-dom";
import styles from './ItemMaker.module.scss';
import IconeAtlas from "../monde/IconeAtlas";
import {ICONE_TYPE, LIBELLE_TYPE, TYPES_SOURCE, TYPES_USAGE, formatChance, frequence, imageItem, resumeBuff} from "./itemModele";

/** Une ligne « source » ou « usage », avec le lien vers l'outil qui l'édite. */
const Lien = ({lien, meta}) => (
    <li className={styles.lien} style={{'--teinte': meta.couleur}}>
        <span className={styles.lienIcone} title={meta.libelle}><IconeAtlas nom={meta.icone} taille={15}/></span>
        <div className={styles.lienCorps}>
            <div className={styles.lienTitre}>
                <Link to={meta.lien} className={styles.lienTexte}>{lien.nom}</Link>
                {lien.quantite > 1 && <span className={styles.chip}>× {lien.quantite}</span>}
                {lien.chance !== null && lien.chance !== undefined && <span className={styles.chipChance} title={frequence(lien.chance) || ''}>{formatChance(lien.chance)}</span>}
            </div>
            <small>{meta.libelle}{lien.detail ? ` · ${lien.detail}` : ''}</small>
            {lien.lieux?.length > 0 && <div className={styles.lieux}>
                {lien.lieux.slice(0, 4).map(l => (
                    <Link key={l.carteId} to={`/administration/world?carte=${l.carteId}`} className={styles.lieu} title="Voir sur l'atlas du monde">
                        <IconeAtlas nom="carte" taille={11}/> {l.nom}
                    </Link>
                ))}
                {lien.lieux.length > 4 && <span className={styles.lieu}>+{lien.lieux.length - 4}</span>}
            </div>}
            {lien.type === 'monstre' && !lien.lieux?.length && <small className={styles.attention}>Ce monstre n'est posé nulle part.</small>}
        </div>
    </li>
);

const FicheItem = ({item, onModifier, onButins, onFermer}) => {
    const image = imageItem(item);
    const c = item.consommable;

    return <aside className={styles.panneau}>
        <header className={styles.panneauEntete}>
            <div className={`${styles.grandeImage} ${item.rarete ? styles['rarete_' + item.rarete] : ''}`}>
                {image ? <img src={image} alt=""/> : <IconeAtlas nom={ICONE_TYPE[item.type]} taille={34}/>}
            </div>
            <div className={styles.panneauTitre}>
                <h2>{item.nom}</h2>
                <p>
                    <span className={styles.chip}><IconeAtlas nom={ICONE_TYPE[item.type]} taille={11}/> {LIBELLE_TYPE[item.type]}</span>
                    {item.metier && <span className={styles.chipMetier}>{item.metier.nom} · niv. {item.niveauRessource}</span>}
                    {item.rarete && <span className={`${styles.chip} ${styles['texteRarete_' + item.rarete]}`}>{item.rarete}</span>}
                    {item.position && <span className={styles.chip}>{item.position}</span>}
                </p>
                <small>#{item.id}</small>
            </div>
            <button type="button" className={styles.boutonIcone} onClick={onFermer} title="Fermer"><IconeAtlas nom="fermer" taille={16}/></button>
        </header>

        {item.description && <p className={styles.description}>{item.description}</p>}

        <dl className={styles.caracs}>
            {item.niveau !== null && <div><dt>Niveau</dt><dd>{item.niveau}</dd></div>}
            {c && <div><dt>Effet</dt><dd>{c.type === "buff"
                ? (c.buff ? `${c.buff.nom} : ${resumeBuff(c.buff)}` : "Aucun bonus choisi")
                : `+${c.points} ${c.type}`}</dd></div>}
            {c && <div><dt>Recharge</dt><dd>{c.cooldown} s</dd></div>}
            {item.prixAchat !== null && <div><dt>Achat</dt><dd>{item.prixAchat} po</dd></div>}
            <div><dt>Revente</dt><dd>{item.prixVente ? `${item.prixVente} po` : '—'}</dd></div>
        </dl>

        <div className={styles.actions}>
            <button type="button" className={styles.boutonPrincipal} onClick={onModifier}><IconeAtlas nom="crayon" taille={14}/> Modifier</button>
            {item.type === 'objet' && <button type="button" className={styles.bouton} onClick={onButins}>
                <IconeAtlas nom="monstre" taille={14}/> Butins de monstres {item.butins.length > 0 && <em>{item.butins.length}</em>}
            </button>}
        </div>

        {item.alertes.filter(a => a.code !== 'sans_image').map(a => (
            <p key={a.code} className={styles.alerte}><IconeAtlas nom="alerte" taille={14}/> {a.message}</p>
        ))}

        <section className={styles.section}>
            <h3>D'où vient-il ? <small>{item.sources.length}</small></h3>
            {item.sources.length === 0
                ? <p className={styles.vide}>Nulle part. Ajoutez-le au butin d'un monstre, à une récompense de quête, de récolte ou de boss, à une recette ou à l'étal d'un marchand.</p>
                : <ul className={styles.liens}>{item.sources.map((s, i) => <Lien key={i} lien={s} meta={TYPES_SOURCE[s.type]}/>)}</ul>}
        </section>

        <section className={styles.section}>
            <h3>À quoi sert-il ? <small>{item.usages.length}</small></h3>
            {item.type === 'equipement' && <p className={styles.aide}>Se porte en {item.position}.</p>}
            {item.type === 'consommable' && <p className={styles.aide}>Se consomme depuis la barre d'action.</p>}
            {item.usages.length === 0 && item.type === 'objet'
                ? <p className={styles.vide}>{item.prixVente ? `Seulement à revendre (${item.prixVente} po).` : "À rien pour l'instant."}</p>
                : <ul className={styles.liens}>{item.usages.map((u, i) => <Lien key={i} lien={u} meta={TYPES_USAGE[u.type]}/>)}</ul>}
        </section>
    </aside>;
};

export default FicheItem;
