import React, {useEffect, useMemo, useState} from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../store/actions";
import InventaireApi from "../../../services/InventaireApi";
import UsersApi from "../../../services/UsersApi";
import carateristiqueService from "../../../services/carateristiqueService";
import Loader from "../../loader/Loader";
import Glyph from "../../ui/glyphs/Glyph";
import ModalShell from "../../ui/gameModal/ModalShell";
import CharacterPanel from "./CharacterPanel";
import ItemDetailBar from "./ItemDetailBar";
import ItemTooltip from "./ItemTooltip";
import ConsommableContextMenu from "./ConsommableContextMenu";
import {normalizeConsommable, normalizeEquipement, normalizeObjet, rarityClass} from "./itemUtils";
import styles from "./InventoryScreen.module.scss";

/**
 * Écran d'inventaire (maquette design/inventaire) : sac filtrable (onglets +
 * recherche) à gauche, fiche personnage (paperdoll + bonus) à droite, barre de
 * détail en pied. Utilisé en pleine page (/inventaire) et en modale (SideMenu).
 * Actions branchées sur les APIs existantes : équiper / retirer un équipement,
 * placer un consommable sur un des deux emplacements de la barre de sorts.
 */

const TABS = [
    {id: "tous", label: "Tout", icon: "/img/menu/infini.png"},
    {id: "equipement", label: "Équip.", icon: "/img/menu/epee.png"},
    {id: "consommable", label: "Conso.", icon: "/img/menu/potion.png"},
    {id: "objet", label: "Objets", icon: "/img/menu/buches.png"},
];

const InventoryScreen = ({onClose, updateJoueurState}) => {

    const [loading, setLoading] = useState(true);
    const [inventaire, setInventaire] = useState({equipements: [], consommables: [], objets: []});
    const [equipementEquipe, setEquipementEquipe] = useState([]);
    const [barConsommables, setBarConsommables] = useState([]);
    const [user, setUser] = useState({});

    const [tab, setTab] = useState("tous");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [hover, setHover] = useState(null);      // {item, x, y}
    const [menu, setMenu] = useState(null);        // {item, x, y}

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        const [dataInventaire, dataEquipe, dataConsommables, dataUser] = await Promise.all([
            InventaireApi.getPlayerInventaire(),
            InventaireApi.getEquipementEquipe(),
            UsersApi.getPlayerConsommables(),
            UsersApi.find(),
        ]);
        setInventaire(dataInventaire);
        setEquipementEquipe(dataEquipe);
        setBarConsommables(dataConsommables);
        setUser(dataUser);
        setLoading(false);
    };

    const refreshItems = async () => {
        const [dataInventaire, dataEquipe] = await Promise.all([
            InventaireApi.getPlayerInventaire(),
            InventaireApi.getEquipementEquipe(),
        ]);
        setInventaire(dataInventaire);
        setEquipementEquipe(dataEquipe);
    };

    const items = useMemo(() => [
        ...(inventaire.equipements || []).map(e => normalizeEquipement(e)),
        ...(inventaire.consommables || []).map(normalizeConsommable),
        ...(inventaire.objets || []).map(normalizeObjet),
    ], [inventaire]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = tab === "tous" ? items : items.filter(item => item.cat === tab);
        if (q) list = list.filter(item => (item.name || "").toLowerCase().includes(q));
        return list;
    }, [items, tab, query]);

    const bonus = useMemo(
        () => carateristiqueService.computeEquipementCaracs(equipementEquipe),
        [equipementEquipe]
    );

    // Occupants des deux emplacements de la barre de sorts (positions 1 et 2).
    const consommableSlots = useMemo(() => {
        const slots = [null, null];
        (barConsommables || []).forEach(c => {
            if (c.position >= 1 && c.position <= 2) slots[c.position - 1] = c;
        });
        return slots;
    }, [barConsommables]);

    // Équiper / retirer : le back refuse (400) ce qui casserait l'inventaire — on montre son
    // message plutôt que d'échouer en silence, et on resynchronise dans tous les cas.
    const handleEquip = async (item) => {
        try {
            await InventaireApi.wearEquipement(item.id);
            toast.success(`${item.name} équipé.`);
        } catch (error) {
            toast.error(error.response?.data?.error || "Impossible d'équiper cet objet.");
        }
        setSelected(null);
        await refreshItems();
    };

    const handleUnequip = async (item) => {
        try {
            await InventaireApi.unwearEquipement(item.id);
            toast.success(`${item.name} retiré.`);
        } catch (error) {
            toast.error(error.response?.data?.error || "Impossible de retirer cet objet.");
        }
        setSelected(null);
        await refreshItems();
    };

    const handleEquipConsommable = async (item, position) => {
        const updated = await UsersApi.equipConsommable(item.id, position);
        setBarConsommables(updated);
        // Rafraîchit la barre de sorts vivante sous la carte.
        updateJoueurState({consommableBarVersion: Date.now()});
    };

    const actionForSelected = () => {
        if (!selected) return {};
        if (selected.equipped) return {actionLabel: "Retirer", onAction: () => handleUnequip(selected)};
        if (selected.cat === "equipement") return {actionLabel: "Équiper", onAction: () => handleEquip(selected)};
        return {};
    };

    const totalCount = items.reduce((total, item) => total + item.qty, 0);

    if (loading) {
        return (
            <ModalShell iconSrc="/img/menu/infini.png" title="Inventaire" onClose={onClose}>
                <div className={styles.loading}><Loader/></div>
            </ModalShell>
        );
    }

    const currencies = <>
        <span className={styles.currency}>
            <img className={styles.currencyIcon} src="/img/gui/Money03.png" alt="Or"/>
            <span className={styles.currencyGold}>{user.money}</span>
        </span>
        <span className={styles.currency}>
            <img className={styles.currencyIcon} src="/img/gui/10.png" alt="PA"/>
            <span className={styles.currencyPa}>{user.actionPoint}</span>
        </span>
        <span className={styles.currency}>
            <img className={styles.currencyIcon} src="/img/gui/36.png" alt="PM"/>
            <span className={styles.currencyPm}>{user.mouvementPoint}</span>
        </span>
    </>;

    return (
        <ModalShell iconSrc="/img/menu/infini.png" title="Inventaire"
                    subtitle={`${totalCount} objets`} headerRight={currencies}
                    onClose={onClose}
                    footer={<ItemDetailBar item={selected} {...actionForSelected()}
                                           consommableSlots={consommableSlots}
                                           onEquipConsommable={selected && selected.cat === "consommable"
                                               ? (position) => handleEquipConsommable(selected, position)
                                               : undefined}/>}>
            {/* Corps */}
            <div className={styles.body}>
                {/* Sac */}
                <div className={styles.bag}>
                    <div className={styles.tabs}>
                        {TABS.map(t => {
                            const count = t.id === "tous"
                                ? items.length
                                : items.filter(item => item.cat === t.id).length;
                            return (
                                <button key={t.id} type="button"
                                        className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                                        onClick={() => setTab(t.id)}>
                                    <img className={styles.tabIcon} src={t.icon} alt=""/>
                                    <span className={styles.tabLabel}>{t.label}</span>
                                    <span className={styles.tabCount}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.search}>
                        <Glyph name="search" size={20} className={styles.searchIcon}/>
                        <input className={styles.searchInput} value={query}
                               onChange={(e) => setQuery(e.target.value)}
                               placeholder="Rechercher un objet…"/>
                    </div>

                    <div className={styles.gridScroll} onScroll={() => setHover(null)}>
                        <div className={styles.grid}>
                            {filtered.map(item => {
                                const isSelected = selected && selected.key === item.key;
                                return (
                                    <button key={item.key} type="button"
                                            className={[
                                                styles.cell,
                                                styles[rarityClass(item.rarity)],
                                                isSelected ? styles.cellSelected : "",
                                            ].filter(Boolean).join(" ")}
                                            onClick={() => setSelected(item)}
                                            onDoubleClick={item.cat === "equipement" ? () => handleEquip(item) : undefined}
                                            onContextMenu={item.cat === "consommable" ? (e) => {
                                                e.preventDefault();
                                                setSelected(item);
                                                setHover(null);
                                                setMenu({item, x: e.clientX, y: e.clientY});
                                            } : undefined}
                                            onMouseEnter={(e) => setHover({item, x: e.clientX, y: e.clientY})}
                                            onMouseMove={(e) => setHover(h => h && h.item.key === item.key ? {item, x: e.clientX, y: e.clientY} : h)}
                                            onMouseLeave={() => setHover(h => h && h.item.key === item.key ? null : h)}>
                                        <span className={styles.rarityDot}/>
                                        <img className={styles.cellIcon} src={item.img} alt={item.name}/>
                                        {item.qty > 1 && <span className={styles.qty}>{item.qty}</span>}
                                    </button>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className={styles.emptyBag}>Aucun objet dans cette catégorie.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fiche personnage */}
                <div className={styles.character}>
                    <div className={styles.characterHeader}>
                        <span className={styles.characterBar}/>
                        <span className={styles.characterTitle}>Équipement</span>
                        <span className={styles.characterMeta}>{user.pseudo} · Niv. {user.niveau}</span>
                    </div>
                    <CharacterPanel
                        character={user}
                        equipements={equipementEquipe}
                        selectedKey={selected ? selected.key : null}
                        onSelect={setSelected}
                        onUnequip={handleUnequip}
                        onHover={(item, e) => setHover({item, x: e.clientX, y: e.clientY})}
                        onHoverEnd={() => setHover(null)}
                        stats={bonus}
                    />
                </div>
            </div>

            {hover && !menu && <ItemTooltip item={hover.item} x={hover.x} y={hover.y}/>}
            {menu && (
                <ConsommableContextMenu item={menu.item} x={menu.x} y={menu.y} slots={consommableSlots}
                                        onPick={(position) => { handleEquipConsommable(menu.item, position); setMenu(null); }}
                                        onClose={() => setMenu(null)}/>
            )}
        </ModalShell>
    );
}

export default connect(null, {updateJoueurState})(InventoryScreen)
