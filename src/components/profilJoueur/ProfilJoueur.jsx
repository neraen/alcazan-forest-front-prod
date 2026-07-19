import React, {useState, useEffect} from 'react'
import UsersApi from "../../services/UsersApi";
import ProfilAPI from "../../services/ProfilAPI";
import UserActionApi from "../../services/UserActionApi";
import Panel from "../ui/panel/Panel";
import SectionTitle from "../ui/sectionTitle/SectionTitle";
import GameButton from "../ui/gameButton/GameButton";
import CharacterPanel from "../inventory/screen/CharacterPanel";
import ItemDetailBar from "../inventory/screen/ItemDetailBar";
import styles from "./ProfilJoueur.module.scss";

/**
 * Profil public d'un autre joueur : identité + actions sociales à gauche,
 * équipement porté (paperdoll en lecture seule) à droite.
 */
const ProfilJoueur = ({match, history}) => {

    const [equipementEquipe, setEquipementEquipe] = useState([])
    const [joueur, setJoueur] = useState([])
    const [isFriend, setIsFriend] = useState(false);
    const [idFriend, setIdFriend] = useState(0);
    const [selected, setSelected] = useState(null);
    const { pseudo = undefined} = match.params;

    useEffect(() => {
        fetchEquipementEquipe();
    }, []);

    const fetchEquipementEquipe = async () => {
        if( pseudo !== undefined){
            const joueurData = await UsersApi.findUserByPseudo(pseudo);
            setJoueur(joueurData);

            const friendData = await UsersApi.joueurGetIdFriend(joueurData.idJoueur);
            setIdFriend(friendData.friendId);
            setIsFriend(!!friendData.friendId);

            const dataEquipementEquipe = await ProfilAPI.getEquipementEquipeJoueur(joueurData.idJoueur);
            setEquipementEquipe(dataEquipementEquipe);
        }
    }

    const addOrRemovePlayerOnFriendList = async () => {
        let data = [];
        if(isFriend){
            data = await UserActionApi.removeFriend(idFriend)
            setIsFriend(false);
        }else{
            data = await UserActionApi.addFriend(joueur.idJoueur)
            setIsFriend(true);
            setIdFriend(data.friendId);
        }
        //toast(data.message)
    }

    const sendMessage = () => {
        history.replace("/messagerie");
    }

    const infoRows = [
        {label: "Classe", value: joueur.nomClasse},
        {label: "Niveau", value: joueur.niveau},
        {label: "Guilde", value: joueur.nomGuilde || "Aucune"},
        {label: "Alignement", value: joueur.nomAlignement || "Aucun"},
    ];

    return (
        <div className={styles.page}>
            <div className={styles.body}>
                <div className={styles.leftColumn}>
                    <Panel variant="soft" padding="lg" radius="lg" className={styles.card}>
                        <SectionTitle>{pseudo}</SectionTitle>
                        {infoRows.map((row) => (
                            <div key={row.label} className={styles.infoRow}>
                                <span className={styles.infoLabel}>{row.label}</span>
                                <span className={styles.infoValue}>{row.value}</span>
                            </div>
                        ))}
                    </Panel>

                    <Panel variant="soft" padding="lg" radius="lg" className={styles.card}>
                        <SectionTitle>Actions</SectionTitle>
                        <GameButton onClick={addOrRemovePlayerOnFriendList}>
                            {isFriend ? "Retirer de ma liste d'amis" : "Ajouter à ma liste d'amis"}
                        </GameButton>
                        <GameButton onClick={sendMessage}>Envoyer un message</GameButton>
                    </Panel>
                </div>

                <Panel variant="soft" padding="lg" radius="lg" className={styles.equipCard}>
                    <SectionTitle right={
                        <span className={styles.sectionNote}>Équipement porté</span>
                    }>
                        Équipement
                    </SectionTitle>
                    <CharacterPanel
                        character={{pseudo: joueur.pseudo || pseudo, nomClasse: joueur.nomClasse, niveau: joueur.niveau}}
                        equipements={equipementEquipe}
                        selectedKey={selected ? selected.key : null}
                        onSelect={setSelected}
                    />
                </Panel>
            </div>
            <ItemDetailBar item={selected}/>
        </div>
    )
}

export default ProfilJoueur
