import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import AdminStatsApi from "../services/AdminStatsApi";
import Sparkline from "../../components/ui/sparkline/Sparkline";

/**
 * Vue d'ensemble du jeu : activité, masse monétaire, objets et vendeurs en tête.
 *
 * Écran d'OBSERVATION — il ne modifie rien. Sa raison d'être est précisée en doc §21.6 : un
 * back-office de *modération* reste inutile tant que le jeu n'a pas de population, mais un
 * back-office d'*observation* est utile **précisément parce qu'il n'y en a pas encore** —
 * c'est lui qui dit si l'économie tient avant d'inviter des joueurs.
 */
const StatistiquesPage = () => {

    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        AdminStatsApi.tableauDeBord()
            .then(setDonnees)
            .catch(() => toast.error("Impossible de charger le tableau de bord."))
            .finally(() => setChargement(false));
    }, []);

    if (chargement) {
        return <p className="journal-vide">Chargement…</p>;
    }
    if (!donnees) {
        return <p className="journal-vide">Aucune donnée.</p>;
    }

    const {activite, economie, topObjets, topVendeurs, fenetreJours} = donnees;
    const or = (valeur) => `${valeur.toLocaleString("fr-FR")} po`;

    return <div className="stats-page">
        <p className="donjon-maker-aide">
            Fenêtre d'observation : {fenetreJours} derniers jours.
        </p>

        <div className="stats-tuiles">
            <Tuile label="Actifs (24 h)" valeur={activite.actifs24h}/>
            <Tuile label="Actifs (7 jours)" valeur={activite.actifs7j}/>
            <Tuile label="Or créé" valeur={or(economie.orCree)}/>
            <Tuile label="Or détruit" valeur={or(economie.orDetruit)}/>
            {/* Le solde est LA question d'équilibrage : durablement positif, l'or s'accumule
                et les prix dérivent. Le signe est donc porté par la couleur, pas seulement
                par le chiffre. */}
            <Tuile label="Solde monétaire"
                   valeur={`${economie.solde > 0 ? "+" : ""}${or(economie.solde)}`}
                   ton={economie.solde > 0 ? "alerte" : "bon"}/>
            <Tuile label="Or échangé entre joueurs" valeur={or(economie.orTransfere)}/>
        </div>

        <div className="stats-colonnes">
            <section className="stats-bloc">
                <h3 className="stats-titre">Activité par catégorie</h3>
                {activite.series.map((serie) => (
                    <Sparkline key={serie.cle}
                               points={serie.points}
                               variant={serie.cle}
                               label={`${serie.label} — ${serie.total.toLocaleString("fr-FR")}`}/>
                ))}
            </section>

            <section className="stats-bloc">
                <h3 className="stats-titre">Masse monétaire</h3>
                {["creation", "destruction", "transfert"].map((flux) => {
                    const detail = economie.detail[flux] || {};
                    const lignes = Object.entries(detail).filter(([, montant]) => montant > 0);
                    return <div key={flux} className="stats-flux">
                        <h4 className="stats-sousTitre">{LIBELLES_FLUX[flux]}</h4>
                        {lignes.length === 0
                            ? <p className="stats-vide">Rien sur la période.</p>
                            : lignes.map(([label, montant]) => (
                                <div key={label} className="stats-ligne">
                                    <span>{label}</span>
                                    <span className="stats-valeur">{or(montant)}</span>
                                </div>
                            ))}
                    </div>;
                })}
            </section>

            <section className="stats-bloc">
                <h3 className="stats-titre">Objets les plus échangés</h3>
                {topObjets.length === 0
                    ? <p className="stats-vide">Rien sur la période.</p>
                    : topObjets.map((objet) => (
                        <div key={objet.cle} className="stats-ligne">
                            <span>{objet.nom}</span>
                            <span className="stats-valeur">
                                ×{objet.quantite.toLocaleString("fr-FR")}
                            </span>
                        </div>
                    ))}
            </section>

            <section className="stats-bloc">
                <h3 className="stats-titre">Plus gros vendeurs</h3>
                {topVendeurs.length === 0
                    ? <p className="stats-vide">Rien sur la période.</p>
                    : topVendeurs.map((vendeur) => (
                        <div key={vendeur.userId} className="stats-ligne">
                            <span>{vendeur.pseudo}</span>
                            <span className="stats-valeur">
                                {or(vendeur.montantOr)} <em>({vendeur.total})</em>
                            </span>
                        </div>
                    ))}
            </section>
        </div>
    </div>;
};

const LIBELLES_FLUX = {
    creation: "Or créé (entre dans le jeu)",
    destruction: "Or détruit (sort du jeu)",
    transfert: "Or transféré (change de mains)",
};

const Tuile = ({label, valeur, ton}) => (
    <div className={`stats-tuile${ton ? ` stats-tuile-${ton}` : ""}`}>
        <span className="stats-tuile-label">{label}</span>
        <span className="stats-tuile-valeur">{valeur}</span>
    </div>
);

export default StatistiquesPage;
