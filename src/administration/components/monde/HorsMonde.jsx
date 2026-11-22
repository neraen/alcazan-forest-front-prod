import React from 'react';
import styles from './MondeAtlas.module.scss';
import IconeAtlas from "./IconeAtlas";
import {Vignette} from "./FicheCarte";
import CanevasMonde from "./CanevasMonde";

const CONDITIONS_SALLE = {
    aucune: null,
    salle_nettoyee: "Salle nettoyée",
    leviers: "Leviers",
    boss_vaincu: "Boss vaincu",
};

/**
 * Tout ce qui n'a pas de place sur la grille du monde : donjons (instances, présentées
 * salle par salle dans l'ordre), régions détachées, lieux spéciaux, intérieurs, cartes
 * isolées.
 */
const HorsMonde = ({atlas, index, selectionId, onSelect, terme, options}) => {
    const parType = (type) => atlas.cartes.filter(c => c.type === type);
    const interieurs = parType('interieur');
    const speciaux = parType('special');
    const orphelines = parType('orpheline');
    const regions = atlas.regions.filter(r => !r.principale);

    const parents = new Map();
    interieurs.forEach(c => {
        if (!parents.has(c.parentId)) parents.set(c.parentId, []);
        parents.get(c.parentId).push(c);
    });

    return <div className={styles.horsMonde}>
        <section className={styles.bloc}>
            <h2><IconeAtlas nom="donjon" taille={18}/> Donjons <small>instances hors du monde</small></h2>
            {atlas.donjons.length === 0 && <p className={styles.vide}>Aucun donjon. Ils se créent dans le Donjon Maker.</p>}
            {atlas.donjons.map(donjon => (
                <article key={donjon.id} className={styles.donjon}>
                    <header>
                        <strong>{donjon.nom}</strong>
                        <span className={styles.chip}>Niv. {donjon.niveauMin}+</span>
                        <span className={styles.chip}>{donjon.tailleGroupeMax} joueurs max</span>
                        {!donjon.actif && <span className={styles.chipEtat + " " + styles.etat_casse}>Inactif</span>}
                    </header>
                    <div className={styles.chaine}>
                        <div className={styles.chaineBout}>
                            <small>Entrée</small>
                            {donjon.entrees.length === 0 && <em className={styles.erreur}>aucune porte</em>}
                            {donjon.entrees.map(e => {
                                const carte = index.cartes.get(e.carteId);
                                const passage = index.passages.get(e.passageId);
                                return <button key={e.passageId} type="button" className={styles.lienTexte} onClick={() => onSelect(carte.id)}>
                                    {carte.nom}{passage?.condition ? ` · ${passage.condition.libelle}` : ""}
                                </button>;
                            })}
                        </div>
                        {donjon.salles.map(salle => {
                            const carte = index.cartes.get(salle.carteId);
                            const condition = salle.condition in CONDITIONS_SALLE ? CONDITIONS_SALLE[salle.condition] : salle.condition;
                            return <React.Fragment key={salle.carteId}>
                                <span className={styles.chaineFleche} title={condition || "Libre"}>
                                    {condition ? <><IconeAtlas nom="cadenas" taille={11}/><small>{condition}</small></> : "→"}
                                </span>
                                <Vignette carte={carte} onSelect={onSelect} active={carte.id === selectionId}
                                          sousTitre={`Salle ${salle.ordre} · ${salle.type}`}/>
                            </React.Fragment>;
                        })}
                        <span className={styles.chaineFleche}>→</span>
                        <div className={styles.chaineBout}>
                            <small>Sortie</small>
                            {donjon.sortie
                                ? <button type="button" className={styles.lienTexte} onClick={() => onSelect(donjon.sortie.carteId)}>
                                    {index.cartes.get(donjon.sortie.carteId)?.nom} ({donjon.sortie.x}, {donjon.sortie.y})
                                </button>
                                : <em className={styles.erreur}>non définie</em>}
                        </div>
                    </div>
                </article>
            ))}
        </section>

        {regions.length > 0 && <section className={styles.bloc}>
            <h2>Régions détachées <small>reliées au reste par des portes seulement</small></h2>
            {regions.map(region => (
                <CanevasMonde key={region.id} atlas={atlas} index={index} regionId={region.id}
                              selectionId={selectionId} onSelect={onSelect} terme={terme}
                              options={options} compact/>
            ))}
        </section>}

        <div className={styles.colonnes}>
            <section className={styles.bloc}>
                <h2><IconeAtlas nom="porte" taille={18}/> Intérieurs <small>{interieurs.length}</small></h2>
                {[...parents.entries()].map(([parentId, liste]) => (
                    <div key={parentId} className={styles.groupe}>
                        <button type="button" className={styles.lienTexte} onClick={() => onSelect(parentId)}>
                            {index.cartes.get(parentId)?.nom}
                        </button>
                        <div className={styles.vignettes}>
                            {liste.map(c => <Vignette key={c.id} carte={c} onSelect={onSelect} active={c.id === selectionId}/>)}
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.bloc}>
                <h2><IconeAtlas nom="auberge" taille={18}/> Lieux spéciaux <small>auberge, cimetière</small></h2>
                <div className={styles.vignettes}>
                    {speciaux.map(c => <Vignette key={c.id} carte={c} onSelect={onSelect} active={c.id === selectionId}
                                                 sousTitre={c.cimetiere ? "Cimetière" : c.auberge ? "Auberge" : ""}/>)}
                </div>

                {orphelines.length > 0 && <>
                    <h2 className={styles.sousBloc}><IconeAtlas nom="alerte" taille={18}/> Cartes isolées <small>à relier</small></h2>
                    <div className={styles.vignettes}>
                        {orphelines.map(c => <Vignette key={c.id} carte={c} onSelect={onSelect} active={c.id === selectionId} sousTitre="Aucun passage"/>)}
                    </div>
                </>}
            </section>
        </div>
    </div>;
};

export default HorsMonde;
