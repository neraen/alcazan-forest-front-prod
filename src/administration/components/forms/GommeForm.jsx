import React from 'react';
import {connect} from "react-redux";
import {updateModeMapMaker} from "../../../store/actions";

/**
 * Outil « Gomme » du MapMaker : on choisit ce qu'on efface, puis on clique les cases.
 * Rien ne part en base avant « Sauvegarder les changements ».
 *
 * Les cibles sont lues par le reducer (`gommerCase`), qui vide les champs de la case :
 * c'est un champ vidé qui dit « retirer » au serveur.
 */
export const CIBLES_GOMME = [
    {valeur: "tout", libelle: "Tout (case vierge, hors boss)"},
    {valeur: "monstre", libelle: "Monstre"},
    {valeur: "pnj", libelle: "PNJ"},
    {valeur: "interaction", libelle: "Interaction / ressource"},
    {valeur: "wrap", libelle: "Passage (wrap)"},
    {valeur: "collision", libelle: "Collision"},
    {valeur: "boss", libelle: "Boss (ne se repose pas ici)"},
];

const GommeForm = ({mode, updateModeMapMaker}) => {

    const cibleArmee = mode.type === "gomme" ? mode.data.cible : null;

    const armer = (cible) => updateModeMapMaker({type: "gomme", data: {cible}});

    return (
        <div className="form-group map-maker-gomme">
            <label>Effacer de la case</label>
            <div className="map-maker-gomme-cibles">
                {CIBLES_GOMME.map(({valeur, libelle}) =>
                    <button type="button" key={valeur}
                            className={"map-maker-gomme-cible" + (cibleArmee === valeur ? " is-active" : "")}
                            onClick={() => armer(valeur)}>
                        {libelle}
                    </button>
                )}
            </div>
            <small>
                Puis cliquez les cases. Retirer un PNJ ou un passage rend la case foulable.
                Pensez à « Sauvegarder les changements ».
            </small>
        </div>
    );
};

export default connect(state => ({mode: state.data.mapMaker.mode}), {updateModeMapMaker})(GommeForm);
