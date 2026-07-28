import React from 'react'
import GameModal from "../ui/gameModal/GameModal";
import ModalShell from "../ui/gameModal/ModalShell";
import GameButton from "../ui/gameButton/GameButton";
import styles from "./ChoixRecolte.module.scss";

/**
 * Le choix posé au joueur avant de prélever sur un gisement : mesurer, ou tout racler.
 *
 * Le libellé, la description et les CHIFFRES viennent du serveur (`RecolteConfig`,
 * descendu avec la carte) — rien n'est écrit en dur ici, sans quoi retoucher
 * l'équilibrage mentirait à l'écran.
 *
 * Une vraie modale plutôt qu'un menu ancré sur la case : un enfant en
 * `position:absolute` dans une `.case` déborde sur la grille et intercepte les clics de
 * déplacement (piège documenté de `mapGrid.scss`).
 */
const ChoixRecolte = ({nom, coutPa, modes, onChoisir, onFermer}) => (
    <GameModal isOpen={true} onClose={onFermer} size="auto">
        <ModalShell fit="content" iconSrc="/img/icons/bag.png"
                    title={nom} subtitle="Comment voulez-vous prélever ?"
                    onClose={onFermer}>
            <div className={styles.body}>
                {coutPa > 0 && <p className={styles.cout}>Coût : {coutPa} PA</p>}

                {modes.map(mode => (
                    <div key={mode.value} className={styles.mode}>
                        <div className={styles.texte}>
                            <span className={styles.label}>{mode.label}</span>
                            <span className={styles.description}>{mode.description}</span>
                            <span className={styles.chiffres}>
                                Butin ×{mode.quantite} · rechargement ×{mode.cooldown}
                                {mode.epuisement > 0 && " · gisement mort pour tous"}
                                {" · karma "}{mode.karma > 0 ? `+${mode.karma}` : mode.karma}
                            </span>
                        </div>
                        <GameButton onClick={() => onChoisir(mode.value)}>Choisir</GameButton>
                    </div>
                ))}
            </div>
        </ModalShell>
    </GameModal>
)

export default ChoixRecolte
