import React, {useCallback, useEffect, useState} from 'react';
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../store/actions";
import GuildeApi from "../../services/GuildeApi";
import authAPI from "../../services/authAPI";
import Loader from "../../components/loader/Loader";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Glyph from "../../components/ui/glyphs/Glyph";
import Panel from "../../components/ui/panel/Panel";
import SectionTitle from "../../components/ui/sectionTitle/SectionTitle";
import GameButton from "../../components/ui/gameButton/GameButton";
import styles from "./GuildePage.module.scss";

/**
 * Page Guilde : appartenance, annuaire et candidatures.
 *
 * Toutes les décisions (qui peut accepter, promouvoir, exclure) viennent du SERVEUR, dans
 * `appartenance.peutGerer` / `peutPromouvoir` / `peutDissoudre`. Le front ne rejoue pas la
 * règle des grades : il masque ce qui n'est pas permis, le serveur refuse de toute façon.
 * Les libellés de grade descendent aussi du serveur (`grades`), donc ajouter un grade reste
 * une modification back.
 *
 * Chaque action renvoie l'état frais et complet : aucun rechargement derrière une
 * transition, aucun état deviné côté client.
 */
const ONGLETS = [
    {cle: "guilde", label: "Ma guilde"},
    {cle: "annuaire", label: "Annuaire"},
    {cle: "candidatures", label: "Candidatures"},
];

const GuildePage = (props) => {

    const [etat, setEtat] = useState(null);
    const [annuaire, setAnnuaire] = useState(null);
    const [onglet, setOnglet] = useState("guilde");
    const [recherche, setRecherche] = useState("");
    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
    const [chargement, setChargement] = useState(true);
    const [enCours, setEnCours] = useState(false);

    const moi = authAPI.getUserInfo()?.pseudo;

    const charger = useCallback(() => {
        setChargement(true);
        Promise.all([GuildeApi.etat(), GuildeApi.annuaire()])
            .then(([e, a]) => { setEtat(e); setAnnuaire(a); })
            .catch(() => toast.error("Impossible de charger les guildes."))
            .finally(() => setChargement(false));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    /**
     * Exécute une transition. Le serveur renvoie l'état frais, donc on le pose directement ;
     * l'annuaire est relu en plus parce qu'un départ ou une dissolution le change.
     */
    const agir = async (appel, succes) => {
        setEnCours(true);
        try {
            const frais = await appel();
            setEtat(frais);
            setAnnuaire(await GuildeApi.annuaire());
            if (succes) toast.success(succes);
            // La guilde s'affiche aussi dans la fiche de personnage : on force sa relecture.
            props.updateJoueurState({needRefresh: true});
        } catch (erreur) {
            toast.error(erreur?.response?.data?.message || "Action impossible.");
        } finally {
            setEnCours(false);
        }
    };

    if (chargement) {
        return <div className={styles.page}><div className={styles.frame}>
            <ModalShell iconSrc="/img/icons/flag.png" title="Guilde">
                <div className={styles.loading}><Loader/></div>
            </ModalShell>
        </div></div>;
    }

    const guilde = etat?.guilde;
    const appartenance = etat?.appartenance;
    const config = etat?.config || {};
    const gradesAttribuables = (etat?.grades || []).filter(g => g.attribuable);
    const estMembre = appartenance?.statut === "membre";

    const membresFiltres = (etat?.membres || []).filter(
        m => !recherche.trim() || (m.pseudo || "").toLowerCase().includes(recherche.trim().toLowerCase())
    );

    const sousTitre = guilde
        ? `${guilde.nom} · ${guilde.membres} / ${guilde.placeMax} membres`
        : "Aucune guilde";

    return <div className={styles.page}>
        <div className={styles.frame}>
            <ModalShell iconSrc="/img/icons/flag.png" title="Guilde" subtitle={sousTitre}>
                <div className={styles.onglets}>
                    {ONGLETS.map(item => (
                        <button key={item.cle}
                                type="button"
                                className={`${styles.onglet} ${onglet === item.cle ? styles.ongletActif : ""}`}
                                onClick={() => setOnglet(item.cle)}>
                            {item.label}
                            {item.cle === "candidatures" && etat?.candidatures?.length > 0 &&
                                <span className={styles.pastille}>{etat.candidatures.length}</span>}
                        </button>
                    ))}
                </div>

                {/* ---------------------------------------------------------- Ma guilde */}
                {onglet === "guilde" && (!guilde
                    ? <div className={styles.emptyState}>
                        <Panel variant="soft" padding="lg" radius="lg" className={styles.emptyPanel}>
                            <img className={styles.emptyIcon} src="/img/icons/flag.png" alt=""/>
                            <p className={styles.emptyText}>Vous n'appartenez à aucune guilde.</p>
                            <p className={styles.emptyHint}>
                                Rejoignez-en une depuis l'annuaire, ou fondez la vôtre pour
                                {" "}{(config.coutCreation || 0).toLocaleString("fr-FR")} pièces d'or
                                (niveau {config.niveauMinCreation} requis).
                            </p>
                        </Panel>
                    </div>
                    : <div className={styles.body}>
                        <div className={styles.roster}>
                            <div className={styles.rosterHead}>
                                <span className={styles.rosterBar}/>
                                <span className={styles.rosterTitle}>Membres</span>
                                <span className={styles.rosterCount}>{guilde.membres} / {guilde.placeMax}</span>
                                <div className={styles.search}>
                                    <Glyph name="search" size={15} className={styles.searchIcon}/>
                                    <input className={styles.searchInput}
                                           value={recherche}
                                           placeholder="Rechercher…"
                                           onChange={(e) => setRecherche(e.target.value)}/>
                                </div>
                            </div>

                            <div className={styles.tableHead}>
                                <span>Joueur</span>
                                <span>Grade</span>
                                <span>Classe</span>
                                <span>Niveau</span>
                            </div>

                            <div className={styles.memberList}>
                                {membresFiltres.map(membre => (
                                    <div key={membre.userId}
                                         className={`${styles.memberRow} ${membre.pseudo === moi ? styles.memberRowYou : ""}`}>
                                        <div className={styles.memberIdentity}>
                                            <span className={styles.memberInitial}>
                                                {(membre.pseudo || "?").charAt(0).toUpperCase()}
                                            </span>
                                            <span className={styles.memberName}>
                                                {membre.pseudo}
                                                {membre.pseudo === moi && <span className={styles.youBadge}>Vous</span>}
                                            </span>
                                        </div>
                                        <span className={styles.gradeBadge}>{membre.gradeLabel}</span>
                                        <span className={styles.memberClasse}>{membre.classe || "—"}</span>
                                        <span className={styles.memberLevel}>{membre.niveau ?? "—"}</span>

                                        {membre.pseudo !== moi && (
                                            <div className={styles.actions}>
                                                {appartenance.peutPromouvoir && (
                                                    <select className={styles.gradeSelect}
                                                            value={membre.grade}
                                                            disabled={enCours}
                                                            onChange={(e) => agir(
                                                                () => GuildeApi.promouvoir(membre.userId, e.target.value),
                                                                `${membre.pseudo} est désormais ${e.target.value}.`
                                                            )}>
                                                        {gradesAttribuables.map(g => (
                                                            <option key={g.valeur} value={g.valeur}>{g.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                {appartenance.peutPromouvoir && (
                                                    <button type="button"
                                                            className={styles.actionLien}
                                                            disabled={enCours}
                                                            onClick={() => window.confirm(
                                                                `Transmettre la baronnie à ${membre.pseudo} ? Vous deviendrez officier.`
                                                            ) && agir(
                                                                () => GuildeApi.transmettre(membre.userId),
                                                                "Baronnie transmise."
                                                            )}>
                                                        Transmettre
                                                    </button>
                                                )}
                                                {appartenance.peutGerer && (
                                                    <button type="button"
                                                            className={`${styles.actionLien} ${styles.actionDanger}`}
                                                            disabled={enCours}
                                                            onClick={() => window.confirm(`Exclure ${membre.pseudo} ?`)
                                                                && agir(() => GuildeApi.exclure(membre.userId), `${membre.pseudo} a été exclu.`)}>
                                                        Exclure
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {membresFiltres.length === 0 && <p className={styles.noResult}>Aucun membre ne correspond.</p>}
                            </div>
                        </div>

                        <div className={styles.rail}>
                            <Panel variant="soft" padding="md" radius="lg" className={styles.identity}>
                                <div className={styles.identityHead}>
                                    <div className={styles.emblem}>
                                        <img className={styles.emblemIcon} src="/img/icons/flag.png" alt="Emblème de guilde"/>
                                    </div>
                                    <div className={styles.identityText}>
                                        <span className={styles.guildName}>{guilde.nom}</span>
                                        <div className={styles.badges}>
                                            <span className={styles.levelBadge}>Niveau {guilde.niveau}</span>
                                            <span className={styles.placesBadge}>{guilde.membres} / {guilde.placeMax} places</span>
                                        </div>
                                    </div>
                                </div>
                                {guilde.description && <p className={styles.motto}>« {guilde.description} »</p>}
                                <p className={styles.railMeta}>
                                    Votre grade : <strong>{appartenance.gradeLabel}</strong>
                                    {!estMembre && " (candidature en attente)"}
                                </p>
                            </Panel>

                            <Panel variant="soft" padding="md" radius="lg" className={styles.identity}>
                                <SectionTitle>Actions</SectionTitle>
                                <GameButton disabled={enCours}
                                            onClick={() => window.confirm(estMembre
                                                ? "Quitter cette guilde ?"
                                                : "Retirer votre candidature ?")
                                                && agir(() => GuildeApi.quitter(), estMembre ? "Guilde quittée." : "Candidature retirée.")}>
                                    {estMembre ? "Quitter la guilde" : "Retirer ma candidature"}
                                </GameButton>
                                {appartenance.peutDissoudre && (
                                    <GameButton disabled={enCours}
                                                onClick={() => window.confirm(
                                                    "Dissoudre la guilde ? Tous les membres en seront retirés. C'est irréversible."
                                                ) && agir(() => GuildeApi.dissoudre(), "Guilde dissoute.")}>
                                        Dissoudre la guilde
                                    </GameButton>
                                )}
                            </Panel>
                        </div>
                    </div>)}

                {/* ---------------------------------------------------------- Annuaire */}
                {onglet === "annuaire" && <div className={styles.annuaire}>
                    {annuaire?.message && <p className={styles.emptyHint}>{annuaire.message}</p>}

                    {!guilde && (
                        <Panel variant="soft" padding="lg" radius="lg" className={styles.creation}>
                            <SectionTitle>Fonder une guilde</SectionTitle>
                            <p className={styles.emptyHint}>
                                Coût : {(config.coutCreation || 0).toLocaleString("fr-FR")} pièces d'or ·
                                niveau {config.niveauMinCreation} minimum · un alignement est requis.
                            </p>
                            <input className={styles.champ}
                                   value={nom}
                                   maxLength={config.nomMax}
                                   placeholder={`Nom (${config.nomMin} à ${config.nomMax} caractères)`}
                                   onChange={(e) => setNom(e.target.value)}/>
                            <textarea className={styles.champ}
                                      value={description}
                                      maxLength={config.descriptionMax}
                                      rows={3}
                                      placeholder="Description (facultative)"
                                      onChange={(e) => setDescription(e.target.value)}/>
                            <GameButton disabled={enCours || nom.trim().length < (config.nomMin || 3)}
                                        onClick={() => agir(
                                            () => GuildeApi.creer(nom.trim(), description.trim() || null),
                                            "Guilde fondée !"
                                        )}>
                                Fonder
                            </GameButton>
                        </Panel>
                    )}

                    <div className={styles.tableHead}>
                        <span>Guilde</span>
                        <span>Niveau</span>
                        <span>Membres</span>
                        <span/>
                    </div>
                    <div className={styles.memberList}>
                        {(annuaire?.guildes || []).map(g => (
                            <div key={g.id} className={styles.memberRow}>
                                <div className={styles.memberIdentity}>
                                    <span className={styles.memberName}>{g.nom}</span>
                                </div>
                                <span className={styles.memberLevel}>{g.niveau}</span>
                                <span className={styles.memberClasse}>
                                    {g.membres} / {g.placeMax}{g.complete && " · complète"}
                                </span>
                                <div className={styles.actions}>
                                    {!guilde && (
                                        <button type="button"
                                                className={styles.actionLien}
                                                disabled={enCours}
                                                onClick={() => agir(
                                                    () => GuildeApi.candidater(g.id),
                                                    `Candidature envoyée à « ${g.nom} ».`
                                                )}>
                                            Candidater
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(annuaire?.guildes || []).length === 0 && !annuaire?.message &&
                            <p className={styles.noResult}>Aucune guilde de votre alignement.</p>}
                    </div>
                </div>}

                {/* ------------------------------------------------------ Candidatures */}
                {onglet === "candidatures" && <div className={styles.annuaire}>
                    {!appartenance?.peutGerer
                        ? <p className={styles.emptyHint}>
                            Seuls les officiers et le baron peuvent traiter les candidatures.
                          </p>
                        : (etat.candidatures.length === 0
                            ? <p className={styles.noResult}>Aucune candidature en attente.</p>
                            : <>
                                <div className={styles.tableHead}>
                                    <span>Joueur</span>
                                    <span>Classe</span>
                                    <span>Niveau</span>
                                    <span/>
                                </div>
                                <div className={styles.memberList}>
                                    {etat.candidatures.map(c => (
                                        <div key={c.userId} className={styles.memberRow}>
                                            <div className={styles.memberIdentity}>
                                                <span className={styles.memberInitial}>
                                                    {(c.pseudo || "?").charAt(0).toUpperCase()}
                                                </span>
                                                <span className={styles.memberName}>{c.pseudo}</span>
                                            </div>
                                            <span className={styles.memberClasse}>{c.classe || "—"}</span>
                                            <span className={styles.memberLevel}>{c.niveau ?? "—"}</span>
                                            <div className={styles.actions}>
                                                <button type="button"
                                                        className={styles.actionLien}
                                                        disabled={enCours}
                                                        onClick={() => agir(
                                                            () => GuildeApi.accepter(c.userId),
                                                            `${c.pseudo} rejoint la guilde.`
                                                        )}>
                                                    Accepter
                                                </button>
                                                <button type="button"
                                                        className={`${styles.actionLien} ${styles.actionDanger}`}
                                                        disabled={enCours}
                                                        onClick={() => agir(
                                                            () => GuildeApi.refuser(c.userId),
                                                            "Candidature refusée."
                                                        )}>
                                                    Refuser
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>)}
                </div>}
            </ModalShell>
        </div>
    </div>;
};

export default connect(null, {updateJoueurState})(GuildePage);
