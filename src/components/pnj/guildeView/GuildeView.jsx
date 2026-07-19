import React from "react"
import {toast} from "react-toastify";
import UserActionApi from "../../../services/UserActionApi";
import GameButton from "../../ui/gameButton/GameButton";
import styles from "./GuildeView.module.scss";

/**
 * Registre des guildes d'un PNJ "guilde". Les données arrivent en props
 * depuis PnjInteractionHost ({dialogue, guildes}) : plus de fetch interne.
 * Le dialogue s'écrit lettre à lettre (effet machine à écrire conservé).
 */
class GuildeView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            indexDialogue: 0,
            writtedDialogue: '',
            intervalId: 0
        }
    }

    componentDidMount() {
        const intervalId = setInterval(this.autoWrite, 45);
        this.setState({intervalId: intervalId});
    }

    componentDidUpdate() {
        if(this.state.indexDialogue === this.props.guildeData.dialogue.length){
            clearInterval(this.state.intervalId);
        }
    }

    componentWillUnmount() {
        // L'ancien composant fuyait son interval quand la modale se fermait
        // en pleine frappe (setState sur composant démonté).
        clearInterval(this.state.intervalId);
    }

    autoWrite = () => {
        this.setState(prevState => {
            const nextIndex = Math.min(prevState.indexDialogue + 1, this.props.guildeData.dialogue.length);
            return {
                indexDialogue: nextIndex,
                writtedDialogue: this.props.guildeData.dialogue.slice(0, nextIndex)
            };
        });
    }

    handleJoinGuilde = async (guildeId) => {
        const response = await UserActionApi.joinGuilde(guildeId);
        toast.info(response.message);
    }

    render(){
        const guildes = this.props.guildeData.guildes || [];
        return(
            <div className={styles.body}>
                <p className={styles.dialogue}>{this.state.writtedDialogue}</p>

                {guildes.length > 0 && (
                    <>
                        <div className={styles.listHead}>
                            <span className={styles.listBar}/>
                            <span className={styles.listTitle}>Liste des guildes</span>
                        </div>
                        <div className={styles.guildes}>
                            {guildes.map(guilde => (
                                <div key={guilde.id} className={styles.guildeRow}>
                                    <div className={styles.guildeInfo}>
                                        <span className={styles.guildeName}>{guilde.nom}</span>
                                        <span className={styles.guildeDesc}>{guilde.description}</span>
                                    </div>
                                    <span className={styles.guildeLevel}>
                                        <span className={styles.guildeLevelLabel}>Niveau</span>
                                        <span className={styles.guildeLevelValue}>{guilde.niveau}</span>
                                    </span>
                                    <GameButton onClick={() => this.handleJoinGuilde(guilde.id)}>Rejoindre</GameButton>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )
    }

}

export default GuildeView
