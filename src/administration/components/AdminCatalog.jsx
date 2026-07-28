import React, {useEffect, useMemo, useState} from 'react';

/**
 * Catalogue admin réutilisable (maker de contenu) : rail gauche = recherche +
 * liste visuelle (vignette + nom + méta), zone principale = aperçu de
 * l'élément sélectionné puis le formulaire (children).
 *
 * Sélection pilotée par le parent : un id d'élément existant, ou 0 = création.
 */
export default function AdminCatalog({
    items = [],
    selectedId,
    onSelect,
    getId = (i) => i.id,
    getName = (i) => i.name,
    getThumb,
    getMeta,
    renderPreview,
    newLabel = '+ Nouveau',
    children,
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return items;
        }
        return items.filter(item => String(getName(item) || '').toLowerCase().includes(q));
    }, [items, query, getName]);

    const isNew = String(selectedId) === '0' || selectedId === null || selectedId === undefined;
    const selected = isNew ? null : items.find(item => String(getId(item)) === String(selectedId));

    return (
        <div className="admin-catalog">
            <aside className="admin-catalog-rail">
                <button
                    type="button"
                    className={`admin-catalog-new${isNew ? ' selected' : ''}`}
                    onClick={() => onSelect(0)}
                >
                    {newLabel}
                </button>
                <input
                    className="admin-catalog-search"
                    type="search"
                    placeholder="Rechercher…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <div className="admin-catalog-list">
                    {filtered.length === 0 && <div className="admin-catalog-empty">Aucun élément.</div>}
                    {filtered.map(item => {
                        const id = getId(item);
                        return (
                            <button
                                type="button"
                                key={id}
                                className={`admin-catalog-item${String(id) === String(selectedId) ? ' selected' : ''}`}
                                onClick={() => onSelect(id)}
                            >
                                <CatalogThumb src={getThumb ? getThumb(item) : null} alt={getName(item)}/>
                                <span className="admin-catalog-item-body">
                                    <span className="admin-catalog-item-name">{getName(item) || <em>Sans nom</em>}</span>
                                    {getMeta && <span className="admin-catalog-item-meta">{getMeta(item)}</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <section className="admin-catalog-main">
                {selected && renderPreview && (
                    <div className="admin-catalog-preview">{renderPreview(selected)}</div>
                )}
                <div className="admin-catalog-form">{children}</div>
            </section>
        </div>
    );
}

/** Vignette avec repli si l'image est absente ou cassée. */
function CatalogThumb({src, alt}) {
    const [broken, setBroken] = useState(false);

    // Réinitialise l'état « cassé » quand la source change (sinon un repli reste collé).
    useEffect(() => setBroken(false), [src]);

    if (!src || broken) {
        return <span className="admin-catalog-thumb admin-catalog-thumb-empty" aria-hidden="true">✦</span>;
    }

    return <img className="admin-catalog-thumb" src={src} alt={alt} onError={() => setBroken(true)}/>;
}
