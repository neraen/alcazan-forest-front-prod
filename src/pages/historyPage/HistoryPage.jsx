import React from 'react'
import HistoriqueApi from "../../services/HistoriqueApi";
import UsersApi from "../../services/UsersApi";
import Loader from "../../components/loader/Loader";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Panel from "../../components/ui/panel/Panel";
import Glyph from "../../components/ui/glyphs/Glyph";
import styles from "./HistoryPage.module.scss";

/**
 * Journal d'aventure (maquette design/react/HistoryModal) : chronologie groupée
 * par jour à droite, résumé + filtres à gauche. Les données du jeu ne portent
 * que message / date / isExternal : les deux catégories réelles sont
 * « Mes actions » et « Subis » (pas de fausses catégories).
 */

const FILTERS = [
    {key: "tout", label: "Tout"},
    {key: "actions", label: "Mes actions"},
    {key: "subis", label: "Subis"},
];

// Découpe les <br/> que le back insère dans les messages (texte, pas d'HTML injecté).
const messageLines = (message) => (message || "").split(/<br\s*\/?>/).map(l => l.trim()).filter(Boolean);

const parseDate = (row) => new Date((row.date?.date || "").replace(" ", "T"));

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
            user: {},
            filter: "tout",
            query: "",
        }
    }

    async componentDidMount() {
        const [historiqueInfos, user] = await Promise.all([
            HistoriqueApi.fetchHistoryData(),
            UsersApi.find(),
        ]);
        this.setState({loading: false, rows: historiqueInfos.rows || [], user});
    }

    filteredRows() {
        const {rows, filter, query} = this.state;
        const q = query.trim().toLowerCase();
        return rows.filter(row => {
            if (filter === "actions" && row.isExternal) return false;
            if (filter === "subis" && !row.isExternal) return false;
            if (q && !(row.message || "").toLowerCase().includes(q)) return false;
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
        const lines = messageLines(row.message);
        const catClass = row.isExternal ? styles.catSubi : styles.catAction;
        return (
            <div key={index} className={`${styles.eventRow} ${catClass}`}>
                <div className={styles.eventIcon}>
                    <Glyph name={row.isExternal ? "shield" : "sword"} size={23}/>
                </div>
                <div className={styles.eventBody}>
                    {lines.map((line, i) => (
                        <p key={i} className={styles.eventText}>{line}</p>
                    ))}
                    <div className={styles.eventMeta}>
                        <span className={styles.eventTag}>{row.isExternal ? "Subi" : "Action"}</span>
                        <span className={styles.eventTime}>
                            {date.toLocaleTimeString("fr-FR")}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    render(){
        const {loading, rows, user, filter} = this.state;
        const filtered = this.filteredRows();
        const countFor = (key) => key === "tout" ? rows.length
            : rows.filter(row => key === "actions" ? !row.isExternal : row.isExternal).length;
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
                                            {FILTERS.map(f => (
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
                                </aside>

                                {/* Chronologie */}
                                <div className={styles.feed}>
                                    <div className={styles.feedHead}>
                                        <span className={styles.feedBar}/>
                                        <span className={styles.feedTitle}>Chronologie</span>
                                        <span className={styles.feedCount}>
                                            {FILTERS.find(f => f.key === filter).label} · {filtered.length} entrées
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
