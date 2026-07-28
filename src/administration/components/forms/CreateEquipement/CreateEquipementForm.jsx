import React from "react";
import {toast} from "react-toastify";
import EquipementApi from "../../../../services/EquipementApi";
import Field from "../../../../components/forms/field/Field";
import Select from "../../../../components/forms/select/Select";

/**
 * Aperçu du nom de fichier que le back va produire : doit rester aligné sur l'AsciiSlugger de
 * `EquipementIconeUploader` ("Bouclier du pleutre" => "bouclier-du-pleutre").
 */
const slugifyNom = (nom) => (nom || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Extension normalisée côté back (jpeg => jpg). */
const extensionFichier = (file) => {
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    return extension === "jpeg" ? "jpg" : extension;
};

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
            // Ids des classes autorisées ; vide = équipement toutes classes.
            classesSelectionnees: [],
            positions: [],
            rarities: [],
            classes: [],
            listeCaracteristiques: [],
            equipements: [],
            idEquipement: 0,
            iconeFile: null,
            iconePreview: "",
            saving: false
        }
    }

    componentWillUnmount() {
        this.resetIconeFile();
    }

    /** Libère l'URL d'aperçu locale (createObjectURL) avant d'en créer une autre. */
    resetIconeFile(){
        if(this.state.iconePreview){
            URL.revokeObjectURL(this.state.iconePreview);
        }
    }

    /** Nom du dossier d'images correspondant à la position sélectionnée ("bras-droit"…). */
    get positionName(){
        const position = this.state.positions.find(position => String(position.id) === String(this.state.positionEquipement));
        return position ? position.name : this.state.positionEquipementName;
    }

    /** Nom de fichier que produira l'upload, affiché en clair dans le formulaire. */
    get iconeCible(){
        const slug = slugifyNom(this.state.name);
        if(!this.state.iconeFile || !slug){
            return "";
        }
        return `${slug}.${extensionFichier(this.state.iconeFile)}`;
    }

    async setCurrentEquipement(){
        const idEquipement = this.state.idEquipement;
        let equipements = this.state.equipements;

        // Liste locale périmée (import CSV, autre onglet d'admin…) : on la recharge avant de
        // conclure que l'équipement n'existe pas, sinon le formulaire se viderait en silence
        // en réponse à un clic sur un objet pourtant bien présent dans le catalogue.
        if(Number(idEquipement) > 0 && !equipements.find(equipement => equipement.id == idEquipement)){
            try {
                equipements = await this.fetchEquipements();
            } catch (error) {
                // Rechargement impossible : on retombe sur le formulaire vierge plus bas.
            }
        }

        const currentEquipement = Number(idEquipement) > 0
            ? equipements.find(equipement => equipement.id == idEquipement)
            : null;
        // Garde-fou : id 0 (création) ou données pas encore chargées => formulaire vierge.
        if(!currentEquipement){
            this.setBlanckEquipement();
        }else{
            const caracteristiques = this.mapCaracteristiqueWithForm(currentEquipement.caracteristiques)
            this.resetIconeFile();
            this.setState({
                iconeFile: null,
                iconePreview: "",
                name: currentEquipement.nom,
                icone: currentEquipement.icone,
                prixRevente: currentEquipement.prixRevente,
                prixAchat: currentEquipement.prixAchat,
                levelMin: currentEquipement.levelMin,
                description: currentEquipement.description,
                positionEquipement: currentEquipement.positionEquipementId,
                positionEquipementName: currentEquipement.positionEquipementName,
                rarity: currentEquipement.rarityId,
                // Liste vide = équipement toutes classes (aucune restriction).
                classesSelectionnees: (currentEquipement.classes || []).map(classe => classe.id),
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
        this.resetIconeFile();
        this.setState( {
            iconeFile: null,
            iconePreview: "",
            name: "",
            icone: "",
            prixRevente: 0,
            prixAchat: 0,
            levelMin: 0,
            description: "",
            positionEquipement: 1,
            rarity: 1,
            classesSelectionnees: [],
            caracteristiques: caracteristiques,
            idEquipement: 0
        });
    }

    componentDidMount() {
        this.fetchFormElements();
        this.fetchEquipements();
    }

    // Sélection pilotée par le catalogue parent (externalSelectedId).
    componentDidUpdate(prevProps) {
        if (prevProps.externalSelectedId !== this.props.externalSelectedId) {
            this.setState({idEquipement: this.props.externalSelectedId ?? 0}, () => this.setCurrentEquipement());
        }
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

    /** Bascule une classe dans/hors de la sélection (relation N-N equipement_classe). */
    toggleClasse(idClasse){
        const id = Number(idClasse);
        this.setState(({classesSelectionnees}) => ({
            classesSelectionnees: classesSelectionnees.includes(id)
                ? classesSelectionnees.filter(candidat => candidat !== id)
                : [...classesSelectionnees, id]
        }));
    }

    /** « Toutes les classes » = aucune restriction, donc aucune classe liée. */
    selectionnerToutesClasses(){
        this.setState({classesSelectionnees: []});
    }

    handleChangeIcone({currentTarget}){
        const file = currentTarget.files && currentTarget.files[0];
        this.resetIconeFile();
        this.setState({
            iconeFile: file || null,
            iconePreview: file ? URL.createObjectURL(file) : ""
        });
    }

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

    /** Résout sur la liste fraîche, une fois le state appliqué : les appelants enchaînent dessus. */
    async fetchEquipements(){
        const equipements = await EquipementApi.getAllEquipementsInfo();
        return new Promise(resolve => this.setState({equipements: equipements}, () => resolve(equipements)));
    }


    async handleSubmit(event){
        if(event){
            event.preventDefault();
        }
        // Le bouton déclenche aussi le submit du <form> : `saving` évite le double envoi.
        if(this.state.saving){
            return;
        }

        // L'image part d'abord : le back la renomme d'après le nom saisi et renvoie le nom de
        // fichier à enregistrer dans `icone`.
        let icone = this.state.icone;
        if(this.state.iconeFile && !slugifyNom(this.state.name)){
            toast.error("Nommez l'équipement avant d'envoyer une image.");
            return;
        }

        this.setState({saving: true});
        if(this.state.iconeFile){
            try {
                icone = await EquipementApi.uploadIcone(this.state.iconeFile, {
                    name: this.state.name,
                    positionEquipement: this.state.positionEquipement,
                    currentIcone: this.state.icone
                });
            } catch (error) {
                this.setState({saving: false});
                toast.error(error.response?.data?.error || "Échec de l'envoi de l'image.");
                return;
            }
        }

        const equipement = {
            name: this.state.name,
            icone: icone,
            prixRevente: this.state.prixRevente,
            prixAchat:this.state.prixAchat,
            levelMin: this.state.levelMin,
            description: this.state.description,
            positionEquipement: this.state.positionEquipement,
            classes: this.state.classesSelectionnees,
            rarity: this.state.rarity,
            caracteristiques: this.state.caracteristiques,
            idEquipement: this.state.idEquipement
        }
        const etaitEnEdition = Number(this.state.idEquipement) > 0;
        try {
            const enregistre = await EquipementApi.create(equipement);
            this.resetIconeFile();
            // On adopte l'id renvoyé par le back : sans ça le formulaire restait en mode
            // « création » après un premier enregistrement, et le clic suivant (typiquement
            // pour ajouter l'image) créait un doublon au lieu de compléter l'objet.
            const idEnregistre = enregistre && enregistre.id ? enregistre.id : this.state.idEquipement;
            this.setState({idEquipement: idEnregistre, icone: icone, iconeFile: null, iconePreview: "", positionEquipementName: this.positionName});
            toast.success(etaitEnEdition ? "Équipement modifié." : "Équipement créé.");
            await this.fetchEquipements();
            if(this.props.onSaved){
                this.props.onSaved(idEnregistre);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Échec de l'enregistrement.");
        } finally {
            this.setState({saving: false});
        }
    }

    get idEquipement(){
        return this.state.idEquipement
    }

    render() {
        return(
            <div className="create-equipement-page">
                <h2 className="title-map-font">Création d'équipement</h2>

                {!this.props.hideSelector && (
                    <div className="equipement-selector">
                        <Select name="idEquipement" label="editer equipement" value={this.state.idEquipement} onChange={(event) => this.handleChangeEquipement(event)}>
                            <option key={0} value={0}>Créer un équipement</option>
                            {this.state.equipements && this.state.equipements.map(equipement =>
                                <option key={equipement.id} value={equipement.id}>{equipement.nom}</option>
                            )}
                        </Select>
                    </div>
                )}

                {/* L'event DOIT être transmis : sans preventDefault, une soumission implicite
                    (Entrée dans un champ) déclenche un GET natif du formulaire, la page se
                    recharge en plein upload et l'appel /create ne part jamais — l'image
                    atterrissait sur le disque sans que `icone` ne soit enregistrée en base. */}
                <form className="create-equipement-form" onSubmit={(event) => this.handleSubmit(event)}>
                    <div className="create-equipement-form-body">
                        <div className="form-equipement-values">
                            <Field  name="name" label="Nom" value={this.state.name} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="icone" type="text" label="Icone (nom du fichier)" value={this.state.icone} onChange={(event) => this.handleChange(event)}/>
                            <Field  name="description" label="Description" value={this.state.description} onChange={(event) =>this.handleChange(event)}/>
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
                            <div className="form-group">
                                <span className="form-label">Classes autorisées :</span>
                                <div className="classe-picker">
                                    <button type="button"
                                            className={`classe-chip classe-chip-toutes ${this.state.classesSelectionnees.length === 0 ? "selected" : ""}`}
                                            onClick={() => this.selectionnerToutesClasses()}>
                                        Toutes les classes
                                    </button>
                                    {this.state.classes && this.state.classes.map(classe =>
                                        <button key={classe.id} type="button"
                                                className={`classe-chip ${this.state.classesSelectionnees.includes(classe.id) ? "selected" : ""}`}
                                                onClick={() => this.toggleClasse(classe.id)}>
                                            {classe.nom}
                                        </button>
                                    )}
                                </div>
                                <p className="classe-picker-hint">
                                    {this.state.classesSelectionnees.length === 0
                                        ? "Aucune restriction : l'objet est portable par toutes les classes."
                                        : `Réservé à : ${this.state.classes
                                            .filter(classe => this.state.classesSelectionnees.includes(classe.id))
                                            .map(classe => classe.nom)
                                            .join(", ")}.`}
                                </p>
                            </div>
                        </div>
                        <div className="form-equipement-caracteristiques">
                            {this.state.listeCaracteristiques && this.state.caracteristiques.length > 0 && this.state.listeCaracteristiques.map((caracteristique, index) =>
                                <Field key={caracteristique.id} type='number' label={caracteristique.nom} name={caracteristique.nom} value={this.state.caracteristiques[index].valeur} onChange={(event) => this.handleChangeCaracteristiques(event)}/>
                            )}
                        </div>
                        <div className="form-icon-equipement">
                            <div className="equipement-icone-preview">
                                {this.state.iconePreview
                                    ? <img src={this.state.iconePreview} alt={this.state.name}/>
                                    : (this.state.icone && this.positionName
                                        ? <img src={`/img/equipement/${this.positionName}/${this.state.icone}`} alt={this.state.name}/>
                                        : <span className="equipement-icone-empty">✦</span>)}
                            </div>

                            <label className="equipement-icone-upload">
                                <span>{this.state.iconeFile ? "Changer l'image" : "Choisir une image"}</span>
                                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                                       onChange={(event) => this.handleChangeIcone(event)}/>
                            </label>

                            {this.state.iconeFile && (
                                <p className="equipement-icone-hint">
                                    Sera enregistrée sous&nbsp;:<br/>
                                    <code>img/equipement/{this.positionName || "…"}/{this.iconeCible || "…"}</code>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="create-equipement-form-footer">
                        <button type="submit" disabled={this.state.saving}>
                            {this.state.saving ? "Enregistrement…" : "Creer l'équipement"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

}

export default CreateEquipementForm;