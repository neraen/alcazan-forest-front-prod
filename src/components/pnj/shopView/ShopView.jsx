import React, {useState} from "react"
import ShopBuy from "./shopBuy/ShopBuy";
import ShopSell from "./ShopSell/ShopSell";


const ShopView = (props) => {

    const [activeTab, setActiveTab] = useState("buy");

    const handleSetActiveTab = (tabName) => {
        setActiveTab(tabName);
    }

    return(
        <div className="shop-container">
            <div className="shop-mode">
                <div className="shop-mode-choice" onClick={() => handleSetActiveTab("buy")}>Acheter</div>
                <div className="shop-mode-choice" onClick={() => handleSetActiveTab("sell")}>Vendre</div>
            </div>

            {activeTab === "buy" && <ShopBuy items={props.items}/>}
            {activeTab === "sell" && <ShopSell />}
        </div>
    )
}

export default ShopView