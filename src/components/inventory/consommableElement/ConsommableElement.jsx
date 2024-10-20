import React from 'react'


 const ConsommableElement = ({consommable}) => {
    
    return (
        <div className="inventaire-item" key={consommable.idConsommable}>
            <img className="inventaire-item-case-img" src={'../img/consommables/'+consommable.imageConsommable}/>
            <div className="inventaire-item-case-quantity">{consommable.quantity}</div>
            <div className="inventaire-item-hover">
                <div className="inventaire-item-hover-header">
                    {consommable.nomConsommable}
                </div>
                <div className="inventaire-item-hover-body">
                    <div className="inventaire-item-element">
                        <div className="inventaire-item-element-strong">Description : </div>
                        <div className="inventaire-item-element-italic"> {consommable.descriptionConsommable} </div>
                    </div>
                    <div className="inventaire-item-element">
                        <div className="inventaire-item-element-strong">valeur : {consommable.prixReventeConsommable} Pièces d'or </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsommableElement