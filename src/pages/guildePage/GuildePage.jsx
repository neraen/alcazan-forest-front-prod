import React from 'react'
import { connect } from "react-redux";
import {updateJoueurState} from "../../store/actions";
import GuildeApi from "../../services/GuildeApi";
import authAPI from "../../services/authAPI";
import Loader from "../../components/loader/Loader";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Glyph from "../../components/ui/glyphs/Glyph";
import Panel from "../../components/ui/panel/Panel";
import styles from "./GuildePage.module.scss";

/**
 * Page Guilde (maquette design/guilde/GuildModal) : roster des membres à gauche
 * (recherche client, grade / classe / niveau réels), identité de la guilde à
 * droite. Les sections sans données côté jeu (objectifs, journal, trésor,
 * statut de présence) ne sont pas affichées.
 */

const GRADE_CLASSES = {
    "Maître de guilde": "gradeMaitre",
    "Sénéchal": "gradeSenechal",
    "Chevalier": "gradeChevalier",
    "Baron": "gradeBaron",
    "Écuyer": "gradeEcuyer",
    "Recrue": "gradeRecrue",
};

const CLASS_CLASSES = {
    archer: "classeArcher",
    guerrier: "classeGuerrier",
    sorcier: "classeSorcier",
    moine: "classeMoine",
    gueux: "classeGueux",
};

class GuildePage extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            message: "",
            joueurs: [],
            infos: null,
            query: "",
        }
    }

    async componentDidMount() {
        const guildeInfos = await GuildeApi.fetchGuildeData();
        this.setState({
            loading: false,
            message: guildeInfos.message,
            joueurs: guildeInfos.joueurs || [],
            infos: guildeInfos.infos && guildeInfos.infos.nom ? guildeInfos.infos : null,
        });
    }

    filteredJoueurs() {
        const query = this.state.query.trim().toLowerCase();
        if (!query) return this.state.joueurs;
        return this.state.joueurs.filter(joueur => (joueur.pseudo || "").toLowerCase().includes(query));
    }

    renderMember(joueur) {
        const isYou = joueur.pseudo === authAPI.getUserInfo().pseudo;
        const gradeClass = styles[GRADE_CLASSES[joueur.grade]] || styles.gradeRecrue;
        const classeClass = styles[CLASS_CLASSES[joueur.classeName]] || styles.classeGueux;
        return (
            <div key={joueur.pseudo} className={`${styles.memberRow} ${isYou ? styles.memberRowYou : ""}`}>
                <div className={styles.memberIdentity}>
                    <span className={`${styles.memberInitial} ${classeClass}`}>
                        {(joueur.pseudo || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.memberName}>
                        {joueur.pseudo}
                        {isYou && <span className={styles.youBadge}>Vous</span>}
                    </span>
                </div>
                <span className={`${styles.gradeBadge} ${gradeClass}`}>{joueur.grade}</span>
                <span className={`${styles.memberClasse} ${classeClass}`}>{joueur.classeName}</span>
                <span className={styles.memberLevel}>{joueur.niveau}</span>
            </div>
        );
    }

    renderContent() {
        const {infos, joueurs} = this.state;

        if (!infos) {
            return (
                <div className={styles.emptyState}>
                    <Panel variant="soft" padding="lg" radius="lg" className={styles.emptyPanel}>
                        <img className={styles.emptyIcon} src="/img/icons/flag.png" alt=""/>
                        <p className={styles.emptyText}>{this.state.message || "Vous n'avez pas de guilde."}</p>
                        <p className={styles.emptyHint}>
                            Rendez-vous auprès d'un maître de guilde pour en rejoindre une.
                        </p>
                    </Panel>
                </div>
            );
        }

        return (
            <div className={styles.body}>
                {/* Roster */}
                <div className={styles.roster}>
                    <div className={styles.rosterHead}>
                        <span className={styles.rosterBar}/>
                        <span className={styles.rosterTitle}>Membres</span>
                        <span className={styles.rosterCount}>{joueurs.length} / {infos.placeMax}</span>
                        <div className={styles.search}>
                            <Glyph name="search" size={15} className={styles.searchIcon}/>
                            <input className={styles.searchInput} value={this.state.query}
                                   onChange={(e) => this.setState({query: e.target.value})}
                                   placeholder="Rechercher"/>
                        </div>
                    </div>

                    <div className={styles.tableHead}>
                        <span>Membre</span>
                        <span>Grade</span>
                        <span>Classe</span>
                        <span>Niveau</span>
                    </div>

                    <div className={styles.memberList}>
                        {this.filteredJoueurs().map(joueur => this.renderMember(joueur))}
                        {this.filteredJoueurs().length === 0 && (
                            <p className={styles.noResult}>Aucun membre ne correspond.</p>
                        )}
                    </div>
                </div>

                {/* Identité */}
                <div className={styles.rail}>
                    <Panel variant="soft" padding="md" radius="lg" className={styles.identity}>
                        <div className={styles.identityHead}>
                            <div className={styles.emblem}>
                                <img className={styles.emblemIcon} src="/img/icons/flag.png" alt="Emblème de guilde"/>
                            </div>
                            <div className={styles.identityText}>
                                <span className={styles.guildName}>{infos.nom}</span>
                                <div className={styles.badges}>
                                    <span className={styles.levelBadge}>Niveau {infos.niveau}</span>
                                    <span className={styles.placesBadge}>{joueurs.length} / {infos.placeMax} places</span>
                                </div>
                            </div>
                        </div>
                        {infos.description && (
                            <p className={styles.motto}>« {infos.description} »</p>
                        )}
                    </Panel>
                </div>
            </div>
        );
    }

    render(){
        const {infos, joueurs, loading} = this.state;
        const subtitle = infos ? `${infos.nom} · ${joueurs.length} membres` : "";

        return (
            <div className={styles.page}>
                <div className={styles.frame}>
                    <ModalShell iconSrc="/img/icons/flag.png" title="Guilde" subtitle={subtitle}>
                        {loading
                            ? <div className={styles.loading}><Loader/></div>
                            : this.renderContent()}
                    </ModalShell>
                </div>
            </div>
        )
    }
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(GuildePage)
