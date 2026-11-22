import React, {useEffect, useRef, useState} from 'react';
import styles from './MondeAtlas.module.scss';
import {fondCarte} from "../../../components/map/imageCarte";
import IconeAtlas from "./IconeAtlas";
import {nomSuggere} from "./atlasModele";

/**
 * « Nouvelle carte au nord de X » : le seul geste de création de l'atlas.
 *
 * Le serveur crée la carte vierge ET la paire de passages réciproques en une transaction —
 * sinon la carte serait orpheline et n'apparaîtrait nulle part sur l'atlas.
 */
const ProlongerCarte = ({source, direction, onValider, onAnnuler}) => {
    const [nom, setNom] = useState(nomSuggere(source, direction));
    const [erreur, setErreur] = useState("");
    const [envoi, setEnvoi] = useState(false);
    const champ = useRef(null);

    useEffect(() => {
        setNom(nomSuggere(source, direction));
        setErreur("");
        champ.current?.focus();
        champ.current?.select();
    }, [source, direction]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!nom.trim()) {
            setErreur("Donnez un nom à la nouvelle carte.");
            return;
        }
        setEnvoi(true);
        try {
            await onValider(nom.trim());
        } catch (e) {
            setErreur(e?.response?.data?.message || e?.response?.data?.detail || "La création a échoué.");
        } finally {
            setEnvoi(false);
        }
    };

    const ordre = {nord: 'column-reverse', sud: 'column', est: 'row', ouest: 'row-reverse'}[direction.cle];

    return <aside className={styles.fiche}>
        <header className={styles.ficheEntete}>
            <div>
                <h2>Nouvelle carte</h2>
                <p>{direction.locatif} de « {source.nom} »</p>
            </div>
            <button type="button" className={styles.boutonIcone} onClick={onAnnuler} title="Annuler">
                <IconeAtlas nom="fermer" taille={16}/>
            </button>
        </header>

        <div className={styles.schemaProlonger} style={{flexDirection: ordre}}>
            <span className={styles.schemaSource} style={{backgroundImage: fondCarte(source.id)}}><em>{source.nom}</em></span>
            <span className={styles.schemaLien}/>
            <span className={styles.schemaNeuve}><IconeAtlas nom="plus" taille={22}/><em>{nom || "…"}</em></span>
        </div>

        <form onSubmit={(event) => handleSubmit(event)} className={styles.formulaire}>
            <label htmlFor="nom-carte">Nom de la carte</label>
            <input id="nom-carte" ref={champ} type="text" value={nom} maxLength={255}
                   onChange={(e) => { setNom(e.target.value); setErreur(""); }}/>
            {erreur && <p className={styles.erreur}>{erreur}</p>}

            <ul className={styles.etapes}>
                <li>Une carte vierge de {source.largeur}×{source.hauteur} cases, toutes praticables.</li>
                <li>Un passage aller-retour au milieu de la frontière commune, actif immédiatement.</li>
                <li>Ensuite : déposer le fond <code>src/img/map/&lt;id&gt;.png</code>, puis peindre collisions, PNJ et monstres dans le MapMaker.</li>
            </ul>

            <div className={styles.ficheActions}>
                <button type="submit" className={styles.boutonPrincipal} disabled={envoi}>
                    <IconeAtlas nom="plus" taille={15}/> {envoi ? "Création…" : "Créer et relier"}
                </button>
                <button type="button" className={styles.bouton} onClick={onAnnuler}>Annuler</button>
            </div>
        </form>
    </aside>;
};

export default ProlongerCarte;
