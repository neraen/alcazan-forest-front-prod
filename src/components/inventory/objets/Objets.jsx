import React, {useEffect, useState} from "react";
import ConsommableElement from "../consommableElement/ConsommableElement";
import ObjetElement from "../objetElement/ObjetElement";


class Objets extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            consommable: props.consommable,
            equipedConsommable: []
        }
    }

   componentDidMount() {
       this.fetchEquipedConsommable()
   }

    fetchEquipedConsommable = () => {

    }

    render() {
        return <>

                <div className="inventaire-layout">
                    <div className="inventaire-left-part">
                        <h4 className="inventaire-subtitle">Consommables</h4>
                            <div className="inventaire-consommables">
                                <div  className="inventaire-items">
                                    { this.props.consommables && this.props.consommables.map((consommable, index) =>
                                         <ConsommableElement key={index} consommable={consommable}/>
                                    )}
                                </div>
                            </div>
                    </div>
                    <div className="inventaire-right-part">
                        <h4 className="inventaire-subtitle">Objets</h4>
                        <div className="inventaire-objets">
                            <div className="inventaire-items">
                                { this.props.objets && this.props.objets.map((objet, index) =>
                                    <ObjetElement key={index} objet={objet}/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </>
    }
}



export default Objets;