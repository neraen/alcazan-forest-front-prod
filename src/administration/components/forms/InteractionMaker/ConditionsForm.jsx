import React from 'react';

/**
 * Conditions d'accès à une interaction (au-delà du métier, qui a son propre bloc).
 *
 * Les champs viennent ENTIÈREMENT de la config serveur : ce composant ne connaît aucun
 * type de condition en dur. Ajouter une condition côté serveur la fait apparaître ici
 * sans toucher au front.
 */
const ConditionsForm = ({conditions, onChange, config, catalogues}) => {

    const typesDisponibles = Object.keys(config);

    const modifierParam = (index, nom, valeur) => {
        onChange(conditions.map((condition, position) =>
            position === index
                ? {...condition, params: {...condition.params, [nom]: valeur}}
                : condition
        ));
    };

    /* Changer de type change les paramètres attendus : on repart des défauts du serveur
       plutôt que de garder des clés qui n'ont plus de sens. */
    const changerType = (index, type) => {
        onChange(conditions.map((condition, position) =>
            position === index ? {...condition, type, params: {...config[type].defauts}} : condition
        ));
    };

    const ajouter = () => {
        const type = typesDisponibles[0];
        onChange([...conditions, {id: null, type, params: {...config[type].defauts}}]);
    };

    const retirer = (index) => {
        onChange(conditions.filter((_, position) => position !== index));
    };

    return (
        <fieldset className="donjon-maker-bloc">
            <legend>Conditions</legend>
            <p className="donjon-maker-aide">
                Toutes doivent être remplies. Le joueur reçoit le message de la première
                qui bloque — et un refus ne lui coûte jamais de points d'action.
            </p>

            {conditions.length === 0 && <p>Aucune condition : accessible à tous.</p>}

            {conditions.map((condition, index) => {
                const definition = config[condition.type];
                if(!definition){
                    return null;
                }

                return (
                    <div className="donjon-maker-ligne" key={condition.id ?? `nouvelle-${index}`}>
                        <div className="form-group">
                            <label>Condition</label>
                            <select className="select-form-field"
                                    value={condition.type}
                                    onChange={(event) => changerType(index, event.target.value)}>
                                {typesDisponibles.map(cle =>
                                    <option key={cle} value={cle}>{config[cle].label}</option>
                                )}
                            </select>
                        </div>

                        {definition.champs.map(champ => (
                            <div className="form-group" key={champ.name}>
                                <label>{champ.label}</label>
                                {champ.type === "select" ? (
                                    <select className="select-form-field"
                                            value={condition.params?.[champ.name] ?? ""}
                                            onChange={(event) => modifierParam(index, champ.name, event.target.value ? Number(event.target.value) : null)}>
                                        <option value="">— Choisir —</option>
                                        {(catalogues[champ.catalog] ?? []).map(entree =>
                                            <option key={entree.id} value={entree.id}>{entree.nom}</option>
                                        )}
                                    </select>
                                ) : (
                                    <input type="number" min="0"
                                           value={condition.params?.[champ.name] ?? ""}
                                           onChange={(event) => modifierParam(index, champ.name, Number(event.target.value))}/>
                                )}
                            </div>
                        ))}

                        <div className="donjon-maker-actions">
                            <button type="button" onClick={() => retirer(index)}>✕</button>
                        </div>
                    </div>
                );
            })}

            <button type="button" className="map-maker-btn-validation" onClick={ajouter}>
                Ajouter une condition
            </button>
        </fieldset>
    );
};

export default ConditionsForm;
