import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import CraftApi from "../../services/CraftApi";
import MetierApi from "../../services/MetierApi";
import {updateJoueurState} from "../../store/actions";
import FileFabrication from "../../components/artisanat/fileFabrication/FileFabrication";
import MetierCard from "../../components/artisanat/metierCard/MetierCard";
import RecetteCard from "../../components/artisanat/recetteCard/RecetteCard";
import RessourceCard from "../../components/artisanat/ressourceCard/RessourceCard";
import Loader from "../../components/loader/Loader";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Panel from "../../components/ui/panel/Panel";
import SectionTitle from "../../components/ui/sectionTitle/SectionTitle";
import Glyph from "../../components/ui/glyphs/Glyph";
import styles from './ArtisanatPage.module.scss'

/** Comparaison insensible à la casse ET aux accents : « épée » doit sortir sur « epee ». */
const sansAccent = (texte) => (texte || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Page Artisanat : les métiers du joueur et leur progression, l'établi, et le catalogue
 * des recettes de ses métiers de fabrication (cartes illustrées + recherche).
 *
 * Deux règles reprises telles quelles du reste du projet :
 *  - **le client ne décide de rien** : `realisable`, `prete` et les chiffres des modes
 *    viennent du serveur, qui revérifie tout au lancement comme au retrait ;
 *  - **rien n'est décompté localement** : les durées se recalculent depuis les dates
 *    serveur (`craftUtils`).
 *
 * Le catalogue ne montre que les recettes des métiers APPRIS — c'est le filtrage de
 * `CraftService::atelier()`, pas une décision d'affichage.
 *
 * Cliquer sur la fiche d'un métier du rail ouvre ce que ce métier a à montrer, et la
 * famille suffit à le dire : un métier de RÉCOLTE ouvre son catalogue de ressources
 * (`metier.ressources`, renvoyé par `MetierService`), un métier de FABRICATION filtre les
 * recettes. Recliquer referme. Les deux occupent la même colonne, donc un seul état
 * (`selection`) — et un métier sans rien à montrer reste cliquable : c'est la colonne qui
 * l'annonce, pas un clic muet.
 */
const ArtisanatPage = (props) => {

    const [atelier, setAtelier] = useState(null);
    const [progression, setProgression] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [occupe, setOccupe] = useState(false);

    const [recherche, setRecherche] = useState("");
    // Fiche de métier ouverte : {id, famille} ou null (= catalogue complet). Un seul état
    // pour les deux familles, parce qu'une fiche de récolte et un filtre de recettes
    // occupent la MÊME colonne — deux états séparés laisseraient les deux ouverts.
    const [selection, setSelection] = useState(null);
    const [realisablesSeulement, setRealisablesSeulement] = useState(false);
    const [modeChoisi, setModeChoisi] = useState({});

    const charger = useCallback(async () => {
        try {
            const [donneesAtelier, donneesMetiers] = await Promise.all([
                CraftApi.atelier(),
                MetierApi.progression(),
            ]);
            setAtelier(donneesAtelier);
            setProgression(donneesMetiers);
        } catch (erreur) {
            toast.error("L'artisanat est inaccessible pour le moment.");
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const agir = async (action, ...args) => {
        setOccupe(true);
        try {
            const reponse = await action(...args);
            (reponse.messages || [reponse.message]).filter(Boolean).forEach(m => toast.info(m));
            await charger();
            // Le sac a bougé (ingrédients débités, objet produit) : la carte et les
            // compteurs du joueur doivent se resynchroniser.
            props.updateJoueurState({needRefresh: true});
        } catch (erreur) {
            toast.error(erreur.response?.data?.error || "Une erreur est survenue.");
        } finally {
            setOccupe(false);
        }
    };

    const handleAnnuler = (commande) => {
        if (window.confirm(`Annuler « ${commande.nom} » ? Les matériaux vous seront rendus, mais le temps déjà passé est perdu.`)) {
            agir(CraftApi.annuler, commande.id);
        }
    };

    const modes = atelier?.modes || [];
    const commandes = atelier?.commandes || [];
    const recettes = useMemo(() => atelier?.recettes || [], [atelier]);
    const metiers = useMemo(() => progression?.metiers || [], [progression]);

    /**
     * Fiche de récolte ouverte, et filtre de recettes : deux lectures du même état.
     * Un métier de récolte n'a pas de recette, un métier de fabrication n'a pas de
     * ressource — la famille dit donc à elle seule ce que la colonne doit montrer.
     */
    const metierRecolte = selection?.famille === "recolte"
        ? metiers.find(metier => metier.metierId === selection.id) || null
        : null;
    const filtreMetier = selection?.famille === "craft" ? selection.id : "tous";

    /**
     * La barre de filtres liste TOUS les métiers de fabrication du joueur, y compris ceux
     * qui n'ont encore aucune recette : un métier appris qui disparaîtrait de la barre se
     * lirait comme un bug, et c'est justement là qu'on veut lui dire qu'il n'a rien à
     * fabriquer.
     */
    const metiersDeFabrication = useMemo(
        () => metiers.filter(metier => metier.famille === "craft")
            .map(metier => ({id: metier.metierId, nom: metier.nom})),
        [metiers]
    );

    /** Les recettes du métier sélectionné, AVANT recherche : sans elles, « rien à afficher »
        ne distingue pas « ce métier n'a aucune recette » de « votre recherche ne donne rien ». */
    const recettesDuMetier = useMemo(
        () => filtreMetier === "tous"
            ? recettes
            : recettes.filter(recette => recette.metierId === filtreMetier),
        [recettes, filtreMetier]
    );

    const recettesFiltrees = useMemo(() => {
        const terme = sansAccent(recherche.trim());

        return recettesDuMetier.filter(recette => {
            if (realisablesSeulement && !recette.realisable) {
                return false;
            }
            if (!terme) {
                return true;
            }

            // La recherche porte sur tout ce que la carte affiche, ingrédients compris :
            // « que puis-je faire avec du cuir ? » est la question la plus fréquente.
            const corpus = [
                recette.nom,
                recette.description,
                recette.metier,
                recette.produit?.nom,
                ...recette.ingredients.map(ingredient => ingredient.nom),
            ];

            return corpus.some(texte => sansAccent(texte).includes(terme));
        });
    }, [recettesDuMetier, recherche, realisablesSeulement]);

    const modeDe = (recette) => modeChoisi[recette.id] || modes[0]?.value || "";

    /** Ouvre la fiche d'un métier, ou la referme si c'est déjà elle qui est ouverte. */
    const basculerMetier = (metier) => setSelection(precedent =>
        precedent?.id === metier.metierId
            ? null
            : {id: metier.metierId, famille: metier.famille});

    const renderMetiers = () => {
        const famillesLabels = progression?.famillesLabels || {};
        const places = progression?.placesRestantes || {};

        return Object.entries(famillesLabels).map(([famille, label]) => {
            const duGroupe = metiers.filter(metier => metier.famille === famille);
            const restantes = places[famille] ?? 0;

            return (
                <section key={famille} className={styles.section}>
                    <SectionTitle right={
                        <span className={styles.compteur}>
                            {restantes > 0
                                ? `${restantes} place${restantes > 1 ? "s" : ""} libre${restantes > 1 ? "s" : ""}`
                                : "complet"}
                        </span>
                    }>
                        {label}
                    </SectionTitle>

                    {duGroupe.length === 0
                        ? <p className={styles.vide}>
                            Vous n'exercez aucun métier {label.toLowerCase()}. Trouvez un maître de métier
                            sur la carte pour en apprendre un.
                        </p>
                        : <div className={styles.grilleMetiers}>
                            {/* Toute fiche est cliquable, même sans rien à montrer : c'est la
                                colonne de droite qui dit « aucune recette disponible »
                                plutôt qu'un clic qui ne répond pas. */}
                            {duGroupe.map(metier => (
                                <MetierCard key={metier.metierId} metier={metier} compact
                                            actif={selection?.id === metier.metierId}
                                            onClick={() => basculerMetier(metier)}/>
                            ))}
                        </div>}
                </section>
            );
        });
    };

    /**
     * Fiche d'un métier de RÉCOLTE : ce qu'il permet de ramasser, palier par palier.
     *
     * `accessible` vient du serveur et n'autorise rien — la récolte reste arbitrée sur la
     * case par `InteractionService`. Les paliers hors de portée restent affichés (grisés) :
     * c'est là que le joueur lit ce que son prochain niveau lui ouvrira.
     */
    const renderRessources = () => {
        const ressources = metierRecolte.ressources || [];
        const aPortee = ressources.filter(ressource => ressource.accessible);

        return (
            <section className={styles.section}>
                <SectionTitle right={
                    <span className={styles.compteur}>
                        {aPortee.length} / {ressources.length} à votre niveau
                    </span>
                }>
                    Ressources · {metierRecolte.nom}
                </SectionTitle>

                <div className={styles.barre}>
                    <button type="button" className={styles.puce} onClick={() => setSelection(null)}>
                        ← Revenir aux recettes
                    </button>
                    <span className={styles.aideLigne}>
                        Niveau {metierRecolte.niveau} en {metierRecolte.nom} : vous pouvez ramasser
                        ces ressources sur les cases de récolte du monde.
                    </span>
                </div>

                {ressources.length === 0
                    ? <p className={styles.vide}>
                        Aucune ressource n'est encore rattachée à ce métier.
                    </p>
                    : <div className={styles.grilleRessources}>
                        {ressources.map(ressource => (
                            <RessourceCard key={ressource.id} ressource={ressource}/>
                        ))}
                    </div>}
            </section>
        );
    };

    /** Catalogue des recettes : tous les métiers de fabrication, ou celui qu'on a ouvert. */
    const renderRecettes = () => (
        <section className={styles.section}>
            <SectionTitle right={
                <span className={styles.compteur}>
                    {recettesFiltrees.length} / {recettes.length}
                </span>
            }>
                Recettes
            </SectionTitle>

            <div className={styles.barre}>
                <label className={styles.recherche}>
                    <Glyph name="search" size={15} className={styles.rechercheIcone}/>
                    <input className={styles.rechercheInput} value={recherche} type="search"
                           placeholder="Rechercher une recette, un matériau…"
                           onChange={(event) => setRecherche(event.target.value)}/>
                </label>

                <div className={styles.filtres}>
                    <button type="button"
                            className={`${styles.puce} ${filtreMetier === "tous" ? styles.puceActive : ""}`}
                            onClick={() => setSelection(null)}>
                        Tous
                    </button>
                    {metiersDeFabrication.map(metier => (
                        <button key={metier.id} type="button"
                                className={`${styles.puce} ${filtreMetier === metier.id ? styles.puceActive : ""}`}
                                onClick={() => setSelection({id: metier.id, famille: "craft"})}>
                            {metier.nom}
                        </button>
                    ))}
                </div>

                <label className={styles.bascule}>
                    <input type="checkbox" checked={realisablesSeulement}
                           onChange={(event) => setRealisablesSeulement(event.target.checked)}/>
                    Réalisables seulement
                </label>
            </div>

            {/* Trois vides bien distincts : aucun métier de fabrication, un métier sans
                aucune recette, ou une recherche qui ne donne rien. Les confondre reviendrait
                à dire au joueur de chercher autrement là où il n'y a simplement rien. */}
            {recettes.length === 0
                ? <p className={styles.vide}>
                    Vous n'exercez aucun métier de fabrication : apprenez-en un auprès d'un maître
                    pour voir ses recettes ici.
                </p>
                : recettesDuMetier.length === 0
                    ? <p className={styles.vide}>Aucune recette disponible pour ce métier.</p>
                    : recettesFiltrees.length === 0
                        ? <p className={styles.vide}>Aucune recette ne correspond à votre recherche.</p>
                        : <div className={styles.grilleRecettes}>
                            {recettesFiltrees.map(recette => (
                                <RecetteCard key={recette.id} recette={recette} modes={modes}
                                             mode={modeDe(recette)} occupe={occupe}
                                             onModeChange={(valeur) => setModeChoisi(precedent => ({
                                                 ...precedent, [recette.id]: valeur,
                                             }))}
                                             onFabriquer={(cible, mode) => agir(CraftApi.lancer, cible.id, mode)}/>
                            ))}
                        </div>}

            {/* Les chiffres des modes viennent du serveur : aucun n'est écrit ici. */}
            {modes.length > 0 && (
                <Panel variant="soft" padding="md" radius="lg" className={styles.aide}>
                    {modes.map(mode => (
                        <p key={mode.value} className={styles.aideLigne}>
                            <strong className={styles.aideTitre}>{mode.label}</strong> — {mode.description}
                            {" ("}temps ×{mode.temps}, {mode.recycle > 0
                                ? `${mode.recycle} % des ingrédients rendus`
                                : "rien de rendu"}, karma {mode.karma > 0 ? `+${mode.karma}` : mode.karma}{")"}
                        </p>
                    ))}
                </Panel>
            )}
        </section>
    );

    const renderContenu = () => {
        if (chargement) {
            return <div className={styles.loading}><Loader/></div>;
        }

        return (
            <div className={styles.body}>
                {/* Rail des métiers : la progression est un contexte permanent, le catalogue
                    la matière principale — d'où deux colonnes plutôt qu'un empilement qui
                    repousserait les recettes sous la ligne de flottaison. */}
                <aside className={styles.rail}>
                    {renderMetiers()}
                </aside>

                <div className={styles.principal}>
                    <section className={styles.section}>
                        <SectionTitle right={
                            <span className={styles.compteur}>{commandes.length} / {atelier?.commandesMax}</span>
                        }>
                            Établi
                        </SectionTitle>

                        <FileFabrication commandes={commandes} commandesMax={atelier?.commandesMax}
                                         occupe={occupe}
                                         onRetirer={(commande) => agir(CraftApi.retirer, commande.id)}
                                         onAnnuler={handleAnnuler}/>
                    </section>

                    {metierRecolte ? renderRessources() : renderRecettes()}
                </div>
            </div>
        );
    };

    const sousTitre = chargement
        ? ""
        : `${metiers.length} métier${metiers.length > 1 ? "s" : ""} · ${recettes.length} recette${recettes.length > 1 ? "s" : ""}`;

    return (
        <div className={styles.page}>
            <div className={styles.frame}>
                <ModalShell iconSrc="/img/menu/buches.png" title="Artisanat" subtitle={sousTitre}>
                    {renderContenu()}
                </ModalShell>
            </div>
        </div>
    )
}

export default connect(null, {updateJoueurState})(ArtisanatPage)
