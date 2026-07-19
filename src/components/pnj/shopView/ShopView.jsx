import React, {useState} from "react"
import ShopBuy from "./shopBuy/ShopBuy";
import ShopSell from "./ShopSell/ShopSell";
import styles from "./ShopView.module.scss";

/**
 * Échoppe d'un PNJ marchand : onglets Acheter / Vendre.
 */
const ShopView = (props) => {

    const [activeTab, setActiveTab] = useState("buy");

    return(
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button type="button"
                        className={`${styles.tab} ${activeTab === "buy" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("buy")}>Acheter</button>
                <button type="button"
                        className={`${styles.tab} ${activeTab === "sell" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("sell")}>Vendre</button>
            </div>

            <div className={styles.content}>
                {activeTab === "buy" && <ShopBuy items={props.items}/>}
                {activeTab === "sell" && <ShopSell />}
            </div>
        </div>
    )
}

export default ShopView
