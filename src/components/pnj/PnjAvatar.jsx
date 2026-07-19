import React, {useState} from "react";
import styles from "./PnjDialogue.module.scss";

/**
 * Vignette du PNJ dans les dialogues : image + pastille du nom.
 * Certains PNJ ont un avatar manquant ou invalide en base — dans ce cas
 * l'image est masquée et seule la pastille du nom reste.
 */
const PnjAvatar = ({pnj}) => {
    const [broken, setBroken] = useState(false);

    if (!pnj.avatar || broken) {
        return (
            <div className={styles.avatarCard}>
                <div className={styles.pnjName}>{pnj.name}</div>
            </div>
        );
    }

    return (
        <div className={styles.avatarCard}>
            <img className={styles.avatar} src={"img/pnj/" + pnj.avatar} alt={pnj.name}
                 onError={() => setBroken(true)}/>
            <div className={styles.pnjName}>{pnj.name}</div>
        </div>
    );
}

export default PnjAvatar
