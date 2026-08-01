import React, {useCallback, useEffect, useState} from 'react';
import {toast} from "react-toastify";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import Panel from "../../components/ui/panel/Panel";
import SectionTitle from "../../components/ui/sectionTitle/SectionTitle";
import ClassementTable from "../../components/classement/ClassementTable";
import ClassementApi from "../../services/ClassementApi";
import authAPI from "../../services/authAPI";
import styles from './ClassementPage.module.scss';

/**
 * Classements publics : qui domine, et où le joueur se situe.
 *
 * La page ne connaît AUCUNE catégorie en dur — elle affiche celles que le serveur déclare
 * (`/api/classement/liste`). Ajouter un classement (les guildes, au lot des guildes) reste
 * donc une modification back seulement. C'est précisément ce que le découpage abandonné de
 * 2023 — un composant par classement — rendait impossible.
 *
 * Le rail de gauche porte le rang personnel dans TOUTES les catégories : c'est lui qui rend
 * la pagination inutile, un joueur classé 312ᵉ n'ayant pas à parcourir six pages pour le
 * savoir.
 */
const ClassementPage = () => {

    const [categories, setCategories] = useState([]);
    const [categorie, setCategorie] = useState(null);
    const [classement, setClassement] = useState([]);
    const [mesRangs, setMesRangs] = useState(null);
    const [chargement, setChargement] = useState(true);

    const moiUserId = authAPI.getUserInfo()?.id ?? null;

    const charger = useCallback((cle) => {
        setChargement(true);
        ClassementApi.liste(cle)
            .then((donnees) => {
                setCategories(donnees.categories);
                setCategorie(donnees.categorie);
                setClassement(donnees.classement);
            })
            .catch(() => toast.error("Impossible de charger le classement."))
            .finally(() => setChargement(false));
    }, []);

    useEffect(() => {
        charger();
        ClassementApi.moi().then(setMesRangs).catch(() => setMesRangs(null));
    }, [charger]);

    const active = categories.find((item) => item.valeur === categorie);

    const formater = (valeur, format) => {
        if (valeur === null || valeur === undefined) return "—";
        const rendu = valeur.toLocaleString("fr-FR");
        return format === "or" ? `${rendu} po` : rendu;
    };

    return <div className={styles.page}>
        <div className={styles.frame}>
            <ModalShell iconSrc="/img/icons/shild.png"
                        title="Classement"
                        subtitle={active ? active.label : "Les meilleurs d'Alcazan"}>
                <div className={styles.body}>

                    <div className={styles.rail}>
                        <Panel variant="soft" padding="lg" radius="lg" className={styles.section}>
                            <SectionTitle>Catégories</SectionTitle>
                            <div className={styles.onglets}>
                                {categories.map((item) => (
                                    <button key={item.valeur}
                                            type="button"
                                            className={`${styles.onglet} ${item.valeur === categorie ? styles.ongletActif : ""}`}
                                            onClick={() => charger(item.valeur)}>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </Panel>

                        {mesRangs && (
                            <Panel variant="soft" padding="lg" radius="lg" className={styles.section}>
                                <SectionTitle>Mon rang</SectionTitle>
                                {mesRangs.horsClassement
                                    ? <p className={styles.vide}>
                                        Ce compte est exclu des classements.
                                      </p>
                                    : mesRangs.rangs.filter((rang) => rang.rang !== null).map((rang) => (
                                        <div key={rang.categorie} className={styles.rangRow}>
                                            <span className={styles.rangLabel}>{rang.label}</span>
                                            <span className={styles.rangValeur}>
                                                {rang.rang === null ? "—" : `${rang.rang}ᵉ`}
                                                <span className={styles.rangDetail}>
                                                    {formater(rang.valeur, rang.format)}
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                            </Panel>
                        )}
                    </div>

                    <div className={styles.principal}>
                        <Panel variant="soft" padding="lg" radius="lg" className={styles.section}>
                            <SectionTitle right={
                                <span className={styles.compteur}>
                                    {classement.length} classé{classement.length > 1 ? "s" : ""}
                                </span>
                            }>
                                {active ? active.label : "Classement"}
                            </SectionTitle>

                            {chargement
                                ? <p className={styles.vide}>Chargement…</p>
                                : <ClassementTable intitule={active ? active.intitule : "Valeur"}
                                                   format={active ? active.format : "entier"}
                                                   cible={active ? active.cible : "joueur"}
                                                   lignes={classement}
                                                   moiUserId={active?.cible === "guilde" ? null : moiUserId}/>}
                        </Panel>
                    </div>

                </div>
            </ModalShell>
        </div>
    </div>;
};

export default ClassementPage;
