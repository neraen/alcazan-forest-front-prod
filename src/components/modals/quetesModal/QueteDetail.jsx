import React, {useEffect, useState} from "react";
import {itemImage} from "../../inventory/screen/itemUtils";
import Vignette from "../../artisanat/vignette/Vignette";
import Glyph from "../../ui/glyphs/Glyph";
import {dateFin, lieuTexte} from "./queteUtils";
import styles from "./QuetesModal.module.scss";

/**
 * Titre de section de la fiche. Pas `SectionTitle` (20 px minimum) : dans une colonne
 * d'environ 520 px, quatre titres de cette taille écrasaient le contenu qu'ils annoncent.
 */
const SectionTitle = ({children, right = null}) => (
    <div className={styles.sectionTitre}>
        <span className={styles.sectionTitreTexte}>{children}</span>
        <span className={styles.sectionTitreTrait}/>
        {right}
    </div>
);

const majuscule = (texte) => texte ? texte.charAt(0).toUpperCase() + texte.slice(1) : texte;

/** Fiche d'une quête du journal (colonne de droite). */
const QueteDetail = ({quete}) => {
    const etape = quete.etape;

    return (
        <article className={styles.detail}>
            <header className={styles.entete}>
                <div className={styles.enteteBadges}>
                    {quete.statut === "enCours" && <span className={styles.badge}>Étape {etape?.numero}</span>}
                    {quete.statut === "disponible" && <span className={`${styles.badge} ${styles.badgeDispo}`}>Nouvelle quête</span>}
                    {quete.statut === "terminee" && <span className={`${styles.badge} ${styles.badgeFini}`}>✓ Terminée</span>}
                    {quete.niveauMin && quete.statut !== "terminee" && (
                        <span className={styles.badgeNeutre}>Niveau {quete.niveauMin} requis</span>
                    )}
                </div>
                <h2 className={styles.titre}>{quete.nom}</h2>
                {quete.statut === "enCours" && etape?.titre && (
                    <p className={styles.sousTitreEtape}>{majuscule(etape.titre)}</p>
                )}
            </header>

            {quete.statut === "enCours" && etape && <EtapeEnCours etape={etape}/>}
            {quete.statut === "disponible" && <QueteDisponible quete={quete}/>}
            {quete.statut === "terminee" && <QueteTerminee quete={quete}/>}
        </article>
    );
};

const EtapeEnCours = ({etape}) => {
    const objectifs = etape.objectifs ?? [];
    const nomPnj = etape.pnj?.nom ?? "votre contact";
    // Chaque objectif affiche déjà sa propre récompense quand elle dépend du choix : la
    // section « Récompenses » ne ferait alors que le redire.
    const recompensesParObjectif = etape.objectifsAuChoix && etape.recompensesVariables;

    // Ce qu'il reste à faire une fois l'objectif rempli : revenir au PNJ et cliquer le
    // bon bouton — c'est ce libellé-là que le joueur cherchera dans le dialogue.
    const retour = objectifs.length === 1
        ? <>Une fois fait, retournez voir {nomPnj} et choisissez « {objectifs[0].bouton} ».</>
        : <>Dès que l'un d'eux est rempli, retournez voir {nomPnj}.</>;

    return (
        <>
            {etape.pret
                ? <Destination pnj={etape.pnj}
                               etiquette="Prochaine étape"
                               consigne={objectifs.length ? `Retournez voir ${nomPnj}` : `Parlez à ${nomPnj}`}
                               enAvant/>
                : <Destination pnj={etape.pnj} etiquette="Votre contact" consigne={nomPnj}/>}

            <section className={styles.section}>
                <SectionTitle right={etape.objectifsAuChoix
                    ? <span className={styles.sectionNote}>Un seul suffit</span>
                    : null}>
                    Objectifs
                </SectionTitle>
                <ul className={styles.objectifs}>
                    {objectifs.map((objectif) => (
                        <Objectif key={objectif.actionId}
                                  objectif={objectif}
                                  montrerRecompenses={recompensesParObjectif}/>
                    ))}
                    {objectifs.length === 0 && (
                        <li className={styles.objectif}>
                            <span className={`${styles.coche} ${styles.cocheContact}`} aria-hidden="true">
                                <Glyph name="book" size={14}/>
                            </span>
                            <span className={styles.objectifCorps}>
                                <span className={styles.objectifLibelle}>Parler à {nomPnj}</span>
                                <span className={styles.objectifSous}>
                                    {etape.decision ? "Une décision vous attend dans ce dialogue." : "La suite de l'histoire vous attend dans ce dialogue."}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
                {objectifs.length > 0 && !etape.pret && <p className={styles.note}>{retour}</p>}
                {etape.decision && objectifs.length > 0 && (
                    <p className={styles.note}>Une décision vous attendra auprès de {nomPnj}.</p>
                )}
            </section>

            {!recompensesParObjectif && (
                <Recompenses recompenses={etape.recompenses} variables={etape.recompensesVariables}/>
            )}

            {etape.paroles?.length > 0 && (
                <section className={styles.section}>
                    <SectionTitle>Ses dernières paroles</SectionTitle>
                    <blockquote className={styles.paroles}>
                        {etape.paroles.map((paragraphe, index) => <p key={index}>{paragraphe}</p>)}
                        {etape.pnj && <cite className={styles.parolesAuteur}>— {etape.pnj.nom}</cite>}
                    </blockquote>
                </section>
            )}
        </>
    );
};

const QueteDisponible = ({quete}) => (
    <>
        <Destination pnj={quete.donneur}
                     etiquette="Pour commencer"
                     consigne={`Parlez à ${quete.donneur?.nom ?? "son commanditaire"}`}
                     enAvant/>
        <Resume introduction={quete.introduction}
                vide="Son commanditaire vous en dira davantage."/>
    </>
);

const QueteTerminee = ({quete}) => {
    const fin = dateFin(quete.termineeLe);

    return (
        <>
            <div className={styles.accomplie}>
                <span className={styles.accomplieSceau} aria-hidden="true">✓</span>
                <div>
                    <p className={styles.accomplieTitre}>Quête accomplie</p>
                    <p className={styles.accomplieTexte}>
                        {fin ? `Achevée le ${fin}` : "Achevée il y a longtemps déjà"}
                        {quete.donneur ? ` · confiée par ${quete.donneur.nom}` : ""}
                    </p>
                </div>
            </div>
            <Resume introduction={quete.introduction} vide="Une page tournée de votre aventure."/>
        </>
    );
};

const Resume = ({introduction, vide}) => (
    <section className={styles.section}>
        <SectionTitle>Résumé</SectionTitle>
        {introduction?.length > 0
            ? <div className={styles.resume}>{introduction.map((p, i) => <p key={i}>{p}</p>)}</div>
            : <p className={styles.resumeVide}>{vide}</p>}
    </section>
);

/** Carte « où aller » : le PNJ, la carte, la case, et si on y est déjà. */
const Destination = ({pnj, etiquette, consigne, enAvant}) => (
    <div className={`${styles.destination} ${enAvant ? styles.destinationEnAvant : ""}`}>
        <Portrait pnj={pnj}/>
        <div className={styles.destinationCorps}>
            <span className={styles.destinationEtiquette}>{etiquette}</span>
            <span className={styles.destinationConsigne}>{consigne}</span>
            {pnj?.lieu
                ? (
                    <span className={styles.destinationLieu}>
                        <img className={styles.destinationLieuIcone} src="/img/icons/map.png" alt=""/>
                        <span className={styles.destinationLieuTexte}>{lieuTexte(pnj.lieu)}</span>
                        {pnj.lieu.ici && <span className={styles.ici}>Vous y êtes</span>}
                    </span>
                )
                : <span className={styles.destinationLieuInconnu}>Lieu inconnu</span>}
        </div>
    </div>
);

const Portrait = ({pnj}) => {
    const [casse, setCasse] = useState(false);
    useEffect(() => setCasse(false), [pnj?.avatar]);

    return (
        <div className={styles.portrait}>
            {pnj?.avatar && !casse
                ? <img className={styles.portraitImage} src={`/img/pnj/${pnj.avatar}`} alt={pnj.nom}
                       onError={() => setCasse(true)}/>
                : <span className={styles.portraitInitiale}>{(pnj?.nom || "?").charAt(0)}</span>}
        </div>
    );
};

const Objectif = ({objectif, montrerRecompenses}) => {
    const {progress, fait, lieu} = objectif;
    const pct = progress && progress.target > 0
        ? Math.min(100, Math.round((progress.current / progress.target) * 100))
        : 0;
    const image = objectif.item ? itemImage(objectif.item) : null;

    return (
        <li className={`${styles.objectif} ${fait === true ? styles.objectifFait : ""}`}>
            <span className={`${styles.coche} ${fait === true ? styles.cocheFaite : ""}`} aria-hidden="true">
                {fait === true ? "✓" : ""}
            </span>
            {objectif.item && <Vignette src={image} alt={objectif.libelle} size="sm"/>}
            <span className={styles.objectifCorps}>
                <span className={styles.objectifLibelle}>{objectif.libelle}</span>
                {lieu && (
                    <span className={styles.objectifSous}>
                        {lieuTexte(lieu)}{lieu.ici ? " · vous y êtes" : ""}
                    </span>
                )}
                {progress && (
                    <span className={styles.progression}>
                        <span className={styles.progressionPiste}>
                            <span className={`${styles.progressionRemplissage} ${fait === true ? styles.progressionFaite : ""}`}
                                  style={{width: pct + "%"}}/>
                        </span>
                        <span className={styles.progressionCompte}>
                            {progress.current} / {progress.target}
                            <span className={styles.progressionUnite}> {progress.unit}</span>
                        </span>
                    </span>
                )}
                {montrerRecompenses && objectif.recompenses?.length > 0 && (
                    <span className={styles.objectifRecompenses}>
                        {objectif.recompenses.map((r, i) => <RecompenseChip key={i} recompense={r} compacte/>)}
                    </span>
                )}
            </span>
        </li>
    );
};

const Recompenses = ({recompenses, variables}) => {
    if (!recompenses?.length && !variables) {
        return null;
    }

    return (
        <section className={styles.section}>
            <SectionTitle>Récompenses</SectionTitle>
            {recompenses?.length > 0
                ? <div className={styles.recompenses}>{recompenses.map((r, i) => <RecompenseChip key={i} recompense={r}/>)}</div>
                : <p className={styles.note}>La récompense dépendra de votre choix.</p>}
        </section>
    );
};

const RecompenseChip = ({recompense, compacte = false}) => {
    const quantite = recompense.type === "or"
        ? `${recompense.quantity} po`
        : recompense.type === "experience"
            ? `${recompense.quantity}`
            : (recompense.quantity > 1 ? `${recompense.quantity} × ${recompense.label}` : recompense.label);

    let icone;
    if (recompense.type === "or") {
        icone = <img className={styles.recompenseIcone} src="/img/gui/Money03.png" alt=""/>;
    } else if (recompense.type === "experience") {
        // Pastille dessinée plutôt que `img/gui/Xp.png` : ce sprite est un texte gris
        // translucide, illisible sur le fond sombre d'une puce.
        icone = <span className={styles.recompenseXp}>XP</span>;
    } else {
        icone = <Vignette src={itemImage(recompense)} alt={recompense.label} size="sm" className={styles.recompenseVignette}/>;
    }

    return (
        <span className={`${styles.recompense} ${compacte ? styles.recompenseCompacte : ""}`}
              title={recompense.type === "experience" ? `${recompense.quantity} points d'expérience` : undefined}>
            {icone}
            <span className={styles.recompenseTexte}>{quantite}</span>
        </span>
    );
};

export default QueteDetail;
