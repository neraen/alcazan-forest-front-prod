import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import monsterApi from "../../services/monsterApi";
import AdminCatalog from "../components/AdminCatalog";
import CreateMonsterForm from "../components/forms/CreateMonsterForm";

const EMPTY_MONSTER = {id: 0, name: "", maxLife: 0, skin: "", tempsRepop: 0, puissance: 0};

/** Image d'un monstre : même convention que le jeu (/img/monstre/<skin>.png). */
const monsterThumb = (monster) => (monster.skin ? `/img/monstre/${monster.skin}.png` : null);
const repop = (monster) => monster.tempsRepop ?? monster.temps_repop ?? 0;

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
                        <div className="admin-preview-stat"><span>Repop</span><span>{repop(monster)}s</span></div>
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
                getMeta={(monster) => `${monster.maxLife} PV · ${monster.puissance} puiss.`}
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
