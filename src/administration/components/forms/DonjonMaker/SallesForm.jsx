import React from 'react';

/**
 * Plan du donjon : la liste ordonnée des cartes traversées.
 *
 * L'ordre de la liste EST l'ordre de traversée — le serveur renumérote à
 * l'enregistrement, on n'expose donc pas de champ « ordre » à saisir.
 * Une carte n'appartient qu'à UN donjon : celles déjà prises ailleurs sont grisées.
 */
const SallesForm = ({salles, onChange, cartes, typesDeSalle, conditionsDeSalle, monstres, donjonId}) => {

    const modifier = (index, champ, valeur) => {
        onChange(salles.map((salle, position) =>
            position === index ? {...salle, [champ]: valeur} : salle
        ));
    };

    const modifierConditionParam = (index, nom, valeur) => {
        onChange(salles.map((salle, position) =>
            position === index
                ? {...salle, conditionParams: {...salle.conditionParams, [nom]: valeur}}
                : salle
        ));
    };

    /* Changer de condition change les paramètres attendus : on repart des défauts du
       serveur plutôt que de garder des clés qui n'ont plus de sens. */
    const changerCondition = (index, condition) => {
        onChange(salles.map((salle, position) =>
            position === index
                ? {...salle, condition, conditionParams: {...conditionsDeSalle[condition].defauts}}
                : salle
        ));
    };

    const ajouter = () => {
        onChange([...salles, {
            id: null,
            carteId: null,
            type: salles.length === 0 ? "entree" : "couloir",
            condition: "aucune",
            conditionParams: {},
            monstreId: null,
            nombreMonstres: 0
        }]);
    };

    const retirer = (index) => {
        onChange(salles.filter((_, position) => position !== index));
    };

    const deplacer = (index, direction) => {
        const cible = index + direction;
        if(cible < 0 || cible >= salles.length){
            return;
        }
        const copie = [...salles];
        [copie[index], copie[cible]] = [copie[cible], copie[index]];
        onChange(copie);
    };

    /** Une carte est disponible si elle est libre, ou déjà à CE donjon. */
    const estDisponible = (carte) => carte.donjonId === null || carte.donjonId === donjonId;

    return (
        <fieldset className="donjon-maker-bloc">
            <legend>Plan du donjon</legend>
            <p className="donjon-maker-aide">
                L'ordre de la liste est l'ordre de traversée. La première salle est celle où
                le groupe atterrit ; la salle au trésor est celle qui s'ouvre après le boss.
                Une condition s'évalue sur la salle PRÉCÉDENTE, et une porte franchie le
                reste jusqu'à la fin de l'expédition.
            </p>

            {salles.length === 0 && <p>Aucune salle. Un donjon doit en comporter au moins une.</p>}

            {salles.map((salle, index) => (
                <div className="donjon-maker-salle" key={salle.id ?? `nouvelle-${index}`}>
                  <div className="donjon-maker-ligne">
                    <span className="donjon-maker-rang">{index + 1}</span>

                    <div className="form-group">
                        <label>Carte</label>
                        <select className="select-form-field"
                                value={salle.carteId ?? ""}
                                onChange={(event) => modifier(index, "carteId", event.target.value ? Number(event.target.value) : null)}>
                            <option value="">— Choisir une carte —</option>
                            {cartes.map(carte => (
                                <option key={carte.id} value={carte.id} disabled={!estDisponible(carte)}>
                                    {carte.nom}{estDisponible(carte) ? "" : " (déjà dans un autre donjon)"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <select className="select-form-field"
                                value={salle.type}
                                onChange={(event) => modifier(index, "type", event.target.value)}>
                            {typesDeSalle.map(type =>
                                <option key={type.value} value={type.value}>{type.label}</option>
                            )}
                        </select>
                    </div>

                    <div className="donjon-maker-actions">
                        <button type="button" onClick={() => deplacer(index, -1)} disabled={index === 0}>↑</button>
                        <button type="button" onClick={() => deplacer(index, 1)} disabled={index === salles.length - 1}>↓</button>
                        <button type="button" onClick={() => retirer(index)}>✕</button>
                    </div>
                  </div>

                    <div className="donjon-maker-salle-detail">
                        <div className="donjon-maker-ligne">
                            <div className="form-group">
                                <label>Population à l'arrivée</label>
                                <select className="select-form-field"
                                        value={salle.monstreId ?? ""}
                                        onChange={(event) => modifier(index, "monstreId", event.target.value ? Number(event.target.value) : null)}>
                                    <option value="">— Salle vide —</option>
                                    {monstres.map(monstre =>
                                        <option key={monstre.id} value={monstre.id}>{monstre.nom}</option>
                                    )}
                                </select>
                                <small>Apparaît une seule fois par expédition, propre au groupe</small>
                            </div>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="number" min="0"
                                       value={salle.nombreMonstres ?? 0}
                                       onChange={(event) => modifier(index, "nombreMonstres", Number(event.target.value))}/>
                            </div>
                            <div className="form-group">
                                <label>Condition pour entrer</label>
                                <select className="select-form-field"
                                        value={salle.condition ?? "aucune"}
                                        onChange={(event) => changerCondition(index, event.target.value)}
                                        disabled={index === 0}>
                                    {Object.keys(conditionsDeSalle).map(cle =>
                                        <option key={cle} value={cle}>{conditionsDeSalle[cle].label}</option>
                                    )}
                                </select>
                                {index === 0 && <small>La salle d'entrée n'a pas de condition</small>}
                            </div>

                            {(conditionsDeSalle[salle.condition ?? "aucune"]?.champs ?? []).map(champ => (
                                <div className="form-group" key={champ.name}>
                                    <label>{champ.label}</label>
                                    <input type="number" min="1"
                                           value={salle.conditionParams?.[champ.name] ?? ""}
                                           onChange={(event) => modifierConditionParam(index, champ.name, Number(event.target.value))}/>
                                    {champ.aide && <small>{champ.aide}</small>}
                                </div>
                            ))}
                        </div>

                        {(salle.condition ?? "aucune") !== "aucune" && (
                            <p className="donjon-maker-aide">
                                {conditionsDeSalle[salle.condition].aide}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            <button type="button" className="map-maker-btn-validation" onClick={ajouter}>
                Ajouter une salle
            </button>
        </fieldset>
    );
};

export default SallesForm;
