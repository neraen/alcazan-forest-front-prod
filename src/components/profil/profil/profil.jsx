import React, {useState, useEffect} from 'react'
import UsersApi from "../../../services/UsersApi";
import InventaireApi from "../../../services/InventaireApi";
import MetierApi from "../../../services/MetierApi";
import carateristiqueService from "../../../services/carateristiqueService";
import Panel from "../../ui/panel/Panel";
import SectionTitle from "../../ui/sectionTitle/SectionTitle";
import GaugeBar from "../../ui/gaugeBar/GaugeBar";
import Glyph from "../../ui/glyphs/Glyph";
import styles from "./Profil.module.scss";

/**
 * Écran Profil (variante « plein écran » de la maquette design/react/ProfileScreen) :
 * identité + informations, bonus d'équipement par caractéristique, répartition des
 * points de caractéristiques. La logique (state + APIs) est celle d'origine.
 */

const STATS_META = [
    {key: "constitution", label: "Constitution", glyph: "heart"},
    {key: "force", label: "Force", glyph: "strength"},
    {key: "dexterite", label: "Dextérité", glyph: "target"},
    {key: "intelligence", label: "Intelligence", glyph: "wisdom"},
    {key: "concentration", label: "Concentration", glyph: "speed"},
    {key: "chance", label: "Chance", glyph: "luck"},
];

const Profil = (props) => {

    const [caracteristiques, setCaracteristiques] = useState({
        constitution: 0,
        force: 0,
        dexterite: 0,
        intelligence: 0,
        concentration: 0,
        chance: 0
    });

    // Valeurs telles que persistées en base — sert uniquement à afficher le « +n »
    // en attente de validation (présentation).
    const [savedCaracteristiques, setSavedCaracteristiques] = useState(null);

    const [caracteristiquesBonus, setCaracteristiquesBonus] = useState({
        armure: 0,
        force: 0,
        dexterite: 0,
        constitution: 0,
        intelligence: 0,
        concentration: 0,
        chance: 0,
        critique: 0
    })

    const [maxCaracsAllowed, setMaxCaracsAllowed] = useState(0);

    // Message de confirmation affiché après validation (auto-masqué).
    const [feedback, setFeedback] = useState(null);

    // Métiers appris : lecture seule ici. L'apprentissage et l'oubli se font chez un
    // maître de métier — la fiche de personnage rend compte, elle ne décide pas.
    const [metiers, setMetiers] = useState(null);

    useEffect(() => {
        fetchCaracteristiques(props.user.id)
        fetchEquipementEquipe();
        MetierApi.progression().then(setMetiers).catch(() => setMetiers(null));
    }, []);

    // Masque automatiquement le message de confirmation après quelques secondes.
    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 4000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const fetchEquipementEquipe = async () => {
        const dataEquipementEquipe = await InventaireApi.getEquipementEquipe();
        const caracteristiquesBonus  = await carateristiqueService.computeEquipementCaracs(dataEquipementEquipe);
        setCaracteristiquesBonus(caracteristiquesBonus);
    }

    const fetchCaracteristiques =  async id => {
        const caracsInfo = await UsersApi.getCaracteristiques(id)
        const caracs = caracsInfo.caracteristiques
        let caracsToSet = caracteristiques
        caracs.map((value) => {
            caracsToSet = {...caracsToSet, [value.nom] : value.points}
        })
        setCaracteristiques(caracsToSet);
        setSavedCaracteristiques(caracsToSet);
        setMaxCaracsAllowed(caracsInfo.maxCaracsAllowed);
    }

    const handleClick = (name, value) => {
        setCaracteristiques({...caracteristiques, [name] :  value})
    }

    const handleSubmit = async () => {
        if(!hasPending || remaining < 0){
            return;
        }
        await UsersApi.updateCaracteristiques(caracteristiques);
        // Les points répartis deviennent la nouvelle base : ils sont désormais verrouillés.
        setSavedCaracteristiques(caracteristiques);
        setFeedback("Les points ont été ajoutés.");
    }

    // Réinitialise la répartition en cours (points non validés) sans toucher aux points déjà validés.
    const handleReset = () => {
        if (savedCaracteristiques) {
            setCaracteristiques(savedCaracteristiques);
        }
        setFeedback(null);
    }

    const getActualCaracacteristiques = () => {
        return Object.values(caracteristiques).reduce((prevCarac, nextCarac)  => prevCarac + nextCarac);
    }

    const remaining = maxCaracsAllowed - getActualCaracacteristiques();

    // Classe et niveau sont déjà affichés dans la ligne d'identité dorée juste au-dessus.
    const infoRows = [
        {label: "Guilde", value: props.user.nomGuilde || "Aucune"},
        {label: "Alignement", value: props.user.nomAlignement || "Aucun"},
    ];

    // Le karma est une TROISIÈME réputation, distincte de l'alignement (le camp choisi)
    // et de l'honneur (la conduite en duel) : la manière dont le joueur prend au monde,
    // en récoltant, en fabriquant et dans ses choix de quête.
    //
    // Jauge et non ligne de texte : l'échelle est SIGNÉE et bornée, et ce qui compte
    // pour le joueur est de voir de quel côté de la neutralité il se trouve et combien
    // de marge il lui reste — un « Mesuré (-40) » ne dit ni l'un ni l'autre. Les bornes
    // et le libellé de palier viennent du serveur : les seuils n'existent qu'à un seul
    // endroit (ArtisanatConfig), sinon ce que le joueur lit et ce qui conditionnera
    // l'accès aux contenus finiraient par diverger.
    const karma = props.user.karma;
    const karmaEtendue = karma ? karma.max - karma.min : 0;

    const pendingFor = (key) => savedCaracteristiques
        ? Math.max(0, caracteristiques[key] - savedCaracteristiques[key])
        : 0;

    // Total de points répartis mais pas encore validés.
    const pendingTotal = STATS_META.reduce((sum, s) => sum + pendingFor(s.key), 0);
    const hasPending = pendingTotal > 0;

    const metiersAppris = metiers?.metiers || [];
    // Les libellés de famille viennent du serveur : le front ne connaît aucune famille
    // en dur, sinon en ajouter une afficherait sa valeur brute dans l'interface.
    const metierPlaces = metiers
        ? Object.entries(metiers.placesRestantes || {})
            .map(([famille, places]) => `${places} ${metiers.famillesLabels?.[famille] || famille}`)
            .join(" · ") + " libre(s)"
        : "";

    // variant="modal" : paddings resserrés (maquette ProfileScreen variante modale)
    return (
        <div className={`${styles.body} ${props.variant === "modal" ? styles.bodyCompact : ""}`}>
            {/* Colonne gauche : identité + bonus d'équipement */}
            <div className={styles.leftColumn}>
                <Panel variant="soft" padding="lg" radius="lg" className={styles.identityCard}>
                    <div className={styles.identity}>
                        <img className={styles.avatar} src="/img/gui/CharacterPlayer/Avatar.png"
                             alt={`Avatar de ${props.user.pseudo}`}/>
                        <div className={styles.identityText}>
                            <span className={styles.pseudo}>{props.user.pseudo}</span>
                            <span className={styles.identityMeta}>
                                {props.user.nomClasse} · Niveau {props.user.niveau}
                            </span>
                        </div>
                    </div>
                    <div className={styles.separator}/>
                    {infoRows.map((row) => (
                        <div key={row.label} className={styles.infoRow}>
                            <span className={styles.infoLabel}>{row.label}</span>
                            <span className={styles.infoValue}>{row.value}</span>
                        </div>
                    ))}
                    {karma && (
                        <div className={styles.karmaBlock}>
                            {/* marker : position du zéro sur l'échelle signée. Il ne tombe
                                au milieu que parce que les bornes sont symétriques — le
                                calculer plutôt que d'écrire 50 % garde le repère juste si
                                l'équilibrage les désymétrise un jour. */}
                            <GaugeBar variant="karma"
                                      value={karma.valeur - karma.min}
                                      max={karmaEtendue}
                                      marker={karmaEtendue > 0 ? ((0 - karma.min) / karmaEtendue) * 100 : 50}
                                      label="Karma"
                                      showValues={false}
                                      right={`${karma.palier} (${karma.valeur > 0 ? "+" : ""}${karma.valeur})`}/>
                        </div>
                    )}
                </Panel>

                <Panel variant="soft" padding="lg" radius="lg" className={styles.equipCard}>
                    <SectionTitle right={<span className={styles.sectionNote}>base + bonus</span>}>
                        Équipement
                    </SectionTitle>
                    <div className={styles.equipRows}>
                        {STATS_META.map((s) => (
                            <div key={s.key} className={`${styles.equipRow} ${styles[s.key]}`}>
                                <span className={styles.equipDot}/>
                                <span className={styles.equipLabel}>{s.label}</span>
                                <span className={styles.equipBase}>{caracteristiques[s.key]}</span>
                                <span className={styles.equipBonus}>+{caracteristiquesBonus[s.key]}</span>
                                <span className={styles.equipTotal}>
                                    {caracteristiques[s.key] + caracteristiquesBonus[s.key]}
                                </span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel variant="soft" padding="lg" radius="lg" className={styles.metierCard}>
                    <SectionTitle right={
                        <span className={styles.sectionNote}>
                            {metierPlaces}
                        </span>
                    }>
                        Métiers
                    </SectionTitle>
                    {metiersAppris.length === 0
                        ? <p className={styles.metierEmpty}>
                            Vous n'exercez aucun métier. Trouvez un maître pour en apprendre un.
                        </p>
                        : <div className={styles.metierRows}>
                            {metiersAppris.map((metier) => (
                                <div key={metier.metierId} className={styles.metierRow}>
                                    <div className={styles.metierHead}>
                                        <span className={styles.metierName}>{metier.nom}</span>
                                        <span className={styles.metierLevel}>
                                            niveau {metier.niveau} / {metier.niveauMax}
                                        </span>
                                    </div>
                                    {/* Barre bornée entre le palier du niveau courant et le
                                        suivant : sur 0 → prochain palier, elle reculerait à
                                        chaque montée de niveau. */}
                                    <GaugeBar variant="xp" showValues={false}
                                              value={metier.experience - metier.experienceNiveauCourant}
                                              max={Math.max(1, metier.experienceProchainNiveau - metier.experienceNiveauCourant)}/>
                                </div>
                            ))}
                        </div>}
                </Panel>
            </div>

            {/* Colonne droite : répartition des caractéristiques */}
            <Panel variant="soft" padding="xl" radius="lg" className={styles.statsCard}>
                <SectionTitle size="xl" right={
                    <span className={`${styles.pointsBadge} ${remaining > 0 ? styles.pointsBadgeActive : ""}`}>
                        <span className={styles.pointsBadgeLabel}>points à répartir</span>
                        <span className={styles.pointsBadgeValue}>{remaining}</span>
                    </span>
                }>
                    Caractéristiques
                </SectionTitle>

                <div className={styles.statsGrid}>
                    {STATS_META.map((s) => (
                        <div key={s.key} className={`${styles.statCard} ${styles[s.key]}`}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon}>
                                    <Glyph name={s.glyph}/>
                                </div>
                                <div className={styles.statText}>
                                    <div className={styles.statLabel}>{s.label}</div>
                                    <div className={styles.statDetail}>
                                        base {caracteristiques[s.key]} · équip{" "}
                                        <span className={styles.statDetailBonus}>+{caracteristiquesBonus[s.key]}</span>
                                    </div>
                                </div>
                                {pendingFor(s.key) > 0 && (
                                    <span className={styles.statPending}>+{pendingFor(s.key)}</span>
                                )}
                            </div>
                            <div className={styles.statControls}>
                                <button type="button" className={styles.stepper}
                                        disabled={!savedCaracteristiques || caracteristiques[s.key] <= savedCaracteristiques[s.key]}
                                        onClick={() => handleClick(s.key, caracteristiques[s.key] - 1)}>−</button>
                                {/* Base uniquement : le total avec équipement est dans le panneau Équipement */}
                                <span className={styles.statTotal}>
                                    {caracteristiques[s.key]}
                                </span>
                                <button type="button" className={styles.stepper}
                                        disabled={remaining <= 0}
                                        onClick={() => handleClick(s.key, caracteristiques[s.key] + 1)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    {feedback && (
                        <span className={styles.feedback} role="status">{feedback}</span>
                    )}
                    <div className={styles.actions}>
                        <button type="button" className={styles.reset}
                                disabled={!hasPending}
                                onClick={handleReset}>Réinitialiser</button>
                        <button type="button" className={styles.validate}
                                disabled={!hasPending || remaining < 0}
                                onClick={handleSubmit}>Valider</button>
                    </div>
                </div>
            </Panel>
        </div>
    )
}

export default Profil
