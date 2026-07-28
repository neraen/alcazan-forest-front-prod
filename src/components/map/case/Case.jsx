import React from 'react'
import Player from "../../player/Player";
import Pnj from "../../pnj/pnj/Pnj";
import Boss from "../../boss/Boss";
import ActionMap from "../../actionMap/ActionMap";
import InteractionMap from "../../actionMap/InteractionMap";

const Case = (props) => {

    // Zone télégraphiée du boss : la case est surlignée jusqu'à l'impact. C'est le
    // SEUL indice que le joueur a pour s'écarter à temps — sans lui la mécanique est
    // injouable (cf. lot 3, le serveur annonce mais n'affiche rien).
    const classesZone = props.zone
        ? ` case-zone-donjon${props.zone.imminente ? " case-zone-donjon-imminente" : ""}`
        : "";

    return <>
        <div className={"case "+ (props.isUnabled && "unabled-move" || 'disabled-move') + classesZone} >
            { props.hasPnj && <Pnj pnj={props.hasPnj} abscisse={props.abscisse} ordonnee={props.ordonnee}/>}
            { props.haveJoueur && <Player player={props.haveJoueur} hasMonstre={props.hasMonstre} abscisse={props.abscisse} ordonnee={props.ordonnee}/>}
            { props.hasBoss && <Boss boss={props.hasBoss} />}
            {/* Les monstres d'instance (population d'une salle, renforts d'un boss) ne
                sont PAS dessinés : comme tous les monstres du jeu ils se cachent dans le
                décor et se ciblent en marchant sur leur case (cf. Map.majCibleMonstreInstance). */}
            { props.hasInteraction && <InteractionMap interaction={props.hasInteraction} etat={props.etatInteraction}
                                                     modesRecolte={props.modesRecolte} />}
            { props.hasAction && <ActionMap action={props.hasAction} />}
        </div>
    </>
}

export default Case
