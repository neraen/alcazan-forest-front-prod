import React from 'react'
import HistoriqueApi from "../../services/HistoriqueApi";
import UsersApi from "../../services/UsersApi";
import Loader from "../../components/loader/Loader";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Panel from "../../components/ui/panel/Panel";
import Glyph from "../../components/ui/glyphs/Glyph";
import styles from "./HistoryPage.module.scss";

/**
 * Journal d'aventure : chronologie groupée par jour à droite, résumé + filtres à gauche.
 *
 * Les entrées sont désormais des ÉVÉNEMENTS TYPÉS (`evenement_jeu`) et non plus des phrases
 * libres : la page peut donc enfin filtrer par CATÉGORIE. C'est ce que `docs/REFONTE_PLAN.md`
 * (phase 6) avait refusé d'inventer faute de typage côté back — « Mes actions / Subis » était
 * alors la seule classification honnête possible.
 *
 * ⚠️ Les catégories viennent du SERVEUR (`categories` dans la réponse) : aucune n'est en dur
 * ici, y compris « Archives », qui désigne les anciennes lignes libres conservées telles
 * quelles. Ajouter une catégorie reste une modification back.
 */

const NATURES = [
    {key: "tout", label: "Tout"},
    {key: "actions", label: "Mes actions"},
    {key: "subis", label: "Subis"},
];

const parseDate = (row) => new Date((row.date || "").replace(" ", "T"));

const dayKey = (date) => date.toISOString ? date.toISOString().slice(0, 10) : "";

const dayLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    if (dayKey(date) === dayKey(today)) return "Aujourd'hui";
    if (dayKey(date) === dayKey(yesterday)) return "Hier";
    return date.toLocaleDateString("fr-FR", {day: "numeric", month: "long", year: "numeric"});
};

class HistoryPage extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: [],
            categories: [],
            user: {},
            filter: "tout",
            categorie: "toutes",
            query: "",
        }
    }

    async componentDidMount() {
        const [historiqueInfos, user] = await Promise.all([
            HistoriqueApi.fetchHistoryData(),
            UsersApi.find(),
        ]);
        this.setState({
            loading: false,
            rows: historiqueInfos.rows || [],
            categories: historiqueInfos.categories || [],
            user,
        });
    }

    filteredRows() {
        const {rows, filter, categorie, query} = this.state;
        const q = query.trim().toLowerCase();
        return rows.filter(row => {
            if (filter === "actions" && row.subi) return false;
            if (filter === "subis" && !row.subi) return false;
            if (categorie !== "toutes" && row.categorie !== categorie) return false;
            if (q && !(row.phrase || "").toLowerCase().includes(q)) return false;
            return true;
        });
    }

    groupedByDay() {
        const groups = [];
        this.filteredRows().forEach(row => {
            const date = parseDate(row);
            const key = dayKey(date);
            let group = groups.find(g => g.key === key);
            if (!group) {
                group = {key, label: dayLabel(date), rows: []};
                groups.push(group);
            }
            group.rows.push(row);
        });
        return groups;
    }

    renderRow(row, index) {
        const date = parseDate(row);
        const catClass = row.subi ? styles.catSubi : styles.catAction;
        return (
            <div key={index} className={`${styles.eventRow} ${catClass}`}>
                <div className={styles.eventIcon}>
                    <Glyph name={row.subi ? "shield" : "sword"} size={23}/>
                </div>
                <div className={styles.eventBody}>
                    <p className={styles.eventText}>{row.phrase}</p>
                    <div className={styles.eventMeta}>
                        <span className={styles.eventTag}>{row.subi ? "Subi" : "Action"}</span>
                        <span className={styles.eventCategorie}>{row.categorieLabel}</span>
                        {/* Le type précis n'existe pas pour les lignes héritées. */}
                        {row.typeLabel && <span className={styles.eventType}>{row.typeLabel}</span>}
                        <span className={styles.eventTime}>
                            {date.toLocaleTimeString("fr-FR")}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    render(){
        const {loading, rows, user, filter, categorie, categories} = this.state;
        const filtered = this.filteredRows();
        const countFor = (key) => key === "tout" ? rows.length
            : rows.filter(row => key === "actions" ? !row.subi : row.subi).length;
        const countCategorie = (valeur) => valeur === "toutes"
            ? rows.length
            : rows.filter(row => row.categorie === valeur).length;
        const todayCount = rows.filter(row => dayKey(parseDate(row)) === dayKey(new Date())).length;

        const summaryTiles = [
            {label: "Événements", value: rows.length, className: styles.catAction},
            {label: "Aujourd'hui", value: todayCount, className: styles.catGold},
            {label: "Mes actions", value: countFor("actions"), className: styles.catAction},
            {label: "Subis", value: countFor("subis"), className: styles.catSubi},
        ];

        return (
            <div className={styles.page}>
                <div className={styles.frame}>
                    <ModalShell iconSrc="/img/icons/book.png" title="Historique"
                                subtitle={user.pseudo ? `${user.pseudo} · niveau ${user.niveau} · ${rows.length} événements consignés` : ""}>
                        {loading ? <div className={styles.loading}><Loader/></div> : (
                            <div className={styles.body}>
                                {/* Rail gauche */}
                                <aside className={styles.rail}>
                                    <Panel variant="soft" padding="md" radius="lg" className={styles.card}>
                                        <div className={styles.cardHead}>
                                            <span className={styles.cardBar}/>
                                            <span className={styles.cardTitle}>Résumé</span>
                                        </div>
                                        <div className={styles.summaryGrid}>
                                            {summaryTiles.map(tile => (
                                                <div key={tile.label} className={`${styles.summaryTile} ${tile.className}`}>
                                                    <span className={styles.summaryValue}>{tile.value}</span>
                                                    <span className={styles.summaryLabel}>{tile.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>

                                    <Panel variant="soft" padding="md" radius="lg" className={styles.card}>
                                        <div className={styles.cardHead}>
                                            <span className={styles.cardBar}/>
                                            <span className={styles.cardTitle}>Filtrer</span>
                                        </div>
                                        <div className={styles.filters}>
                                            {NATURES.map(f => (
                                                <button key={f.key} type="button"
                                                        className={`${styles.filter} ${filter === f.key ? styles.filterActive : ""}`}
                                                        onClick={() => this.setState({filter: f.key})}>
                                                    <span className={`${styles.filterDot} ${f.key === "subis" ? styles.catSubi : f.key === "actions" ? styles.catAction : styles.catGold}`}/>
                                                    <span className={styles.filterLabel}>{f.label}</span>
                                                    <span className={styles.filterCount}>{countFor(f.key)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </Panel>

                                    <Panel variant="soft" padding="md" radius="lg" className={styles.card}>
                                        <div className={styles.cardHead}>
                                            <span className={styles.cardBar}/>
                                            <span className={styles.cardTitle}>Catégorie</span>
                                        </div>
                                        <div className={styles.filters}>
                                            {[{valeur: "toutes", label: "Toutes"}, ...categories].map(c => (
                                                <button key={c.valeur} type="button"
                                                        className={`${styles.filter} ${categorie === c.valeur ? styles.filterActive : ""}`}
                                                        onClick={() => this.setState({categorie: c.valeur})}>
                                                    <span className={`${styles.filterDot} ${styles["cat_" + c.valeur] || styles.catGold}`}/>
                                                    <span className={styles.filterLabel}>{c.label}</span>
                                                    <span className={styles.filterCount}>{countCategorie(c.valeur)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </Panel>
                                </aside>

                                {/* Chronologie */}
                                <div className={styles.feed}>
                                    <div className={styles.feedHead}>
                                        <span className={styles.feedBar}/>
                                        <span className={styles.feedTitle}>Chronologie</span>
                                        <span className={styles.feedCount}>
                                            {NATURES.find(f => f.key === filter).label} · {filtered.length} entrées
                                        </span>
                                        <div className={styles.search}>
                                            <Glyph name="search" size={15} className={styles.searchIcon}/>
                                            <input className={styles.searchInput} value={this.state.query}
                                                   onChange={(e) => this.setState({query: e.target.value})}
                                                   placeholder="Rechercher"/>
                                        </div>
                                    </div>
                                    <div className={styles.feedScroll}>
                                        {this.groupedByDay().map(group => (
                                            <React.Fragment key={group.key}>
                                                <div className={styles.daySeparator}>
                                                    <span className={styles.dayLabel}>{group.label}</span>
                                                    <span className={styles.dayLine}/>
                                                    <span className={styles.dayCount}>{group.rows.length} évén.</span>
                                                </div>
                                                {group.rows.map((row, index) => this.renderRow(row, group.key + index))}
                                            </React.Fragment>
                                        ))}
                                        {filtered.length === 0 && (
                                            <p className={styles.noResult}>Aucun événement dans votre journal.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModalShell>
                </div>
            </div>
        )
    }
}

export default HistoryPage;
