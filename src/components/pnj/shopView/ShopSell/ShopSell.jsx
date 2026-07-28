import React, {useEffect, useMemo, useState} from "react"
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../../store/actions";
import InventaireApi from "../../../../services/InventaireApi";
import UserActionApi from "../../../../services/UserActionApi";
import Loader from "../../../loader/Loader";
import ItemCard from "../itemCard/ItemCard";
import {normalizeConsommable, normalizeEquipement, normalizeObjet} from "../../../inventory/screen/itemUtils";
import styles from "./ShopSell.module.scss";

const FILTRES = [
    {id: "tous", label: "Tout"},
    {id: "equipement", label: "Équip."},
    {id: "consommable", label: "Conso."},
    {id: "objet", label: "Objets"},
];

/**
 * Vente au marchand : le sac du joueur en cartes, au même format que l'étal.
 * Le prix affiché est le prix de revente de l'item — 0 si le contenu n'en définit pas.
 * Le client n'envoie jamais de montant : le serveur recalcule le prix et fait foi sur l'or.
 * Les objets équipés ne sont pas listés (ils vivent hors du sac, il faut les retirer d'abord).
 */
const ShopSell = (props) => {

    const [chargement, setChargement] = useState(true);
    const [inventaire, setInventaire] = useState({equipements: [], consommables: [], objets: []});
    const [filtre, setFiltre] = useState("tous");
    const [venteEnCours, setVenteEnCours] = useState(null);
    // Quantité choisie par article (clé d'item → nombre). Absente = 1.
    const [quantites, setQuantites] = useState({});

    const chargerInventaire = () => InventaireApi.getPlayerInventaire().then(setInventaire);

    useEffect(() => {
        chargerInventaire()
            .catch(() => toast.error("Impossible de charger votre inventaire."))
            .finally(() => setChargement(false));
    }, []);

    const items = useMemo(() => [
        ...(inventaire.equipements || []).map(equipement => normalizeEquipement(equipement)),
        ...(inventaire.consommables || []).map(normalizeConsommable),
        ...(inventaire.objets || []).map(normalizeObjet),
    ], [inventaire]);

    const itemsFiltres = filtre === "tous" ? items : items.filter(item => item.cat === filtre);

    /** Quantité retenue pour un article, toujours ramenée dans [1, stock possédé]. */
    const quantiteDe = (item) => Math.min(Math.max(1, quantites[item.key] || 1), item.qty);

    const handleVente = async (item) => {
        if(venteEnCours !== null){
            return;
        }
        const quantite = quantiteDe(item);
        setVenteEnCours(item.key);
        try {
            const vente = await UserActionApi.sellItem(item.cat, item.id, quantite);
            // Le serveur fait foi sur l'or restant : on rafraîchit la bourse avec sa réponse.
            props.updateJoueurState({money: vente.money});
            toast.success(vente.message || `${item.name} vendu.`);
            // La pile a changé de taille : on repart de 1 plutôt que de garder une quantité
            // qui ne veut plus rien dire.
            setQuantites(precedentes => {
                const {[item.key]: _vendu, ...reste} = precedentes;
                return reste;
            });
            await chargerInventaire();
        } catch (error) {
            const reponse = error.response?.data;
            if(reponse?.money !== undefined){
                props.updateJoueurState({money: reponse.money});
            }
            toast.error(reponse?.error || "La vente n'a pas pu aboutir.");
            // Stock périmé côté client (« Vous n'en possédez que N ») : on resynchronise.
            await chargerInventaire().catch(() => {});
        } finally {
            setVenteEnCours(null);
        }
    }

    if(chargement){
        return <div className={styles.loading}><Loader/></div>;
    }

    return(
        <>
            <div className={styles.filtres}>
                {FILTRES.map(item => {
                    const compte = item.id === "tous"
                        ? items.length
                        : items.filter(candidat => candidat.cat === item.id).length;
                    return (
                        <button key={item.id} type="button"
                                className={`${styles.filtre} ${filtre === item.id ? styles.filtreActif : ""}`}
                                onClick={() => setFiltre(item.id)}>
                            {item.label}<span className={styles.compte}>{compte}</span>
                        </button>
                    );
                })}
            </div>

            <div className={styles.grid}>
                {itemsFiltres.length === 0
                    ? <p className={styles.vide}>Vous n'avez rien à vendre dans cette catégorie.</p>
                    : itemsFiltres.map(item => {
                        const quantite = quantiteDe(item);
                        const prixUnitaire = Number(item.value) || 0;
                        return (
                            <ItemCard key={item.key}
                                      name={item.name}
                                      img={item.img}
                                      rarity={item.rarity}
                                      caracteristiques={item.caracteristiques}
                                      description={item.desc}
                                      quantity={item.qty}
                                      price={prixUnitaire * quantite}
                                      meta={quantite > 1
                                          ? `${prixUnitaire} l'unité · ${item.qty} en stock`
                                          : (item.qty > 1 ? `${item.qty} en stock` : null)}
                                      maxQuantity={item.qty}
                                      selectedQuantity={quantite}
                                      onQuantityChange={(valeur) =>
                                          setQuantites(precedentes => ({...precedentes, [item.key]: valeur}))}
                                      actionLabel={quantite > 1 ? `Vendre les ${quantite}` : "Vendre"}
                                      pendingLabel="Vente…"
                                      pending={venteEnCours === item.key}
                                      disabled={venteEnCours !== null}
                                      onAction={() => handleVente(item)}/>
                        );
                    })}
            </div>
        </>
    )
}

export default connect((state) => ({joueurState: {...state.data.joueurState}}), {updateJoueurState})(ShopSell)
