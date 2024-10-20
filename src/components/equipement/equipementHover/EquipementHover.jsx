export default function EquipementHover ({equipement}) {
    return (
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
                    <div className="inventaire-item-element-strong">valeur : {equipement.prixReventeEquipement} Pièces d'or </div>

                </div>
            </div>
            <div className="inventaire-item-hover-footer">
                Niveau requis : {equipement.levelMinEquipement}
            </div>
        </div>
    )
}