import React from "react"
import {toast} from "react-toastify";
import UserActionApi from "../../../services/UserActionApi";

/**
 * Registre des guildes d'un PNJ "guilde". Les données arrivent en props
 * depuis PnjInteractionHost ({dialogue, guildes}) : plus de fetch interne.
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
            <div className="quest-modal-body">
                <div className="guilde-body-transition dungeons-font">{this.state.writtedDialogue}</div><br />
                {guildes.length > 0 && (
                    <>
                        <h2 className="title-guilde-list">Liste des guildes</h2>
                        <table className="table-guilde-list">
                            <tbody>
                            <tr className="tr-guilde-list">
                                <th className="th-guilde-list">Nom</th>
                                <th className="th-guilde-list">Description</th>
                                <th className="th-guilde-list">Niveau</th>
                                <th className="th-guilde-list">Icone</th>
                                <th className="th-guilde-list">Actions</th>
                            </tr>
                            {guildes.map(guilde => (
                                <tr key={guilde.id} className="tr-guilde-list">
                                    <td className="th-guilde-list">{guilde.nom}</td>
                                    <td className="th-guilde-list">{guilde.description}</td>
                                    <td className="th-guilde-list">{guilde.niveau}</td>
                                    <td className="th-guilde-list">{guilde.icone}</td>
                                    <td className="th-guilde-list flex-row">
                                        <button onClick={() => this.handleJoinGuilde(guilde.id)}>Rejoindre</button>
                                        <button>Détails</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                    )}
            </div>
        )
    }

}

export default GuildeView
