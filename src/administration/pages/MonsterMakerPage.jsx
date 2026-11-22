import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import monsterApi from "../../services/monsterApi";
import AdminCatalog from "../components/AdminCatalog";
import CreateMonsterForm from "../components/forms/CreateMonsterForm";

const EMPTY_MONSTER = {id: 0, name: "", maxLife: 0, skin: "", tempsRepop: "", puissance: 0, armure: 0};

/** Image d'un monstre : même convention que le jeu (/img/monstre/<skin>.png). */
const monsterThumb = (monster) => (monster.skin ? `/img/monstre/${monster.skin}.png` : null);
/** Temps de repop affiché : non renseigné (ou ≤ 0) = défaut serveur de 30 s (`MonstreConfig`). */
const repop = (monster) => {
    const valeur = Number(monster.tempsRepop ?? monster.temps_repop ?? 0);
    return valeur > 0 ? `${valeur}s` : "30s (défaut)";
};

const MonsterMakerPage = () => {

    const [monsters, setMonsters] = useState([]);
    const [selectedId, setSelectedId] = useState(0);

    const load = () => monsterApi.getAllMonsters().then(setMonsters);

    useEffect(() => {
        load().catch(() => toast.error("Impossible de charger les monstres."));
    }, []);

    const selected = monsters.find(monster => String(monster.id) === String(selectedId)) || EMPTY_MONSTER;

    const renderPreview = (monster) => {
        const src = monsterThumb(monster);
        return (
            <>
                {src
                    ? <img className="admin-preview-img" src={src} alt={monster.name}/>
                    : <span className="admin-preview-img admin-preview-img-empty">✦</span>}
                <div className="admin-preview-body">
                    <h2 className="admin-preview-title">{monster.name}</h2>
                    <div className="admin-preview-stats">
                        <div className="admin-preview-stat"><span>Vie</span><span>{monster.maxLife}</span></div>
                        <div className="admin-preview-stat"><span>Puissance</span><span>{monster.puissance}</span></div>
                        <div className="admin-preview-stat"><span>Armure</span><span>{monster.armure ?? 0}</span></div>
                        <div className="admin-preview-stat"><span>Repop</span><span>{repop(monster)}</span></div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            <h1>Monstres</h1>
            <AdminCatalog
                items={monsters}
                selectedId={selectedId}
                onSelect={setSelectedId}
                getThumb={monsterThumb}
                getMeta={(monster) => `${monster.maxLife} PV · ${monster.puissance} puiss. · ${monster.armure ?? 0} arm.`}
                newLabel="+ Créer un monstre"
                renderPreview={renderPreview}
            >
                <CreateMonsterForm
                    key={selectedId}
                    monster={selected}
                    onSaved={load}
                />
            </AdminCatalog>
        </>
    );
};

export default MonsterMakerPage;
