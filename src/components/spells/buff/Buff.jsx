import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import React, {useEffect, useState} from "react";
import BuffApi from "../../../services/BuffApi";
import Slot from "../../ui/slot/Slot";
import styles from "./Buff.module.scss";

const BUFF_SLOT_COUNT = 6;

/**
 * Grille compacte 3×2 des effets actifs (mini-slots 25px), avec infobulle au survol.
 */
const Buff = () => {

    const [buffs, setBuffs] = useState([])

    useEffect(() => {
        getActiveBuff();
    }, [])

    const getActiveBuff = async () => {
        const buffs = await BuffApi.getActiveBuff();
        setBuffs(buffs);
    }

    return (
        <div className={styles.grid}>
            {buffs && buffs.map(buff => (
                <div className={styles.cell} key={buff.id}>
                    <Slot size="mini" src={"/img/spell/" + buff.icone} alt={buff.name}/>
                    <div className={styles.tooltip}>
                        <strong>{buff.name}</strong><br />
                        {buff.caracteristiques && buff.caracteristiques.map(caracteristique => (
                            <em> + {caracteristique.value} {caracteristique.nom} | </em>
                        ))}
                    </div>
                </div>
            ))}
            {(buffs && buffs.length < BUFF_SLOT_COUNT) && [...Array(BUFF_SLOT_COUNT - buffs.length)].map((x, i) =>
                <Slot size="mini" key={i}/>
            )}
        </div>
    )
}

export default connect((state, ownProps) => {
    return {joueurState: state.data.joueurState, ownProps};
}, {updateJoueurState})(Buff);
