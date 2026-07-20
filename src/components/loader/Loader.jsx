import React from "react"
import styles from "./Loader.module.scss";

const Loader = (props) => {
    return(
        <div className={styles.section}
             style={props.maxWidth ? {maxWidth: props.maxWidth, maxHeight: props.maxHeight} : undefined}>
            <span className={styles.bar}></span>
        </div>
    )
}

export default Loader
