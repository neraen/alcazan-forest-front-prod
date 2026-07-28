import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import ShopMakerApi from "../services/ShopMakerApi";
import AdminCatalog from "../components/AdminCatalog";
import ShopEditorForm from "../components/forms/ShopEditorForm";

const ShopMakerPage = () => {

    const [shops, setShops] = useState([]);
    const [referentiels, setReferentiels] = useState(null);
    const [selectedId, setSelectedId] = useState(0);

    const loadShops = () => ShopMakerApi.list().then(setShops);

    useEffect(() => {
        Promise.all([ShopMakerApi.list(), ShopMakerApi.referentiels()])
            .then(([shopList, refs]) => {
                setShops(shopList);
                setReferentiels(refs);
            })
            .catch(() => toast.error("Impossible de charger le ShopMaker."));
    }, []);

    if (!referentiels) {
        return <h1>Chargement du ShopMaker…</h1>;
    }

    return (
        <>
            <h1>Boutiques</h1>
            <AdminCatalog
                items={shops}
                selectedId={selectedId}
                onSelect={setSelectedId}
                getName={(shop) => shop.name}
                getMeta={(shop) => `${shop.pnjName || "aucun PNJ"} · ${shop.nbItems} article(s)`}
                newLabel="+ Créer une boutique"
            >
                <ShopEditorForm
                    key={selectedId}
                    shopId={selectedId}
                    referentiels={referentiels}
                    onSaved={(saved) => loadShops().then(() => setSelectedId(saved.id))}
                    onDeleted={() => loadShops().then(() => setSelectedId(0))}
                />
            </AdminCatalog>
        </>
    );
};

export default ShopMakerPage;
