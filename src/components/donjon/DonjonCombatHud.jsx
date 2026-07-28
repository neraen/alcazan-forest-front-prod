import React, {useEffect, useState} from "react";
import GaugeBar from "../ui/gaugeBar/GaugeBar";
import styles from "./DonjonCombatHud.module.scss";

/**
 * HUD de rencontre : vie et phase du boss, compte à rebours de la zone annoncée,
 * table de menace. Composant de PRÉSENTATION — il n'appelle rien, tout vient de
 * DonjonCombatHost.
 *
 * Le compte à rebours est dérivé de `resoudreAt` (horloge SERVEUR) à chaque seconde :
 * on ne décompte pas un nombre reçu, sinon un onglet en arrière-plan dériverait et
 * afficherait un délai faux au retour.
 */

const secondesRestantes = (resoudreAt) => {
    if(!resoudreAt){
        return null;
    }
    return Math.max(0, Math.ceil((new Date(resoudreAt).getTime() - Date.now()) / 1000));
};

const DonjonCombatHud = ({combat, monId}) => {

    const [, forcerRendu] = useState(0);
    const zone = combat.zones && combat.zones[0];

    // Une horloge locale pour RAFRAÎCHIR l'affichage, pas pour tenir le compte :
    // la valeur est toujours recalculée depuis resoudreAt.
    useEffect(() => {
        if(!zone){
            return undefined;
        }
        const minuteur = setInterval(() => forcerRendu(valeur => valeur + 1), 500);

        return () => clearInterval(minuteur);
    }, [zone]);

    const boss = combat.boss;
    const compteARebours = zone ? secondesRestantes(zone.resoudreAt) : null;

    return (
        <div className={styles.hud}>
            {boss && (
                <div className={styles.boss}>
                    <GaugeBar value={boss.vie} max={boss.vieMax} variant="hp" label={boss.nom}/>
                    <div className={styles.bossPied}>
                        <span>Phase {boss.phase} %</span>
                        {boss.enrage && <span className={styles.enrage}>ENRAGÉ</span>}
                    </div>
                </div>
            )}

            {zone && (
                <div className={`${styles.alerte} ${compteARebours <= 3 ? styles.alerteImminente : ""}`}>
                    <span className={styles.alerteTexte}>{zone.annonce}</span>
                    <span className={styles.alerteCompte}>{compteARebours} s</span>
                </div>
            )}

            {/* Les monstres d'instance ne sont pas dessinés sur la carte (comme partout
                ailleurs dans le jeu) : ce compteur est le seul moyen de savoir ce qu'il
                reste à nettoyer. « Créature » et pas « renfort » : la même table porte la
                population des salles et les adds invoqués par le boss. */}
            {combat.renforts && combat.renforts.length > 0 && (
                <div className={styles.renforts}>
                    {combat.renforts.length} créature{combat.renforts.length > 1 ? "s" : ""} en vie
                </div>
            )}

            {combat.menaces && combat.menaces.length > 1 && (
                <ul className={styles.menaces}>
                    {combat.menaces.map((membre, rang) => (
                        <li key={membre.userId}
                            className={`${styles.menace} ${membre.userId === monId ? styles.moi : ""}`}>
                            <span className={styles.menaceRang}>{rang + 1}</span>
                            <span className={styles.menacePseudo}>{membre.pseudo}</span>
                            <span className={styles.menaceValeur}>{membre.menace}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DonjonCombatHud;
