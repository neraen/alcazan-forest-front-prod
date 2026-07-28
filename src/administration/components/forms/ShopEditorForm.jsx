import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ShopMakerApi from "../../services/ShopMakerApi";

const EMPTY_SHOP = {id: 0, name: "", pnjIds: [], equipements: [], consommables: [], objets: []};

/** Résolveurs d'image par section (repli géré par ShopThumb). */
const equipImg = (item) => (item.position && item.icone ? `/img/equipement/${item.position}/${item.icone}` : null);
const consoImg = (item) => (item.icone ? `/img/consommables/${item.icone}` : null);
const objetImg = (item) => (item.image ? `/img/objet/${item.image}` : null);

const SECTIONS = [
    {key: "equipements", label: "Équipements", icon: "🛡️", catalog: "equipements", thumb: equipImg},
    {key: "consommables", label: "Consommables", icon: "🧪", catalog: "consommables", thumb: consoImg},
    {key: "objets", label: "Objets", icon: "📦", catalog: "objets", thumb: objetImg},
];

/** Copie les champs d'un item de référentiel dans une ligne de boutique. */
const toLine = (item) => ({
    itemId: item.id,
    name: item.name,
    icone: item.icone,
    image: item.image,
    position: item.position,
    basePrix: item.basePrix,
    prix: "",
});

export default function ShopEditorForm({shopId, referentiels, onSaved, onDeleted}) {

    const [shop, setShop] = useState(EMPTY_SHOP);
    const [loading, setLoading] = useState(shopId > 0);

    useEffect(() => {
        if (shopId > 0) {
            setLoading(true);
            ShopMakerApi.get(shopId)
                .then(data => setShop({...EMPTY_SHOP, ...data}))
                .catch(() => toast.error("Impossible de charger la boutique."))
                .finally(() => setLoading(false));
        } else {
            setShop(EMPTY_SHOP);
            setLoading(false);
        }
    }, [shopId]);

    const isEdit = Number(shop.id) > 0;

    const togglePnj = (pnjId) => {
        setShop(previous => {
            const has = previous.pnjIds.includes(pnjId);
            return {...previous, pnjIds: has ? previous.pnjIds.filter(id => id !== pnjId) : [...previous.pnjIds, pnjId]};
        });
    };

    const addItem = (sectionKey, itemId) => {
        const id = Number(itemId);
        if (!id) {
            return;
        }
        const item = (referentiels[SECTIONS.find(s => s.key === sectionKey).catalog] || []).find(i => i.id === id);
        if (!item) {
            return;
        }
        setShop(previous => {
            if (previous[sectionKey].some(line => line.itemId === id)) {
                return previous; // déjà présent
            }
            return {...previous, [sectionKey]: [...previous[sectionKey], toLine(item)]};
        });
    };

    const setLinePrix = (sectionKey, itemId, prix) => {
        setShop(previous => ({
            ...previous,
            [sectionKey]: previous[sectionKey].map(line => line.itemId === itemId ? {...line, prix} : line),
        }));
    };

    const removeItem = (sectionKey, itemId) => {
        setShop(previous => ({
            ...previous,
            [sectionKey]: previous[sectionKey].filter(line => line.itemId !== itemId),
        }));
    };

    const handleSave = async () => {
        if (!shop.name.trim()) {
            toast.error("Le nom de la boutique est obligatoire.");
            return;
        }
        const payload = {
            id: shop.id,
            name: shop.name,
            pnjIds: shop.pnjIds,
            equipements: shop.equipements.map(l => ({itemId: l.itemId, prix: l.prix})),
            consommables: shop.consommables.map(l => ({itemId: l.itemId, prix: l.prix})),
            objets: shop.objets.map(l => ({itemId: l.itemId, prix: l.prix})),
        };
        try {
            const saved = await ShopMakerApi.save(payload);
            toast.success(isEdit ? "Boutique modifiée." : "Boutique créée.");
            setShop({...EMPTY_SHOP, ...saved});
            onSaved && onSaved(saved);
        } catch (error) {
            toast.error(error.response?.data?.error || "La sauvegarde a échoué.");
        }
    };

    const handleDelete = async () => {
        if (!isEdit || !window.confirm("Supprimer définitivement cette boutique ?")) {
            return;
        }
        try {
            await ShopMakerApi.remove(shop.id);
            toast.success("Boutique supprimée.");
            onDeleted && onDeleted();
        } catch (error) {
            toast.error(error.response?.data?.error || "La suppression a échoué.");
        }
    };

    if (loading) {
        return <div className="shop-editor">Chargement de la boutique…</div>;
    }

    const shopPnjs = referentiels.pnjs || [];

    return (
        <div className="shop-editor">
            <div className="shop-editor-header">
                <h3>{isEdit ? `Éditer « ${shop.name || "boutique"} »` : "Nouvelle boutique"}</h3>
                <div className="shop-editor-actions">
                    <button type="button" className="shop-btn-primary" onClick={handleSave}>
                        {isEdit ? "Enregistrer" : "Créer la boutique"}
                    </button>
                    {isEdit && <button type="button" className="shop-btn-danger" onClick={handleDelete}>Supprimer</button>}
                </div>
            </div>

            <div className="field-group">
                <label>Nom de la boutique</label>
                <input value={shop.name} onChange={(e) => setShop(p => ({...p, name: e.target.value}))}/>
            </div>

            <div className="shop-pnj-block">
                <label>PNJ marchand(s) tenant cette boutique</label>
                {shopPnjs.length === 0
                    ? <p className="shop-muted">Aucun PNJ de type « shop ». Crée-en un dans le PnjMaker.</p>
                    : (
                        <div className="shop-pnj-list">
                            {shopPnjs.map(pnj => {
                                const assignedElsewhere = pnj.shopId && pnj.shopId !== shop.id;
                                return (
                                    <label key={pnj.id} className="shop-pnj-item">
                                        <input type="checkbox" checked={shop.pnjIds.includes(pnj.id)} onChange={() => togglePnj(pnj.id)}/>
                                        <span>{pnj.name}</span>
                                        {assignedElsewhere && !shop.pnjIds.includes(pnj.id) &&
                                            <span className="shop-pnj-warn">déjà lié à une autre boutique</span>}
                                    </label>
                                );
                            })}
                        </div>
                    )}
            </div>

            <div className="shop-sections">
                {SECTIONS.map(section => (
                    <ShopSection
                        key={section.key}
                        section={section}
                        lines={shop[section.key]}
                        catalog={referentiels[section.catalog] || []}
                        onAdd={(itemId) => addItem(section.key, itemId)}
                        onSetPrix={(itemId, prix) => setLinePrix(section.key, itemId, prix)}
                        onRemove={(itemId) => removeItem(section.key, itemId)}
                    />
                ))}
            </div>
        </div>
    );
}

/** Une section de vente (équipement / consommable / objet). */
function ShopSection({section, lines, catalog, onAdd, onSetPrix, onRemove}) {
    const available = catalog.filter(item => !lines.some(line => line.itemId === item.id));

    return (
        <div className="shop-section">
            <div className="shop-section-head">
                <span className="shop-section-title">{section.icon} {section.label}</span>
                <span className="shop-section-count">{lines.length}</span>
            </div>

            <div className="shop-section-lines">
                {lines.length === 0 && <div className="shop-muted">Aucun article dans cette section.</div>}
                {lines.map(line => (
                    <div key={line.itemId} className="shop-line">
                        <ShopThumb src={section.thumb(line)} alt={line.name}/>
                        <span className="shop-line-name">{line.name}</span>
                        <div className="shop-line-price">
                            <input
                                type="number"
                                min="0"
                                placeholder={line.basePrix ? `${line.basePrix}` : "prix"}
                                value={line.prix ?? ""}
                                onChange={(e) => onSetPrix(line.itemId, e.target.value)}
                            />
                            <span className="shop-coin">or</span>
                        </div>
                        <button type="button" className="shop-line-remove" onClick={() => onRemove(line.itemId)} title="Retirer">✕</button>
                    </div>
                ))}
            </div>

            <select className="shop-add-select" value="" onChange={(e) => onAdd(e.target.value)}>
                <option value="">+ Ajouter un article…</option>
                {available.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
        </div>
    );
}

/** Vignette d'article avec repli. */
function ShopThumb({src, alt}) {
    const [broken, setBroken] = useState(false);
    useEffect(() => setBroken(false), [src]);
    if (!src || broken) {
        return <span className="shop-thumb shop-thumb-empty" aria-hidden="true">✦</span>;
    }
    return <img className="shop-thumb" src={src} alt={alt} onError={() => setBroken(true)}/>;
}
