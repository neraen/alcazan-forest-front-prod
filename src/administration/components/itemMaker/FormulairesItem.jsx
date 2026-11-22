import React, {useState} from 'react';
import styles from './ItemMaker.module.scss';
import IconeAtlas from "../monde/IconeAtlas";
import ImageUploadField from "../forms/imageUpload/ImageUploadField";
import {descriptionDepuisBuff, formatDuree, frequence, resumeBuff} from "./itemModele";

/**
 * Formulaires de l'Item Maker. Le serveur fait foi : il revalide tout et renvoie un
 * `{message}` affiché tel quel. `onSubmit` reçoit TOUJOURS l'event (cf. CLAUDE.md : une touche
 * Entrée ne doit jamais déclencher le GET natif du formulaire).
 */

const message = (e) => e?.response?.data?.message || e?.response?.data?.detail
    || e?.response?.data?.violations?.[0]?.title || "L'enregistrement a échoué.";

const Cadre = ({titre, sousTitre, onAnnuler, children}) => (
    <aside className={styles.panneau}>
        <header className={styles.panneauEntete}>
            <div className={styles.panneauTitre}>
                <h2>{titre}</h2>
                {sousTitre && <p>{sousTitre}</p>}
            </div>
            <button type="button" className={styles.boutonIcone} onClick={onAnnuler} title="Fermer"><IconeAtlas nom="fermer" taille={16}/></button>
        </header>
        {children}
    </aside>
);

const Pied = ({envoi, erreur, onAnnuler, libelle = "Enregistrer"}) => <>
    {erreur && <p className={styles.erreur}>{erreur}</p>}
    <div className={styles.actions}>
        <button type="submit" className={styles.boutonPrincipal} disabled={envoi}>{envoi ? "Enregistrement…" : libelle}</button>
        <button type="button" className={styles.bouton} onClick={onAnnuler}>Annuler</button>
    </div>
</>;

function useEnvoi(onEnregistrer) {
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const soumettre = (construire) => async (event) => {
        event.preventDefault();
        setEnvoi(true);
        setErreur("");
        try {
            await onEnregistrer(construire());
        } catch (e) {
            setErreur(message(e));
        } finally {
            setEnvoi(false);
        }
    };
    return {envoi, erreur, soumettre};
}

/* ------------------------------------------------------------------ objet */

export const ObjetForm = ({item, referentiels, onEnregistrer, onAnnuler, ressource = false}) => {
    const [f, setF] = useState(() => ({
        nom: item?.nom || "",
        description: item?.description || "",
        image: item?.image || "",
        imageCarte: item?.imageCarte || "",
        prixVente: item?.prixVente ?? "",
        metierId: item?.metier?.id || (ressource ? referentiels.metiers.find(m => m.famille === 'recolte')?.id || "" : ""),
        niveauRessource: item?.niveauRessource ?? 1,
    }));
    const {envoi, erreur, soumettre} = useEnvoi(onEnregistrer);
    const champ = (cle) => (e) => setF({...f, [cle]: e.target.value});

    return <Cadre titre={item ? `Modifier « ${item.nom} »` : (ressource ? "Nouvelle ressource de métier" : "Nouvel objet")}
                  sousTitre="Objet de sac : butin, ingrédient, objet de quête…" onAnnuler={onAnnuler}>
        <form className={styles.formulaire} onSubmit={(event) => soumettre(() => ({
            id: item?.id || 0,
            nom: f.nom,
            description: f.description || null,
            image: f.image || null,
            imageCarte: f.imageCarte,
            prixVente: f.prixVente === "" ? null : Number(f.prixVente),
            metierId: f.metierId ? Number(f.metierId) : null,
            niveauRessource: f.metierId ? Number(f.niveauRessource) || 0 : 0,
        }))(event)}>
            <label htmlFor="objet-nom">Nom</label>
            <input id="objet-nom" value={f.nom} onChange={champ('nom')} maxLength={255} autoFocus/>

            <ImageUploadField collection="objet" label="Image" nom={f.nom} valeur={f.image} onChange={(image) => setF({...f, image})}/>

            <ImageUploadField collection="interaction" label="Image affichée sur la carte" nom={`${f.nom}-carte`} valeur={f.imageCarte} onChange={(imageCarte) => setF({...f, imageCarte})}/>

            <label htmlFor="objet-description">Description</label>
            <textarea id="objet-description" rows={3} value={f.description} onChange={champ('description')}/>

            <div className={styles.ligneChamps}>
                <div>
                    <label htmlFor="objet-prix">Prix de revente (po)</label>
                    <input id="objet-prix" type="number" min={0} value={f.prixVente} onChange={champ('prixVente')} placeholder="Ne se revend pas"/>
                </div>
            </div>

            <fieldset className={styles.encart}>
                <legend>Ressource de métier</legend>
                <p className={styles.aide}>Avec un métier de récolte, enregistrer cet objet le rend automatiquement disponible dans le MapMaker. Son nom, son image et son niveau suivent cette fiche.</p>
                <div className={styles.ligneChamps}>
                    <div>
                        <label htmlFor="objet-metier">Métier</label>
                        <select id="objet-metier" value={f.metierId} onChange={champ('metierId')}>
                            <option value="">Aucun (objet ordinaire)</option>
                            {referentiels.metiers.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.famille})</option>)}
                        </select>
                    </div>
                    {f.metierId && <div>
                        <label htmlFor="objet-niveau">Palier (niveau)</label>
                        <input id="objet-niveau" type="number" min={0} value={f.niveauRessource} onChange={champ('niveauRessource')}/>
                    </div>}
                </div>
                <p className={styles.aide}>Nouvelle récolte : 3 PA, 1 ressource, 12 XP métier, recharge personnelle de 5 minutes, choix mesuré/intensif. Les réglages existants sont conservés.</p>
                <p className={styles.aide}>Pour ajuster ces valeurs après enregistrement : <a href="/administration/interactions">Interactions</a>. Retirer le métier de récolte désactive ses points ; leur réactivation se fait dans Interactions.</p>
            </fieldset>

            <Pied envoi={envoi} erreur={erreur} onAnnuler={onAnnuler} libelle={item ? "Enregistrer" : "Créer l'objet"}/>
        </form>
    </Cadre>;
};

/* ------------------------------------------------------------ consommable */

export const ConsommableForm = ({item, referentiels, onEnregistrer, onEnregistrerBuff, onAnnuler}) => {
    const c = item?.consommable;
    const [f, setF] = useState(() => ({
        nom: item?.nom || "",
        description: item?.description || "",
        icone: item?.image || "",
        type: c?.type || referentiels.typesConsommable[0]?.value || "",
        points: c?.points ?? 100,
        buffId: c?.buffId ?? "",
        cooldown: c?.cooldown ?? 2,
        prixAchat: item?.prixAchat ?? "",
        prixVente: item?.prixVente ?? 0,
    }));
    const {envoi, erreur, soumettre} = useEnvoi(onEnregistrer);
    const champ = (cle) => (e) => setF({...f, [cle]: e.target.value});
    // `editionBuff` : null, ou le brouillon du bonus en cours d'édition ({id: 0} = nouveau).
    const [editionBuff, setEditionBuff] = useState(null);
    const buffs = referentiels.buffs || [];
    const buff = buffs.find(b => String(b.id) === String(f.buffId)) || null;

    return <Cadre titre={item ? `Modifier « ${item.nom} »` : "Nouveau consommable"} sousTitre="Potion, nourriture… utilisable en jeu" onAnnuler={onAnnuler}>
        <form className={styles.formulaire} onSubmit={(event) => soumettre(() => ({
            id: item?.id || 0,
            nom: f.nom,
            description: f.description || null,
            icone: f.icone || null,
            type: f.type,
            points: Number(f.points) || 0,
            buffId: f.type === "buff" ? Number(f.buffId) || null : null,
            cooldown: Number(String(f.cooldown).replace(',', '.')) || 0,
            prixAchat: f.prixAchat === "" ? null : Number(f.prixAchat),
            prixVente: Number(f.prixVente) || 0,
        }))(event)}>
            <label htmlFor="conso-nom">Nom</label>
            <input id="conso-nom" value={f.nom} onChange={champ('nom')} maxLength={255} autoFocus/>

            <ImageUploadField collection="consommable" label="Icône" nom={f.nom} valeur={f.icone} onChange={(icone) => setF({...f, icone})}/>

            <label htmlFor="conso-description">Description</label>
            <textarea id="conso-description" rows={2} value={f.description} onChange={champ('description')}/>

            <div className={styles.ligneChamps}>
                <div>
                    <label htmlFor="conso-type">Effet</label>
                    <select id="conso-type" value={f.type} onChange={champ('type')}>
                        {referentiels.typesConsommable.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                {f.type === "buff" ? null : <div>
                    <label htmlFor="conso-points">Points rendus</label>
                    <input id="conso-points" type="number" min={1} value={f.points} onChange={champ('points')}/>
                </div>}
                <div>
                    <label htmlFor="conso-cd">Recharge (s)</label>
                    <input id="conso-cd" type="number" min={0} step="0.5" value={f.cooldown} onChange={champ('cooldown')}/>
                </div>
            </div>
            {f.type === "buff" && <fieldset className={styles.encart}>
                <legend>Bonus appliqué</legend>
                <label htmlFor="conso-buff">Bonus temporaire</label>
                <select id="conso-buff" value={f.buffId} onChange={(e) => { setF({...f, buffId: e.target.value}); setEditionBuff(null); }} required>
                    <option value="">Choisir un bonus</option>
                    {buffs.map(b => <option key={b.id} value={b.id}>{b.nom} — {resumeBuff(b)}</option>)}
                </select>
                {buff && !editionBuff && <ResumeBuff buff={buff} buffEnBaseId={item?.consommable?.buffId ?? null}
                                                    onDescription={() => setF({...f, description: descriptionDepuisBuff(buff)})}/>}
                {!editionBuff && <div className={styles.actions}>
                    {buff && <button type="button" className={styles.bouton} onClick={() => setEditionBuff(brouillonBuff(buff, false))}>
                        <IconeAtlas nom="crayon" taille={13}/> Modifier ce bonus
                    </button>}
                    <button type="button" className={styles.bouton} onClick={() => setEditionBuff(brouillonBuff(buff, true))}>
                        <IconeAtlas nom="plus" taille={13}/> {buff ? "Nouveau bonus (copie)" : "Nouveau bonus"}
                    </button>
                </div>}
                {editionBuff && <BuffEditor brouillon={editionBuff} caracteristiques={referentiels.caracteristiques || []}
                                            partage={buff && editionBuff.id === buff.id ? buff : null} buffEnBaseId={item?.consommable?.buffId ?? null}
                                            onAnnuler={() => setEditionBuff(null)}
                                            onEnregistrer={async (data) => {
                                                const buffId = await onEnregistrerBuff(data);
                                                setF(courant => ({...courant, buffId: String(buffId)}));
                                                setEditionBuff(null);
                                            }}/>}
            </fieldset>}

            <div className={styles.ligneChamps}>
                <div>
                    <label htmlFor="conso-achat">Prix d'achat (po)</label>
                    <input id="conso-achat" type="number" min={0} value={f.prixAchat} onChange={champ('prixAchat')} placeholder="Non vendu"/>
                </div>
                <div>
                    <label htmlFor="conso-vente">Prix de revente (po)</label>
                    <input id="conso-vente" type="number" min={0} value={f.prixVente} onChange={champ('prixVente')}/>
                </div>
            </div>

            <Pied envoi={envoi} erreur={erreur} onAnnuler={onAnnuler} libelle={item ? "Enregistrer" : "Créer le consommable"}/>
        </form>
    </Cadre>;
};

/* ------------------------------------------------------------------ bonus */

const brouillonBuff = (buff, copie) => ({
    id: copie || !buff ? 0 : buff.id,
    nom: buff ? (copie ? `${buff.nom} (copie)` : buff.nom) : "",
    duree: buff?.duree ?? 600,
    effets: buff?.effets.length
        ? buff.effets.map(e => ({cle: Math.random().toString(36).slice(2), caracteristiqueId: String(e.caracteristiqueId), valeur: e.valeur}))
        : [{cle: Math.random().toString(36).slice(2), caracteristiqueId: "", valeur: 5}],
});

/** Qui d'autre cite ce bonus : le modifier les change tous, en jeu, immédiatement. */
function autresUsages(buff, buffEnBaseId) {
    // La potion éditée compte déjà parmi ses usages si c'est ce bonus qu'elle cite en base.
    const autresPotions = buff.consommables - (buffEnBaseId === buff.id ? 1 : 0);
    const parts = [];
    if (autresPotions > 0) parts.push(`${autresPotions} autre${autresPotions > 1 ? "s" : ""} potion${autresPotions > 1 ? "s" : ""}`);
    if (buff.sortileges > 0) parts.push(`${buff.sortileges} sort${buff.sortileges > 1 ? "s" : ""}`);
    return parts.join(" et ");
}

const ResumeBuff = ({buff, buffEnBaseId, onDescription}) => {
    const partage = autresUsages(buff, buffEnBaseId);
    return <div className={styles.resumeBuff}>
        <ul>
            {buff.effets.map(e => <li key={e.caracteristiqueId}><b>{e.valeur > 0 ? "+" : ""}{e.valeur}</b> {e.nom}</li>)}
            <li className={styles.resumeBuffDuree}>pendant {formatDuree(buff.duree)}</li>
        </ul>
        {partage && <small className={styles.attention}>Partagé avec {partage}.</small>}
        <button type="button" className={styles.lienTexte} onClick={onDescription}>Écrire la description d'après cet effet</button>
    </div>;
};

/**
 * Éditeur d'un bonus, DANS le formulaire de la potion : c'est un `<div>` (pas de `<form>`
 * imbriqué) et Entrée n'y soumet rien — sinon elle enregistrerait la potion.
 */
const BuffEditor = ({brouillon, caracteristiques, partage, buffEnBaseId, onEnregistrer, onAnnuler}) => {
    const [b, setB] = useState(brouillon);
    const {envoi, erreur, soumettre} = useEnvoi(onEnregistrer);
    const majEffet = (cle, champ, valeur) => setB({...b, effets: b.effets.map(e => e.cle === cle ? {...e, [champ]: valeur} : e)});
    const sansEffetEnJeu = b.effets.filter(e => caracteristiques.find(c => String(c.id) === String(e.caracteristiqueId) && !c.effective));
    const usages = partage ? autresUsages(partage, buffEnBaseId) : "";

    const enregistrer = soumettre(() => ({
        id: b.id,
        nom: b.nom,
        duree: Number(b.duree) || 0,
        effets: b.effets.map(e => ({caracteristiqueId: Number(e.caracteristiqueId) || 0, valeur: Number(e.valeur) || 0})),
    }));

    return <div className={styles.editeurBuff} onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "BUTTON") e.preventDefault(); }}>
        <h4>{b.id ? "Modifier le bonus" : "Nouveau bonus"}</h4>
        {usages && <p className={styles.attention}>Ce bonus sert aussi à {usages} : ils changeront tous. Pour ne toucher qu'à cette potion, partez d'une copie.</p>}
        <div className={styles.ligneChamps}>
            <div>
                <label htmlFor="buff-nom">Nom du bonus</label>
                <input id="buff-nom" value={b.nom} onChange={(e) => setB({...b, nom: e.target.value})} maxLength={255}/>
            </div>
            <div>
                <label htmlFor="buff-duree">Durée (s) <small>{formatDuree(b.duree)}</small></label>
                <input id="buff-duree" type="number" min={1} value={b.duree} onChange={(e) => setB({...b, duree: e.target.value})}/>
            </div>
        </div>
        <label>Effets</label>
        <ul className={styles.effetsBuff}>
            {b.effets.map(e => <li key={e.cle}>
                <select value={e.caracteristiqueId} onChange={(ev) => majEffet(e.cle, 'caracteristiqueId', ev.target.value)} aria-label="Caractéristique">
                    <option value="">Caractéristique…</option>
                    {caracteristiques.map(c => <option key={c.id} value={c.id}>{c.nom}{c.effective ? "" : " (sans effet en jeu)"}</option>)}
                </select>
                <input type="number" value={e.valeur} onChange={(ev) => majEffet(e.cle, 'valeur', ev.target.value)} aria-label="Valeur"/>
                <button type="button" className={styles.boutonIcone} title="Retirer cet effet" disabled={b.effets.length === 1}
                        onClick={() => setB({...b, effets: b.effets.filter(x => x.cle !== e.cle)})}>
                    <IconeAtlas nom="fermer" taille={13}/>
                </button>
            </li>)}
        </ul>
        <button type="button" className={styles.lienTexte}
                onClick={() => setB({...b, effets: [...b.effets, {cle: Math.random().toString(36).slice(2), caracteristiqueId: "", valeur: 5}]})}>
            + Ajouter un effet
        </button>
        {sansEffetEnJeu.length > 0 && <p className={styles.attention}>
            Un bonus n'agit que sur les caractéristiques utilisées par les sorts (dégâts ou équilibre) : les autres n'auront aucun effet en jeu.
        </p>}
        {erreur && <p className={styles.erreur}>{erreur}</p>}
        <div className={styles.actions}>
            <button type="button" className={styles.boutonPrincipal} disabled={envoi} onClick={enregistrer}>
                {envoi ? "Enregistrement…" : b.id ? "Enregistrer le bonus" : "Créer le bonus"}
            </button>
            <button type="button" className={styles.bouton} onClick={onAnnuler}>Annuler</button>
        </div>
    </div>;
};

/* ----------------------------------------------------------------- butins */

const ligneVide = () => ({cle: Math.random().toString(36).slice(2), id: 0, monstreId: "", chance: 10, metierId: "", niveauMetierMin: 1, experienceMetier: 0});

/**
 * Lignes `monstre_objet` d'un objet. Une ligne liée à un métier n'est ramassée que par qui
 * l'exerce au niveau requis (le dépeceur) ; sans métier, tout le monde la tire.
 */
export const ButinsForm = ({item, referentiels, onEnregistrer, onAnnuler}) => {
    const [lignes, setLignes] = useState(() => item.butins.map(b => ({
        cle: `b${b.id}`, id: b.id, monstreId: b.monstreId, chance: b.chance,
        metierId: b.metier?.id || "", niveauMetierMin: b.niveauMetierMin || 1, experienceMetier: b.experienceMetier || 0,
    })));
    const {envoi, erreur, soumettre} = useEnvoi(onEnregistrer);
    const maj = (cle, champ) => (e) => setLignes(lignes.map(l => l.cle === cle ? {...l, [champ]: e.target.value} : l));
    const lieuxDe = (monstreId) => item.sources.find(s => s.type === 'monstre' && s.refId === Number(monstreId))?.lieux;

    return <Cadre titre="Butins de monstres" sousTitre={`Qui laisse tomber « ${item.nom} » ?`} onAnnuler={onAnnuler}>
        <form className={styles.formulaire} onSubmit={(event) => soumettre(() => lignes.map(l => ({
            id: l.id || 0,
            monstreId: Number(l.monstreId),
            chance: l.chance,
            metierId: l.metierId ? Number(l.metierId) : null,
            niveauMetierMin: Number(l.niveauMetierMin) || 0,
            experienceMetier: Number(l.experienceMetier) || 0,
        })))(event)}>
            <p className={styles.aide}>Chaque ligne est tirée indépendamment à chaque victoire. Retirer une ligne la supprime au prochain enregistrement.</p>

            {lignes.length === 0 && <p className={styles.vide}>Aucun monstre ne le laisse tomber.</p>}

            <ul className={styles.butins}>
                {lignes.map(l => {
                    const monstre = referentiels.monstres.find(m => m.id === Number(l.monstreId));
                    const lieux = lieuxDe(l.monstreId);
                    return <li key={l.cle} className={styles.butin}>
                        <div className={styles.butinTete}>
                            <span className={styles.butinVignette}>
                                {monstre?.skin ? <img src={`/img/monstre/${monstre.skin}.png`} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }}/> : <IconeAtlas nom="monstre" taille={18}/>}
                            </span>
                            <select aria-label="Monstre" value={l.monstreId} onChange={maj(l.cle, 'monstreId')}>
                                <option value="">Choisir un monstre…</option>
                                {referentiels.monstres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                            </select>
                            <button type="button" className={styles.boutonIcone} title="Retirer cette ligne"
                                    onClick={() => setLignes(lignes.filter(x => x.cle !== l.cle))}><IconeAtlas nom="fermer" taille={14}/></button>
                        </div>
                        <div className={styles.ligneChamps}>
                            <div>
                                <label>Chance (%)</label>
                                <input type="number" min={0.01} max={100} step="0.01" value={l.chance} onChange={maj(l.cle, 'chance')}/>
                                <small className={styles.aide}>{frequence(l.chance)}</small>
                            </div>
                            <div>
                                <label>Réservé au métier</label>
                                <select value={l.metierId} onChange={maj(l.cle, 'metierId')}>
                                    <option value="">Personne en particulier</option>
                                    {referentiels.metiers.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                                </select>
                            </div>
                        </div>
                        {l.metierId && <div className={styles.ligneChamps}>
                            <div>
                                <label>Niveau de métier min.</label>
                                <input type="number" min={1} value={l.niveauMetierMin} onChange={maj(l.cle, 'niveauMetierMin')}/>
                            </div>
                            <div>
                                <label>XP de métier gagnée</label>
                                <input type="number" min={0} value={l.experienceMetier} onChange={maj(l.cle, 'experienceMetier')}/>
                            </div>
                        </div>}
                        {l.monstreId && lieux !== undefined && (lieux.length
                            ? <small className={styles.aide}><IconeAtlas nom="carte" taille={11}/> {lieux.map(x => x.nom).join(', ')}</small>
                            : <small className={styles.attention}>Ce monstre n'est posé sur aucune carte.</small>)}
                    </li>;
                })}
            </ul>

            <button type="button" className={styles.boutonAjout} onClick={() => setLignes([...lignes, ligneVide()])}>
                <IconeAtlas nom="plus" taille={14}/> Ajouter un monstre
            </button>

            <Pied envoi={envoi} erreur={erreur} onAnnuler={onAnnuler} libelle="Enregistrer les butins"/>
        </form>
    </Cadre>;
};
