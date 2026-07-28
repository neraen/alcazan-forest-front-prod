import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {toast} from "react-toastify";
import InteractionMakerApi from "../../services/InteractionMakerApi";
import {updateModeMapMaker} from "../../../store/actions";

/**
 * Outil « Interaction » du MapMaker : on choisit une interaction définie dans
 * l'InteractionMaker, puis on clique les cases où la poser.
 *
 * L'option « Retirer » arme le même outil avec un id nul : cliquer une case la libère.
 * Sans ça, une case interactive n'aurait jamais pu être défaite depuis l'interface.
 */
const InteractionAddForm = (props) => {

    const [interactions, setInteractions] = useState([]);

    useEffect(() => {
        InteractionMakerApi.list()
            .then(setInteractions)
            .catch(() => toast.error("Impossible de charger les interactions."));
    }, []);

    const armer = (event) => {
        const valeur = event.target.value;
        if(valeur === ""){
            props.updateModeMapMaker({type: '', data: {}});
            return;
        }
        if(valeur === "retirer"){
            props.updateModeMapMaker({type: 'interaction', data: {interactionId: null, interactionNom: null}});
            return;
        }
        const interaction = interactions.find(i => String(i.id) === valeur);
        props.updateModeMapMaker({
            type: 'interaction',
            data: {interactionId: interaction.id, interactionNom: interaction.nom}
        });
    };

    return (
        <div className="form-group">
            <label>Interaction à poser</label>
            <select className="select-form-field" onChange={armer} defaultValue="">
                <option value="">— Choisir —</option>
                <option value="retirer">✕ Retirer l'interaction de la case</option>
                {interactions.map(interaction =>
                    <option key={interaction.id} value={interaction.id}>
                        {interaction.nom}{interaction.actif ? "" : " (inactive)"}
                    </option>
                )}
            </select>
            <small>
                Puis cliquez les cases. Pensez à « Sauvegarder les changements ».
                Les interactions se créent dans l'onglet Interactions.
            </small>
        </div>
    );
};

export default connect(null, {updateModeMapMaker})(InteractionAddForm);
