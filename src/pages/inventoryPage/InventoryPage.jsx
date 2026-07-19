import React from 'react'
import InventoryScreen from "../../components/inventory/screen/InventoryScreen";
import styles from "./InventoryPage.module.scss";

const InventoryPage = (props) => {
    return (
        <div className={styles.page}>
            <div className={styles.frame}>
                <InventoryScreen/>
            </div>
        </div>
    )
}

export default InventoryPage
