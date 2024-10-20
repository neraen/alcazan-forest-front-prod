import React from 'react'


const ObjetElement = ({objet}) => {
    return (
        <div className="inventaire-item" key={objet.idObjet}>
            <img className="inventaire-item-case-img" src={'../img/objet/'+objet.imageObjet}/>
            <div className="inventaire-item-case-quantity">{objet.quantity}</div>
            <div className="inventaire-item-hover">
                <div className="inventaire-item-hover-header">
                    {objet.nomObjet}
                </div>
                <div className="inventaire-item-hover-body">
                    <div className="inventaire-item-element">
                        <div className="inventaire-item-element-strong">Description : </div>
                        <div className="inventaire-item-element-italic"> {objet.descriptionObjet} </div>
                    </div>
                    <div className="inventaire-item-element">
                        <div className="inventaire-item-element-strong">valeur : {objet.prixReventeObjet} Pièces d'or </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ObjetElement;
