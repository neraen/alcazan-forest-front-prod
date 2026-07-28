import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import pnjApi from "../../services/pnjApi";
import AdminCatalog from "../components/AdminCatalog";
import CreatePnjForm from "../components/forms/CreatePnjForm";

const EMPTY_PNJ = {id: 0, name: "", avatar: "", skin: "", description: "", type: "action"};

/** Ajoute .png si le nom de fichier n'a pas d'extension (valeurs hétérogènes en base). */
const withExt = (file) => (file && !file.includes(".") ? `${file}.png` : file);

/** Image d'un PNJ : on privilégie le skin (sprite de carte, fichiers présents), sinon l'avatar. */
const pnjThumb = (pnj) => {
    const file = withExt(pnj.skin) || withExt(pnj.avatar);
    return file ? `/img/pnj/${file}` : null;
};

const PnjMakerPage = () => {

    const [pnjs, setPnjs] = useState([]);
    const [selectedId, setSelectedId] = useState(0);

    const load = () => pnjApi.list().then(setPnjs);

    useEffect(() => {
        load().catch(() => toast.error("Impossible de charger les PNJ."));
    }, []);

    const selected = pnjs.find(pnj => String(pnj.id) === String(selectedId)) || EMPTY_PNJ;

    const renderPreview = (pnj) => {
        const src = pnjThumb(pnj);
        return (
            <>
                {src
                    ? <img className="admin-preview-img" src={src} alt={pnj.name}/>
                    : <span className="admin-preview-img admin-preview-img-empty">✦</span>}
                <div className="admin-preview-body">
                    <h2 className="admin-preview-title">{pnj.name}</h2>
                    {pnj.type && <span className="admin-preview-tag">{pnj.type}</span>}
                    {pnj.description && <p className="admin-preview-desc">{pnj.description}</p>}
                </div>
            </>
        );
    };

    return (
        <>
            <h1>PNJ</h1>
            <AdminCatalog
                items={pnjs}
                selectedId={selectedId}
                onSelect={setSelectedId}
                getThumb={pnjThumb}
                getMeta={(pnj) => pnj.type}
                newLabel="+ Créer un PNJ"
                renderPreview={renderPreview}
            >
                <CreatePnjForm
                    key={selectedId}
                    pnj={selected}
                    onSaved={load}
                />
            </AdminCatalog>
        </>
    );
};

export default PnjMakerPage;
