import React from 'react'
import {toast} from "react-toastify";
import MapApi from "../../../services/MapApi";
import Case from "../case/Case";
import UsersApi from "../../../services/UsersApi";
import MapContext from "../../../contexts/MapContext";
import {connect} from "react-redux";
import {updatePositionJoueur, removePlayerTarget, updateJoueurState, openDonjonPorte, updatePlayerTarget} from "../../../store/actions";
import distanceCalculator from "../../../services/distanceCalculator";
import "../mapGrid.scss";



class Map extends React.Component {

    static contextType = MapContext;

    constructor(props) {
        super(props);
        this.state = {
            cases: [],
            name: "",
            abscisseJoueur: this.props.user.caseAbscisse,
            ordonneeJoueur: this.props.user.caseOrdonnee,
            users: [],
            unabledCases: [],
            mapId: this.props.user.mapId,
            isInstance: false,
            portesDonjon: {},
            interactions: {},
            modesRecolte: []
        };
        this.props.updatePositionJoueur({abscisse: this.props.user.caseAbscisse, ordonnee: this.props.user.caseOrdonnee})
    }

    componentDidMount() {
        try {
            this.fetchMapData();
        }catch(error){

        }
        this.listenKeyboard();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Uniquement sur le front montant : la remise à false ci-dessous
        // redéclenchait un second fetch de la carte.
        if(!prevProps.joueurState.needRefresh && this.props.joueurState.needRefresh){
            this.fetchMapData();
            this.props.updateJoueurState({
                needRefresh: false
            })
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyboardHandler);
    }

    async fetchMapData(){
        const mapId = this.props.joueurState.mapId ? this.props.joueurState.mapId : this.state.mapId
        const data = await MapApi.find(mapId);
        // La carte peut avoir été rechargée après une téléportation décidée par le SERVEUR
        // (entrée en groupe dans un donjon, éjection d'une instance expirée, mort) : la
        // position du joueur est donc réadoptée depuis la réponse, jamais devinée ici.
        this.setState({
            cases: data.cases,
            name: data.mapInfo.nom,
            isInstance: data.mapInfo.isInstance,
            mapId: data.mapId !== undefined ? data.mapId : mapId,
            portesDonjon: data.portesDonjon || {},
            interactions: data.interactions || {},
            modesRecolte: data.modesRecolte || [],
            abscisseJoueur: data.abscisseJoueur !== undefined ? data.abscisseJoueur : this.state.abscisseJoueur,
            ordonneeJoueur: data.ordonneeJoueur !== undefined ? data.ordonneeJoueur : this.state.ordonneeJoueur,
        }, () => {
            this.props.setMapLoaded(this.state.name);
            this.props.updatePositionJoueur({abscisse: this.state.abscisseJoueur, ordonnee: this.state.ordonneeJoueur});
            this.majCibleMonstreInstance(this.state.cases, this.state.abscisseJoueur, this.state.ordonneeJoueur);
        });
        this.setState({unabledCases: this.getUnabledMove()});
    }

    /**
     * Un monstre d'instance (population d'une salle, renfort d'un boss) se cible comme
     * tous les monstres du jeu : AUTOMATIQUEMENT, parce qu'on est sur sa case, et jamais
     * autrement. Il n'est pas dessiné sur la carte, exactement comme les monstres du monde
     * ouvert (peints dans l'image de fond).
     *
     * Le monde ouvert fait ce ciblage au montage du composant Player (prop `hasMonstre`) ;
     * ici c'est Map qui s'en charge, parce que c'est le seul endroit qui sache quelle case
     * est LA MIENNE — Player est aussi rendu pour les autres membres du groupe, et cibler
     * le monstre sur lequel un coéquipier se tient n'aurait aucun sens.
     */
    majCibleMonstreInstance(cases, abscisse, ordonnee){
        const maCase = (cases || []).find(uneCase => uneCase.abscisse === abscisse && uneCase.ordonnee === ordonnee);
        const renfortId = maCase && maCase.renfortId ? maCase.renfortId : null;

        if(renfortId){
            this.props.updatePlayerTarget({targetId: renfortId, type: "renfort"});
        }else if(this.props.target.type === "renfort"){
            this.props.removePlayerTarget();
        }
    }

    listenKeyboard() {
        // Handler mémorisé pour pouvoir le retirer au démontage
        // (l'ancien listener anonyme s'accumulait à chaque montage de Map).
        // keydown (et non keypress, déprécié) : plus fiable selon navigateur/focus.
        // Retrait défensif de l'ancien handler avant d'en recréer un : évite un
        // doublon si listenKeyboard est rappelé (HMR, remontage) sans passer par
        // componentWillUnmount.
        if (this.keyboardHandler) {
            document.removeEventListener("keydown", this.keyboardHandler);
        }
        this.keyboardHandler = (event) => this.handleKeybord(event);
        document.addEventListener("keydown", this.keyboardHandler)
    }

    handleKeybord(event){
        // Pas de déplacement quand une modale de jeu est ouverte (inventaire, profil…) :
        // les touches iraient au jeu pendant une saisie (recherche) ou une consultation.
        if (document.querySelector('[data-game-modal]')) {
            return;
        }
        // Raccourcis (Cmd/Ctrl/Alt + touche) : laisser passer, ne pas déplacer.
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
        // Saisie clavier dans un champ (recherche, formulaire…) : ne pas déplacer.
        const target = event.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA"
            || target.tagName === "SELECT" || target.isContentEditable)) {
            return;
        }
        switch (event.key.toLowerCase()){
            case "z":
                if(this.verifiyMove(this.state.abscisseJoueur, this.state.ordonneeJoueur - 1)){
                    this.updatePosition( this.state.abscisseJoueur, this.state.ordonneeJoueur - 1);
                }else{
                    //toast.error("Un obstacle vous empeche d'aller à cet endroit")
                }
                break;
            case "s":
                if(this.verifiyMove(this.state.abscisseJoueur, this.state.ordonneeJoueur + 1)) {
                    this.updatePosition(this.state.abscisseJoueur, this.state.ordonneeJoueur + 1);
                }else{
                    //toast.error("Un obstacle vous empeche d'aller à cet endroit")
                }
                break;
            case "q":
                if(this.verifiyMove(this.state.abscisseJoueur - 1, this.state.ordonneeJoueur)) {
                    this.updatePosition(this.state.abscisseJoueur - 1, this.state.ordonneeJoueur);
                }else{
                    //toast.error("Un obstacle vous empeche d'aller à cet endroit")
                }
                break;
            case "d":
                if(this.verifiyMove(this.state.abscisseJoueur + 1, this.state.ordonneeJoueur)) {
                    this.updatePosition(this.state.abscisseJoueur + 1, this.state.ordonneeJoueur);
                }else{
                    //toast.error("Un obstacle vous empeche d'aller à cet endroit")
                }
                break;
        }
    }

    async updatePosition(abscisse, ordonnee){
        const data = await UsersApi.updatePosition(this.state.mapId, abscisse, ordonnee)
        // Un monstre ne reste ciblé que tant qu'on est sur sa case : quitter la case
        // décible, qu'il s'agisse d'un monstre du monde ouvert ou d'un monstre d'instance.
        if(this.props.target.type === "monstre" || this.props.target.type === "renfort"){
            this.props.removePlayerTarget();
        }

        this.setState({abscisseJoueur: data.abscisseJoueur, ordonneeJoueur: data.ordonneeJoueur, cases: data.cases, mapId: data.mapId},
            () => {
                this.setState({ unabledCases: this.getUnabledMove() })
                this.props.updatePositionJoueur({abscisse: data.abscisseJoueur, ordonnee: data.ordonneeJoueur})
                this.props.updateJoueurState({lifeJoueur: data.life, manaJoueur: data.mana, pm: data.pm})
                this.majCibleMonstreInstance(data.cases, data.abscisseJoueur, data.ordonneeJoueur)
            });

        if(data.ordonneeJoueur !== ordonnee || data.abscisseJoueur !== abscisse){
            //toast.error("Un obstacle vous empeche d'aller à cet endroit");
        }

    }

    async changeMap(targetMapId, targetWrap, clickedWrap){
        const mapPosition = await UsersApi.changeMap(targetMapId, targetWrap, clickedWrap);
        if(mapPosition.message !== undefined && mapPosition.mapId === undefined){
            // Passage refusé par le serveur (condition de salle de donjon, condition de
            // wrap, verrou quotidien…). Sans ce toast, le clic sur la porte ne faisait
            // RIEN de visible : le joueur croyait à un bug de la carte.
            toast.error(mapPosition.message);
        }else{
            const mapData = await MapApi.find(mapPosition.mapId);
            this.setState({
                cases: mapData.cases,
                name: mapData.mapInfo.nom,
                mapId: mapData.mapId,
                ordonneeJoueur: mapPosition.ordonnee,
                abscisseJoueur: mapPosition.abscisse,
                isInstance: mapData.mapInfo.isInstance,
                portesDonjon: mapData.portesDonjon || {},
                interactions: mapData.interactions || {},
                modesRecolte: mapData.modesRecolte || []
            });
            // Remonte le nouveau nom de zone à la fiche joueur (présentation uniquement)
            this.props.setMapLoaded(mapData.mapInfo.nom);
            this.props.updateJoueurState({mapId: mapData.mapId})
            this.props.updatePositionJoueur({abscisse: mapPosition.abscisse, ordonnee:  mapPosition.ordonnee })
            this.setState({unabledCases: this.getUnabledMove()});
            this.props.removePlayerTarget();
            // Population d'une salle de donjon apparue à l'arrivée du groupe : les monstres
            // n'étant pas dessinés (comme partout ailleurs dans le jeu), cette annonce est
            // le seul signal qu'il y a quelque chose à nettoyer ici.
            if(mapPosition.annonce){
                toast.warning(mapPosition.annonce);
            }
            this.majCibleMonstreInstance(mapData.cases, mapPosition.abscisse, mapPosition.ordonnee);
        }
    }

    verifiyMove(abscisse, ordonnee){
        const newCase = this.state.cases.filter(oneCase => oneCase.abscisse === abscisse && oneCase.ordonnee === ordonnee)[0];
        if(newCase !== undefined){
            const newCaseId = this.state.cases.filter(oneCase => oneCase.abscisse === abscisse && oneCase.ordonnee === ordonnee)[0].carteCarreauId;
            return this.state.unabledCases.filter(oneCase => oneCase === newCaseId).length
        }
       return false;
    }

    getUnabledMove(){
        const filteredOrdonnee= [ this.state.ordonneeJoueur-1, this.state.ordonneeJoueur, this.state.ordonneeJoueur+1 ];
        const filteredAbscisse= [ this.state.abscisseJoueur-1, this.state.abscisseJoueur, this.state.abscisseJoueur+1 ];

        const filteredCases = this.state.cases.filter(oneCase => {
            return filteredAbscisse.includes(oneCase.abscisse) && filteredOrdonnee.includes(oneCase.ordonnee) && oneCase.isUsable
            && !(oneCase.abscisse === this.state.abscisseJoueur && oneCase.ordonnee === this.state.ordonneeJoueur || oneCase.userId !== null || oneCase.pnjId !== null)

        })

        return filteredCases.map(oneCase => oneCase = oneCase.carteCarreauId);
    }


    handleClick(clickedCase){
        if(clickedCase.isWrap){
            const distance = distanceCalculator.computeDistance(clickedCase.abscisse, clickedCase.ordonnee, this.state.abscisseJoueur, this.state.ordonneeJoueur)
            if(distance <= 1){
                // Une porte de donjon ouvre la modale de groupe au lieu de franchir
                // directement : c'est là qu'on choisit d'y aller seul ou accompagné.
                // Le serveur revérifie tout de toute façon.
                const portes = this.state.portesDonjon || {};
                if(portes[clickedCase.carteCarreauId]){
                    this.props.openDonjonPorte({
                        carteCarreauId: clickedCase.carteCarreauId,
                        targetMapId: clickedCase.targetMapId,
                        targetWrap: clickedCase.targetWrap
                    });
                    return;
                }
                this.changeMap(clickedCase.targetMapId, clickedCase.targetWrap, clickedCase.carteCarreauId)
            }
        }
        else if(this.state.unabledCases.includes(clickedCase.carteCarreauId)){
            this.updatePosition(clickedCase.abscisse, clickedCase.ordonnee);
        }
    }

    getJoueur(uniqueCase){
        if(this.state.abscisseJoueur === uniqueCase.abscisse && this.state.ordonneeJoueur === uniqueCase.ordonnee){
         // Soi-même : forcément présent, puisque c'est ce navigateur qui affiche la page.
         // Une tautologie, pas une règle dupliquée — inutile d'alourdir `/joueur/data/minimal`,
         // chemin chaud rappelé à chaque déplacement, pour la réapprendre au serveur.
         return {...this.props.user, enLigne: 1}
        }else{
            if(!this.state.isInstance){
                if(uniqueCase.userId){
                    // ⚠️ Cette projection est le CONTRAT de `Player` pour les AUTRES joueurs :
                    // le joueur courant, lui, reçoit `this.props.user` en entier juste au-dessus.
                    // Tout champ oublié ici n'existe donc que pour soi-même, ce qui se lit
                    // comme « la donnée manque côté serveur » alors qu'elle descend bien —
                    // c'est ce qui avait fait disparaître l'icône d'alignement d'autrui
                    // (renommée en `alignement`, que `Player` ne lit pas).
                    return {
                        pseudo: uniqueCase.pseudo,
                        nomClasse: uniqueCase.nomClasse,
                        idJoueur: uniqueCase.userId,
                        niveau: uniqueCase.niveau,
                        nomAlignement: uniqueCase.nomAlignement,
                        iconeAlignement: uniqueCase.iconeAlignement,
                        enLigne: uniqueCase.enLigne,
                        sexe: uniqueCase.sexe
                    }
                }
            }
        }
        return false
    }

    /**
     * Index des cases couvertes par une zone annoncée du boss, pour la carte courante.
     * `imminente` (< 3 s) accélère le battement : c'est le dernier avertissement.
     * Le délai vient de `resoudreAt` (horloge SERVEUR) — jamais d'un compteur local.
     */
    getZonesParCase(){
        const combat = this.props.donjon && this.props.donjon.combat;
        if(!combat || !combat.zones){
            return {};
        }

        const index = {};
        combat.zones.forEach(zone => {
            if(zone.carteId !== this.state.mapId){
                return;
            }
            const restant = (new Date(zone.resoudreAt).getTime() - Date.now()) / 1000;
            zone.cases.forEach(caseZone => {
                index[caseZone.abscisse + ":" + caseZone.ordonnee] = {imminente: restant <= 3};
            });
        });

        return index;
    }

    render()
    {
        const zones = this.getZonesParCase();

        return (<>

            <div className="cases" style={{backgroundImage: "url("+require("../../../img/map/"+this.state.mapId+".png").default+")", backgroundSize: 'cover'}}>
                {this.state.cases.map(uniqueCase => (
                    <div  onClick={() =>this.handleClick(uniqueCase)}>
                        <Case key={uniqueCase.carteCarreauId}
                              debug={uniqueCase.carteCarreauId}
                              abscisse={uniqueCase.abscisse}
                              ordonnee={uniqueCase.ordonnee}
                              haveJoueur={this.getJoueur(uniqueCase)}
                              hasMonstre={uniqueCase.hasMonstre ? uniqueCase.hasMonstre : false}
                              hasPnj={uniqueCase.pnjName ? {pnjId: uniqueCase.pnjId, pnjName: uniqueCase.pnjName, pnjSkin: uniqueCase.pnjSkin, pnjAvatar: uniqueCase.pnjAvatar, pnjDescription: uniqueCase.pnjDescription} : false}
                              hasBoss={uniqueCase.bossName ? {bossId: uniqueCase.bossId, bossName: uniqueCase.bossName, bossSkin: uniqueCase.bossSkin} : false}
                              hasAction={uniqueCase.actionName ? {actionName: uniqueCase.actionName, actionId: uniqueCase.actionId} : false}
                              hasInteraction={uniqueCase.interactionId ? {
                                  carteCarreauId: uniqueCase.carteCarreauId,
                                  nom: uniqueCase.interactionNom,
                                  skin: uniqueCase.interactionSkin,
                                  verbe: uniqueCase.interactionType
                              } : false}
                              etatInteraction={(this.state.interactions || {})[uniqueCase.carteCarreauId]}
                              modesRecolte={this.state.modesRecolte}
                              isUnabled={this.state.unabledCases.includes(uniqueCase.carteCarreauId)}
                              zone={zones[uniqueCase.abscisse + ":" + uniqueCase.ordonnee]}
                        />
                    </div>
                ))}
            </div>
        </>)
    }
}

export default connect((state, ownProps) => {
    return {target: state.data.target, joueurState: state.data.joueurState, donjon: state.data.donjon, ownProps};
}, {updatePositionJoueur, removePlayerTarget, updateJoueurState, openDonjonPorte, updatePlayerTarget})(Map);