import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import CraftApi from "../../services/CraftApi";
import MetierApi from "../../services/MetierApi";
import {updateJoueurState} from "../../store/actions";
import FileFabrication from "../../components/artisanat/fileFabrication/FileFabrication";
import MetierCard from "../../components/artisanat/metierCard/MetierCard";
import RecetteCard from "../../components/artisanat/recetteCard/RecetteCard";
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
 */
const ArtisanatPage = (props) => {

    const [atelier, setAtelier] = useState(null);
    const [progression, setProgression] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [occupe, setOccupe] = useState(false);

    const [recherche, setRecherche] = useState("");
    const [filtreMetier, setFiltreMetier] = useState("tous");
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

    /** Les métiers représentés dans le catalogue : la barre de filtres se déduit des données. */
    const metiersDesRecettes = useMemo(() => {
        const vus = new Map();
        recettes.forEach(recette => vus.set(recette.metierId, recette.metier));

        return [...vus.entries()].map(([id, nom]) => ({id, nom}));
    }, [recettes]);

    const recettesFiltrees = useMemo(() => {
        const terme = sansAccent(recherche.trim());

        return recettes.filter(recette => {
            if (filtreMetier !== "tous" && recette.metierId !== filtreMetier) {
                return false;
            }
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
    }, [recettes, recherche, filtreMetier, realisablesSeulement]);

    const modeDe = (recette) => modeChoisi[recette.id] || modes[0]?.value || "";

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
                            {duGroupe.map(metier => (
                                <MetierCard key={metier.metierId} metier={metier} compact
                                            actif={filtreMetier === metier.metierId}
                                            onClick={metiersDesRecettes.some(m => m.id === metier.metierId)
                                                ? () => setFiltreMetier(
                                                    filtreMetier === metier.metierId ? "tous" : metier.metierId)
                                                : undefined}/>
                            ))}
                        </div>}
                </section>
            );
        });
    };

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
                                        onClick={() => setFiltreMetier("tous")}>
                                    Tous
                                </button>
                                {metiersDesRecettes.map(metier => (
                                    <button key={metier.id} type="button"
                                            className={`${styles.puce} ${filtreMetier === metier.id ? styles.puceActive : ""}`}
                                            onClick={() => setFiltreMetier(metier.id)}>
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

                        {recettes.length === 0
                            ? <p className={styles.vide}>
                                Vous n'exercez aucun métier de fabrication : apprenez-en un auprès d'un maître
                                pour voir ses recettes ici.
                            </p>
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
