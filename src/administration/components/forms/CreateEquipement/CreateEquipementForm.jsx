import React from "react";
import EquipementApi from "../../../../services/EquipementApi";
import Field from "../../../../components/forms/field/Field";
import Select from "../../../../components/forms/select/Select";
import equipements from "../../../../components/inventory/equipement/Equipements";

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
            positionEquipementName: "",
            rarity: 1,
            caracteristiques: [],
            classe: 1,
            positions: [],
            rarities: [],
            classes: [],
            listeCaracteristiques: [],
            equipements: [],
            idEquipement: 0
        }
    }

    setCurrentEquipement(){
        const idEquipement = this.state.idEquipement;
        if(idEquipement === 0){
            this.setBlanckEquipement();
        }else{
            const currentEquipement = this.state.equipements.find(equipement => equipement.id == idEquipement);
            console.log(currentEquipement);
            const caracteristiques = this.mapCaracteristiqueWithForm(currentEquipement.caracteristiques)
            console.log(currentEquipement);
            this.setState({
                name: currentEquipement.nom,
                icone: currentEquipement.icone,
                prixRevente: currentEquipement.prixRevente,
                prixAchat: currentEquipement.prixAchat,
                levelMin: currentEquipement.levelMin,
                description: currentEquipement.description,
                positionEquipement: currentEquipement.positionEquipementId,
                positionEquipementName: currentEquipement.positionEquipementName,
                rarity: currentEquipement.rarityId,
                classe: currentEquipement.classeId,
                caracteristiques: caracteristiques
            })
        }

    }

    mapCaracteristiqueWithForm(caracteristiques){
        const mappedCaracteristiques = [];
        this.state.listeCaracteristiques.forEach(listedCaracteristique => {
            const caracteristique = caracteristiques.find(caracteristique => listedCaracteristique.nom === caracteristique.nom)
            if(caracteristique){
                mappedCaracteristiques.push(caracteristique)
            }else{
                mappedCaracteristiques.push({...listedCaracteristique, valeur: 0})
            }
        })

        return mappedCaracteristiques;
    }

    setBlanckEquipement(){
        const caracteristiques = this.mapCaracteristiqueWithForm([]);
        this.setState( {
            name: "",
            icone: "",
            prixRevente: 0,
            prixAchat: 0,
            levelMin: 0,
            description: "",
            positionEquipement: 1,
            rarity: 1,
            classe: 1,
            caracteristiques: caracteristiques,
            idEquipement: 0
        });
    }

    componentDidMount() {
        this.fetchFormElements();
        this.fetchEquipements();


    }

    handleChange({ currentTarget }){
        const { name, value } = currentTarget;
        this.setState({ ...this.state, [name]: value });
    };

    handleChangeCaracteristiques({ currentTarget }){
        const { name, value } = currentTarget;
        console.log(value);
        console.log(this.state);
        const caracteristiques = [...this.state.caracteristiques];
        const updatedCaracteristiques = caracteristiques.map(caracteristique => {
            console.log(value)
            if(caracteristique.nom === name){
                console.log('int : '+value)
                caracteristique = {
                    nom: caracteristique.nom,
                    id: caracteristique.id,
                    valeur: value
                }
            }
            return caracteristique
        });
        console.log(updatedCaracteristiques);
        this.setState({caracteristiques:  updatedCaracteristiques});
    };

    handleChangeEquipement({currentTarget}){
        this.setState({idEquipement: currentTarget.value}, () => this.setCurrentEquipement())
    }

    async fetchFormElements(){
        const formElements = await EquipementApi.fetchFormElements();
        this.setState({
            listeCaracteristiques: formElements.caracteristiques,
            classes: formElements.classes,
            rarities: formElements.rarities,
            positions: formElements.positions
        }, () =>  this.setCurrentEquipement())
    }

    async fetchEquipements(){
        const equipements = await EquipementApi.getAllEquipementsInfo();
        this.setState({...this.state, equipements: equipements})
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
        console.log(equipement);
        await EquipementApi.create(equipement);
    }

    get idEquipement(){
        return this.state.idEquipement
    }

    render() {
        return(
            <div className="create-equipement-page">
                <h2 className="title-map-font">Création d'équipement</h2>

                <div className="equipement-selector">
                    <Select name="idEquipement" label="editer equipement" value={this.state.idEquipement} onChange={(event) => this.handleChangeEquipement(event)}>
                        <option key={0} value={0}>Créer un équipement</option>
                        {this.state.equipements && this.state.equipements.map(equipement =>
                            <option key={equipement.id} value={equipement.id}>{equipement.nom}</option>
                        )}
                    </Select>
                </div>

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
                            {this.state.listeCaracteristiques && this.state.caracteristiques.length > 0 && this.state.listeCaracteristiques.map((caracteristique, index) =>
                                <Field key={caracteristique.id} type='number' label={caracteristique.nom} name={caracteristique.nom} value={this.state.caracteristiques[index].valeur} onChange={(event) => this.handleChangeCaracteristiques(event)}/>
                            )}
                        </div>
                        <div className="form-icon-equipement">
                            {this.state.idEquipement > 0 && (
                                <>
                                    <img src={"../img/equipement/" + this.state.positionEquipementName + "/"+ this.state.icone} alt={this.state.name}/>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="create-equipement-form-footer">
                        <button type="submit" onClick={(event) => this.handleSubmit(event)}>Creer l'équipement</button>
                    </div>
                </form>
            </div>
        );
    }

}

export default CreateEquipementForm;