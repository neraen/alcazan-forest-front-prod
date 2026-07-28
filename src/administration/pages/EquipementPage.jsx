import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import EquipementApi from "../../services/EquipementApi";
import AdminCatalog from "../components/AdminCatalog";
import CreateEquipementForm from "../components/forms/CreateEquipement/CreateEquipementForm";
import ImportEquipementCsv from "../components/forms/ImportEquipementCsv/ImportEquipementCsv";

/** Image d'un équipement : /img/equipement/<position>/<icone>. */
const equipThumb = (equipement) =>
    (equipement.positionEquipementName && equipement.icone)
        ? `/img/equipement/${equipement.positionEquipementName}/${equipement.icone}`
        : null;

const EquipementPage = () => {

    const [equipements, setEquipements] = useState([]);
    const [selectedId, setSelectedId] = useState(0);
    const [importOuvert, setImportOuvert] = useState(false);

    const load = () => EquipementApi.getAllEquipementsInfo().then(setEquipements);

    useEffect(() => {
        load().catch(() => toast.error("Impossible de charger les équipements."));
    }, []);

    const renderPreview = (equipement) => {
        const src = equipThumb(equipement);
        const stats = (equipement.caracteristiques || []).filter(caracteristique => Number(caracteristique.valeur) > 0);
        return (
            <>
                {src
                    ? <img className="admin-preview-img" src={src} alt={equipement.nom}/>
                    : <span className="admin-preview-img admin-preview-img-empty">✦</span>}
                <div className="admin-preview-body">
                    <h2 className="admin-preview-title">{equipement.nom}</h2>
                    {equipement.positionEquipementName && <span className="admin-preview-tag">{equipement.positionEquipementName}</span>}
                    {/* Liste vide = aucune restriction de classe. */}
                    <span className="admin-preview-tag">
                        {(equipement.classes || []).length === 0
                            ? "toutes classes"
                            : equipement.classes.map(classe => classe.nom).join(" · ")}
                    </span>
                    <div className="admin-preview-stats">
                        <div className="admin-preview-stat"><span>Niveau</span><span>{equipement.levelMin}</span></div>
                        <div className="admin-preview-stat"><span>Achat</span><span>{equipement.prixAchat}</span></div>
                        <div className="admin-preview-stat"><span>Revente</span><span>{equipement.prixRevente}</span></div>
                    </div>
                    {stats.length > 0 && (
                        <div className="admin-preview-stats">
                            {stats.map(caracteristique => (
                                <div className="admin-preview-stat" key={caracteristique.nom}>
                                    <span>{caracteristique.nom}</span>
                                    <span>+{caracteristique.valeur}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <>
            <h1>Équipements</h1>

            <div className="import-csv-bloc">
                <button type="button" className="import-csv-toggle" onClick={() => setImportOuvert(ouvert => !ouvert)}>
                    {importOuvert ? "▾" : "▸"} Importer un CSV d'équipements
                </button>
                {/* Le panneau est démonté quand il est replié : le rapport d'un import précédent
                    ne doit pas donner l'illusion d'un résultat frais. */}
                {importOuvert && <ImportEquipementCsv onImported={load}/>}
            </div>

            <AdminCatalog
                items={equipements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                getName={(equipement) => equipement.nom}
                getThumb={equipThumb}
                getMeta={(equipement) => `Niv. ${equipement.levelMin} · ${equipement.positionEquipementName || ""}`}
                newLabel="+ Créer un équipement"
                renderPreview={renderPreview}
            >
                <CreateEquipementForm
                    externalSelectedId={selectedId}
                    hideSelector={true}
                    onSaved={(id) => {
                        // On suit l'objet qui vient d'être enregistré : après une création, le
                        // catalogue reste ainsi aligné sur le formulaire passé en édition.
                        if (id) {
                            setSelectedId(id);
                        }
                        return load();
                    }}
                />
            </AdminCatalog>
        </>
    );
};

export default EquipementPage;
