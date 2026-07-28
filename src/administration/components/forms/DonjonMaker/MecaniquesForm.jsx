import React from 'react';

/**
 * Mécaniques de combat du boss.
 *
 * Les champs de chaque mécanique viennent ENTIÈREMENT de la config serveur
 * (/api/donjon/editor/config) : ce composant ne connaît aucun type de mécanique en dur.
 * Ajouter une mécanique côté serveur la fait apparaître ici sans toucher au front.
 *
 * La « phase » n'est pas un objet à part : c'est la fenêtre de vie du boss qui borne
 * la mécanique. Une rencontre en trois temps = trois lignes avec des fenêtres différentes.
 */
const MecaniquesForm = ({mecaniques, onChange, config, catalogues}) => {

    const typesDisponibles = Object.keys(config);

    const modifier = (index, champ, valeur) => {
        onChange(mecaniques.map((mecanique, position) =>
            position === index ? {...mecanique, [champ]: valeur} : mecanique
        ));
    };

    const modifierParam = (index, nom, valeur) => {
        onChange(mecaniques.map((mecanique, position) =>
            position === index
                ? {...mecanique, params: {...mecanique.params, [nom]: valeur}}
                : mecanique
        ));
    };

    const changerType = (index, type) => {
        // Changer de type change les paramètres attendus : on repart des défauts du
        // serveur plutôt que de garder des clés qui n'ont plus de sens.
        onChange(mecaniques.map((mecanique, position) =>
            position === index
                ? {...mecanique, type, params: {...config[type].defauts}}
                : mecanique
        ));
    };

    const ajouter = () => {
        const type = typesDisponibles[0];
        onChange([...mecaniques, {
            id: null,
            type,
            vieMax: 100,
            vieMin: 0,
            cooldownSecondes: 0,
            params: {...config[type].defauts},
            actif: true,
            annonce: ""
        }]);
    };

    const retirer = (index) => {
        onChange(mecaniques.filter((_, position) => position !== index));
    };

    return (
        <fieldset className="donjon-maker-bloc">
            <legend>Mécaniques de combat</legend>
            <p className="donjon-maker-aide">
                Chaque mécanique n'agit que dans sa fenêtre de vie du boss : c'est ce qui
                fait les phases. Un cooldown à 0 signifie « une seule fois par expédition ».
            </p>

            {mecaniques.length === 0 && <p>Aucune mécanique : le boss se contentera de frapper.</p>}

            {mecaniques.map((mecanique, index) => {
                const definition = config[mecanique.type];
                if(!definition){
                    return null;
                }

                return (
                    <div className="donjon-maker-mecanique" key={mecanique.id ?? `nouvelle-${index}`}>
                        <div className="donjon-maker-ligne">
                            <div className="form-group">
                                <label>Mécanique</label>
                                <select className="select-form-field"
                                        value={mecanique.type}
                                        onChange={(event) => changerType(index, event.target.value)}>
                                    {typesDisponibles.map(type =>
                                        <option key={type} value={type}>{config[type].label}</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Active de (% vie)</label>
                                <input type="number" min="0" max="100" value={mecanique.vieMax}
                                       onChange={(event) => modifier(index, "vieMax", Number(event.target.value))}/>
                            </div>
                            <div className="form-group">
                                <label>à (% vie)</label>
                                <input type="number" min="0" max="100" value={mecanique.vieMin}
                                       onChange={(event) => modifier(index, "vieMin", Number(event.target.value))}/>
                            </div>
                            <div className="form-group">
                                <label>Cooldown (s)</label>
                                <input type="number" min="0" value={mecanique.cooldownSecondes}
                                       onChange={(event) => modifier(index, "cooldownSecondes", Number(event.target.value))}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={mecanique.actif}
                                           onChange={(event) => modifier(index, "actif", event.target.checked)}/> Active
                                </label>
                            </div>
                            <div className="donjon-maker-actions">
                                <button type="button" onClick={() => retirer(index)}>✕</button>
                            </div>
                        </div>

                        <p className="donjon-maker-aide">{definition.aide}</p>

                        <div className="donjon-maker-ligne">
                            {definition.champs.map(champ => (
                                <div className="form-group" key={champ.name}>
                                    <label>{champ.label}</label>
                                    {/* Le TYPE du champ vient du serveur, pas son nom : ajouter
                                        un select dans la config suffit à le rendre ici. */}
                                    {champ.type === "select" ? (
                                        <select className="select-form-field"
                                                value={mecanique.params[champ.name] ?? ""}
                                                onChange={(event) => modifierParam(index, champ.name, event.target.value ? Number(event.target.value) : null)}>
                                            <option value="">— Choisir —</option>
                                            {(catalogues[champ.catalog] ?? []).map(entree =>
                                                <option key={entree.id} value={entree.id}>{entree.nom}</option>
                                            )}
                                        </select>
                                    ) : (
                                        <input type="number"
                                               step={champ.name === "multiplicateur" ? "0.1" : "1"}
                                               value={mecanique.params[champ.name] ?? ""}
                                               onChange={(event) => modifierParam(index, champ.name, Number(event.target.value))}/>
                                    )}
                                    {champ.aide && <small>{champ.aide}</small>}
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Annonce aux joueurs</label>
                            <input type="text"
                                   value={mecanique.annonce ?? ""}
                                   placeholder="Laissé vide : un texte par défaut est utilisé"
                                   onChange={(event) => modifier(index, "annonce", event.target.value)}/>
                        </div>
                    </div>
                );
            })}

            <button type="button" className="map-maker-btn-validation" onClick={ajouter}>
                Ajouter une mécanique
            </button>
        </fieldset>
    );
};

export default MecaniquesForm;
