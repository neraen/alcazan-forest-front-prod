import React, {useEffect, useRef, useState} from "react"
import {toast} from "react-toastify";
import MetierApi from "../../../services/MetierApi";
import questApi from "../../../services/questApi";
import GameButton from "../../ui/gameButton/GameButton";
import styles from "./MetierView.module.scss";

/**
 * Maître de métier : ce qu'il enseigne, et où en est le joueur.
 *
 * Les données arrivent en props depuis PnjInteractionHost, puis sont RELUES depuis le
 * serveur après chaque apprentissage ou oubli. Recalculer localement « peut-il encore
 * apprendre ? » aurait dupliqué la règle des plafonds — et son libellé — des deux côtés :
 * un aller-retour sur une action aussi rare coûte moins cher qu'une règle en double.
 */
const MetierView = ({pnjId, metierData}) => {

    const [data, setData] = useState(metierData);
    const [enCours, setEnCours] = useState(false);
    const [dialogueEcrit, setDialogueEcrit] = useState("");
    const dialogue = metierData.dialogue || "";

    // Effet machine à écrire, repris de la vue guilde. Le timer est nettoyé au démontage :
    // la modale peut se fermer en pleine frappe (éloignement du PNJ).
    const indexRef = useRef(0);
    useEffect(() => {
        indexRef.current = 0;
        setDialogueEcrit("");
        const timer = setInterval(() => {
            indexRef.current += 1;
            setDialogueEcrit(dialogue.slice(0, indexRef.current));
            if(indexRef.current >= dialogue.length){
                clearInterval(timer);
            }
        }, 45);

        return () => clearInterval(timer);
    }, [dialogue]);

    const relire = () => questApi.getInteraction(pnjId)
        .then(payload => setData(payload.metier))
        .catch(() => toast.error("Impossible de relire les métiers de ce maître."));

    const agir = async (action, metierId) => {
        setEnCours(true);
        try {
            const reponse = await action(metierId);
            toast.info(reponse.message);
            await relire();
        } catch (erreur) {
            toast.error(erreur.response?.data?.error || "Ce maître ne peut rien pour vous.");
        } finally {
            setEnCours(false);
        }
    }

    const handleApprendre = (metier) => agir(MetierApi.apprendre, metier.id);

    const handleOublier = (metier) => {
        // Irréversible : la progression est perdue côté serveur, il n'y a pas de repentir.
        const confirme = window.confirm(
            `Oublier le métier de ${metier.nom} ? Vous perdez définitivement votre progression (niveau ${metier.niveau}).`
        );
        if(confirme){
            agir(MetierApi.oublier, metier.id);
        }
    }

    const metiers = data.metiers || [];
    const familles = metiers.reduce((groupes, metier) => {
        (groupes[metier.famille] = groupes[metier.famille] || {label: metier.familleLabel, metiers: []})
            .metiers.push(metier);
        return groupes;
    }, {});

    return (
        <div className={styles.body}>
            <p className={styles.dialogue}>{dialogueEcrit}</p>

            {Object.entries(familles).map(([famille, groupe]) => (
                <section key={famille}>
                    <div className={styles.listHead}>
                        <span className={styles.listBar}/>
                        <span className={styles.listTitle}>{groupe.label}</span>
                        <span className={styles.places}>
                            {data.placesRestantes?.[famille] ?? 0} place(s) sur {data.plafonds?.[famille] ?? 0}
                        </span>
                    </div>

                    <div className={styles.metiers}>
                        {groupe.metiers.map(metier => (
                            <div key={metier.id} className={styles.metierRow}>
                                <div className={styles.metierInfo}>
                                    <span className={styles.metierName}>{metier.nom}</span>
                                    <span className={styles.metierDesc}>{metier.description}</span>
                                </div>

                                {metier.appris && (
                                    <span className={styles.metierLevel}>
                                        <span className={styles.metierLevelLabel}>Niveau</span>
                                        <span className={styles.metierLevelValue}>{metier.niveau}</span>
                                    </span>
                                )}

                                {metier.appris
                                    ? <GameButton onClick={() => handleOublier(metier)} disabled={enCours}>
                                        Oublier
                                    </GameButton>
                                    : <GameButton onClick={() => handleApprendre(metier)}
                                                  disabled={enCours || !metier.peutApprendre}
                                                  title={metier.raison || ""}>
                                        Apprendre
                                    </GameButton>}
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}

export default MetierView
