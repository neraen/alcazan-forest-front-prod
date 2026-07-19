import React, {useEffect, useState} from "react";
import UsersApi from "../../../services/UsersApi";
import GameModal from "../../ui/gameModal/GameModal";
import ModalShell from "../../ui/gameModal/ModalShell";
import Profil from "../../profil/profil/profil";
import Loader from "../../loader/Loader";
import styles from "./ProfilModal.module.scss";

/**
 * Version modale de l'écran Profil (ouverte depuis le rail de la page
 * principale) : superpose la zone de carte via GameModal.
 * La page /personnage/profil reste la version pleine page.
 */
export default function ProfilModal({isShowing, toggle}){

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (isShowing && !user) {
            UsersApi.find().then(setUser);
        }
    }, [isShowing]);

    return (
        <GameModal isOpen={isShowing} onClose={toggle}>
            <ModalShell iconSrc="/img/icons/people.png" title="Profil"
                        subtitle={user ? `${user.pseudo} · ${user.nomClasse} · Niveau ${user.niveau}` : ""}
                        onClose={toggle}>
                {user
                    ? <Profil user={user} variant="modal"/>
                    : <div className={styles.loading}><Loader/></div>}
            </ModalShell>
        </GameModal>
    );
}
