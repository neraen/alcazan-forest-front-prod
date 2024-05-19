import EquipementCase from "../../equipement/equipementCase/EquipementCase";
import {useState} from "react";

export default function InventoryMinified({items}){

    const [itemsTypeSelected, setItemTypeSelected] = useState("all");

    const shouldRefreshInventory = () => {

    }

    const handleChangeItemType = (itemType) => {
        setItemTypeSelected(itemType)
    }

    return (
        <div className="inventories">
            <div className="inventories-header">
                <div className={"inventories-header-btn " + (itemsTypeSelected === "all" ? "inventory-active" : "")}
                     onClick={() => handleChangeItemType("all")}>
                    <img className="menu-inventaire-icone" src="../../../img/menu/infini.png" alt="icone infini"/>
                </div>
                <div className={"inventories-header-btn " + (itemsTypeSelected === "equipement" ? "inventory-active" : "")}
                     onClick={() => handleChangeItemType("equipement")}>
                    <img className="menu-inventaire-icone" src="../../../img/menu/epee.png" alt="icone epée"/>
                </div>
                <div className={"inventories-header-btn " + (itemsTypeSelected === "consommable" ? "inventory-active" : "")}
                     onClick={() => handleChangeItemType("consommable")}>
                    <img className="menu-inventaire-icone" src="../../../img/menu/potion.png" alt="icone potion"/>
                </div>
                <div className={"inventories-header-btn " + (itemsTypeSelected === "objet" ? "inventory-active" : "")}
                     onClick={() => handleChangeItemType("objet")}>
                    <img className="menu-inventaire-icone" src="../../../img/menu/buches.png" alt="icone buches"/>
                </div>
                <div className={"inventories-header-btn " + (itemsTypeSelected === "quete" ? "inventory-active" : "")}
                     onClick={() => handleChangeItemType("quete")}>
                    <img className="menu-inventaire-icone" src="../../../img/menu/livre.png" alt="icone livre"/>
                </div>
            </div>
            <div className="inventory-items">
                {(itemsTypeSelected === "all" || itemsTypeSelected === "equipement") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "consommable") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "objet") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "equipement") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "consommable") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "objet") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "equipement") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "consommable") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "objet") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "equipement") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "consommable") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
                {(itemsTypeSelected === "all" || itemsTypeSelected === "objet") && items.equipements.map((equipement) =>
                    <EquipementCase equipement={equipement} shouldRefreshInventory={shouldRefreshInventory}/>
                )}
            </div>
        </div>   
    );
}