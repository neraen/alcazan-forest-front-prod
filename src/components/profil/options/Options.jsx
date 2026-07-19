import React from 'react'
import Panel from "../../ui/panel/Panel";
import SectionTitle from "../../ui/sectionTitle/SectionTitle";
import styles from "./Options.module.scss";

const Options = (props) => {
    return (
        <div className={styles.body}>
            <Panel variant="soft" padding="lg" radius="lg" className={styles.card}>
                <SectionTitle>Options</SectionTitle>
                <p className={styles.placeholder}>Aucune option disponible pour le moment.</p>
            </Panel>
        </div>
    )
}

export default Options
