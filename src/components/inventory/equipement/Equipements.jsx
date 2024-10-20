import React from 'react'
import InventaireApi from "../../../services/InventaireApi";
import carateristiqueService from "../../../services/carateristiqueService";
import EquipementCase from "../../equipement/equipementCase/EquipementCase";


class Equipements extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            equipementEquipe: [],
            caracteristiquesBonus: {
                armure: 0,
                force: 0,
                dexterite: 0,
                constitution: 0,
                intelligence: 0,
                concentration: 0,
                chance: 0,
                critique: 0
            }
        }
    }

    componentDidMount() {
        this.fetchEquipementEquipe();
    }

    async fetchEquipementEquipe(){
        console.log('called');
        const dataEquipementEquipe = await InventaireApi.getEquipementEquipe();
        this.setState({equipementEquipe: dataEquipementEquipe}, () => {
            this.computeTotalEquipementCarcacs();
        });
    }

    computeTotalEquipementCarcacs(){
        const caracteristiques = carateristiqueService.computeEquipementCaracs(this.state.equipementEquipe);
        this.setState({caracteristiquesBonus: caracteristiques})
    }

    render() {
        return (<>
            <div className="inventaire-layout">
                <div className="inventaire-left-part">
                    <h4 className="inventaire-subtitle">Items</h4>
                    <div className="inventaire-equipements">
                        <div className="inventaire-items">
                            { this.props.equipements && this.props.equipements.map((equipement) =>
                                <EquipementCase equipement={equipement}
                                                shouldRefreshInventory={this.props.shouldRefreshInventory}/>
                            )}
                        </div>
                    </div>
                </div>
                <div className="inventaire-right-part">
                    <h4 className="inventaire-subtitle">Equipé</h4>
                    <div className="equipement position-relative">

                        {/*<img className="mt-3 ml-3" src="../img/sprites/enemies/actor1_5.png"/>*/}
                        {this.state.equipementEquipe && this.state.equipementEquipe.map((equipement) =>
                            <div onDoubleClick={() => {this.handleTakeOffEquipement(equipement.idEquipement); this.props.shouldRefreshInventory()}} className={"item-case "+equipement.position}><img className="icone-equipement" src={"../img/equipement/"+equipement.position+"/"+equipement.imageEquipement} alt=""/>
                                <div className={"inventaire-item-hover " + equipement.rarityName}>
                                    <div className="inventaire-item-hover-header">
                                        {equipement.nomEquipement}
                                    </div>
                                    <div className="inventaire-item-hover-body">
                                        <div className="inventaire-item-title">- Caractéristiques -</div>
                                        {equipement.caracteristiques.map((caracteristique) =>
                                            <div key={'caracteristique'+caracteristique.id}>
                                                {caracteristique.nom[0].toUpperCase()+caracteristique.nom.slice(1)} : + {caracteristique.valeur}
                                            </div>
                                        )}
                                        <hr />
                                        <div className="inventaire-item-element">
                                            <div className="inventaire-item-element-strong">Description : </div>
                                            <div className="inventaire-item-element-italic"> {equipement.descriptionEquipement} </div>
                                        </div>
                                        <div className="inventaire-item-element">
                                            <div className="inventaire-item-element-strong">valeur : {equipement.prixReventeEquipement} <img src="../../../img/gui/MainWindowCharacter/Icons/Money03.png" /> </div>

                                        </div>
                                    </div>
                                    <div className="inventaire-item-hover-footer">
                                        Niveau requis : {equipement.levelMinEquipement}
                                    </div>
                                </div>
                            </div>
                        )}
                        <img className="equipements-character-class" src="../../../img/character_guerrier_homme.png"/>
                    </div>
                    <div className="inventaire-equipement-caracteristiques">
                        <h4 className="inventaire-subtitle mt-4">Bonus</h4>
                        <div>armure : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.armure} </span></div>
                        <div>constitution : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.constitution} </span></div>
                        <div>force : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.force} </span></div>
                        <div>dexterité : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.dexterite}</span></div>
                        <div>intelligence : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.intelligence} </span></div>
                        <div>concentration :<span className="font-weight-bold"> + {this.state.caracteristiquesBonus.concentration}</span></div>
                        <div>chance : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.chance} </span></div>
                        <div>critique : <span className="font-weight-bold"> + {this.state.caracteristiquesBonus.critique} </span></div>
                    </div>
                </div>
            </div>
        </>)
    }
}

export default Equipements;