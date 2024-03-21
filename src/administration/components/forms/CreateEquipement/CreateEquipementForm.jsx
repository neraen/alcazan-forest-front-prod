import React from "react";
import EquipementApi from "../../../../services/EquipementApi";
import Field from "../../../../components/forms/field/Field";
import Select from "../../../../components/forms/select/Select";

class CreateEquipementForm extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            icone: "",
            prixRevente: 0,
            prixAchat: 0,
            levelMin: 0,
            description: "",
            positionEquipement: 1,
            rarity: 1,
            caracteristiques: {},
            classe: 1,
            positions: [],
            rarities: [],
            classes: [],
            listeCaracteristiques: [],
            equipements: [],
            idEquipement: 0
        }
    }

    componentDidMount() {
        this.fetchFormElements();
        this.fetchEquipements();
    }

    handleChange({ currentTarget }){
        const { name, value } = currentTarget;
        console.log(name, value);
        this.setState({ ...this.state, [name]: value });
    };

    handleChangeCaracteristiques({ currentTarget }){
        const { name, value } = currentTarget;
        const caracteristiques = {...this.state.caracteristiques, [name]: value};
        caracteristiques[name] = value;
        this.setState({caracteristiques});
    };


    async fetchFormElements(){
        const formElements = await EquipementApi.fetchFormElements();
        this.setState({
            listeCaracteristiques: formElements.caracteristiques,
            classes: formElements.classes,
            rarities: formElements.rarities,
            positions: formElements.positions
        })
    }

    async fetchEquipements(){
        const equipements = await EquipementApi.getAllEquipementsGrouped();
        this.setState({...this.state, equipements: equipements})
        console.log(this.state);
    }


    async handleSubmit(event){
        event.preventDefault();
        const equipement = {
            name: this.state.name,
            icone:this.state.icone,
            prixRevente: this.state.prixRevente,
            prixAchat:this.state.prixAchat,
            levelMin: this.state.levelMin,
            description: this.state.description,
            positionEquipement: this.state.positionEquipement,
            classe: this.state.classe,
            rarity: this.state.rarity,
            caracteristiques: this.state.caracteristiques,
            idEquipement: this.state.idEquipement
        }
        await EquipementApi.create(equipement);
    }

    render() {
        return(
            <>
                <h2 className="title-map-font">Création d'équipement</h2>
                <Select name="idEquipement" label="editer equipement" value={this.state.idEquipement} onChange={(event) => this.handleChange(event)}>
                    <option key={0} value={0}>Créer un équipement</option>
                    {this.state.equipements && this.state.equipements.map(equipement =>
                        <option key={equipement.id} value={equipement.id}>{equipement.nom}</option>
                    )}
                </Select>
                <form className="create-equipement-form" onSubmit={() => this.handleSubmit()}>
                    <div className="create-equipement-form-body">
                        <div className="form-equipement-values">
                            <Field  name="name" label="Nom" value={this.state.name} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="icone" type="text" label="Icone" value={this.state.icone} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="description" label="Description" value={this.state.skin} onChange={(event) =>this.handleChange(event)}/>
                            <Field  name="prixAchat" type="number" label="Prix d'achat" value={this.state.prixAchat} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="prixRevente" type="number" label="Prix de revente" value={this.state.prixRevente} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="levelMin" type="number" label="Level Minimum" value={this.state.levelMin} onChange={(event) => this.handleChange(event)}/>
                            <Select name="positionEquipement" label="Position de l'équipement : " value={this.state.positionEquipement} onChange={(event) => this.handleChange(event)}>
                                {this.state.positions && this.state.positions.map(position =>
                                    <option key={position.id} value={position.id}>{position.name}</option>
                                )}
                            </Select>
                            <Select name="rarity" label="Rareté : " value={this.state.rarity} onChange={(event) => this.handleChange(event)}>
                                {this.state.rarities && this.state.rarities.map(rarity =>
                                    <option key={rarity.id} value={rarity.id}>{rarity.name}</option>
                                )}
                            </Select>
                            <Select name="classe" label="Classe : " value={this.state.classe} onChange={(event) => this.handleChange(event)}>
                                {this.state.classes && this.state.classes.map(classe =>
                                    <option key={classe.id} value={classe.id}>{classe.nom}</option>
                                )}
                            </Select>
                        </div>
                        <div className="form-equipement-caracteristiques">
                        {this.state.listeCaracteristiques && this.state.listeCaracteristiques.map(caracteristique =>
                            <Field key={caracteristique.id} label={caracteristique.nom} name={caracteristique.nom} value={this.state.caracteristiques[caracteristique.nom]} onChange={(event) => this.handleChangeCaracteristiques(event)}/>
                        )}
                        </div>
                    </div>

                    <div className="create-equipement-form-footer">
                        <button type="submit" onClick={(event) => this.handleSubmit(event)}>Creer l'équipement</button>
                    </div>
                </form>
            </>
        );
    }

}

export default CreateEquipementForm;