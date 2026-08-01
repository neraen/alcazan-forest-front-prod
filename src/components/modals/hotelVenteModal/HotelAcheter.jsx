import React, {useCallback, useEffect, useState} from "react";
import HotelVenteApi from "../../../services/HotelVenteApi";
import Glyph from "../../ui/glyphs/Glyph";
import Loader from "../../loader/Loader";
import ItemCard from "../../pnj/shopView/itemCard/ItemCard";
import {itemImage} from "../../inventory/screen/itemUtils";
import {tempsRestant} from "./tempsRestant";
import styles from "./HotelVenteModal.module.scss";

const FILTRES = [
    {id: null, label: "Tout"},
    {id: "equipement", label: "Équip."},
    {id: "consommable", label: "Conso."},
    {id: "objet", label: "Objets"},
];

/**
 * Onglet « Acheter » : le catalogue des lots déposés par les autres joueurs.
 *
 * Recherche, filtre et tri sont envoyés au SERVEUR, contrairement au catalogue de recettes qui
 * filtre côté client : l'hôtel est alimenté par les joueurs, il n'a pas de taille bornée, et
 * tout charger pour filtrer ensuite ne tiendrait pas.
 */
const HotelAcheter = ({occupe, onAcheter}) => {

    const [donnees, setDonnees] = useState(null);
    const [type, setType] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [termeEnvoye, setTermeEnvoye] = useState("");
    const [tri, setTri] = useState("recent");
    const [page, setPage] = useState(1);
    const [chargement, setChargement] = useState(true);

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            setDonnees(await HotelVenteApi.catalogue({type, recherche: termeEnvoye, tri, page}));
        } finally {
            setChargement(false);
        }
    }, [type, termeEnvoye, tri, page]);

    useEffect(() => { charger(); }, [charger]);

    // Un filtre ou un tri qui change ramène en page 1 : rester en page 4 d'un résultat qui n'en
    // compte plus que 2 afficherait un vide qu'on lirait comme « il n'y a rien ».
    const changerFiltre = (setter) => (valeur) => { setter(valeur); setPage(1); };

    const lancerRecherche = (event) => {
        event.preventDefault();
        setTermeEnvoye(recherche.trim());
        setPage(1);
    };

    // Après un achat, la liste doit refléter le lot parti — sans quoi le joueur reclique dessus.
    const acheter = async (annonce) => {
        await onAcheter(annonce);
        await charger();
    };

    const annonces = donnees?.annonces || [];
    const tris = donnees?.curseurs?.tris || {};

    return (
        <div className={styles.onglet}>
            <div className={styles.barre}>
                <form className={styles.recherche} onSubmit={lancerRecherche}>
                    <Glyph name="search" size={15} className={styles.rechercheIcone}/>
                    <input className={styles.rechercheInput} type="search"
                           placeholder="Rechercher un objet…"
                           value={recherche}
                           onChange={(event) => setRecherche(event.target.value)}/>
                </form>

                <div className={styles.filtres}>
                    {FILTRES.map(filtre => (
                        <button key={filtre.id || "tous"} type="button"
                                className={`${styles.puce} ${type === filtre.id ? styles.puceActive : ""}`}
                                onClick={() => changerFiltre(setType)(filtre.id)}>
                            {filtre.label}
                        </button>
                    ))}
                </div>

                <select className={styles.tri} value={tri} aria-label="Trier"
                        onChange={(event) => changerFiltre(setTri)(event.target.value)}>
                    {Object.entries(tris).map(([valeur, label]) =>
                        <option key={valeur} value={valeur}>{label}</option>
                    )}
                </select>

                {/* Rafraîchissement explicite : sur un marché asynchrone, des lots apparaissent
                    et disparaissent pendant qu'on regarde. Sans ce bouton, la seule façon de
                    recharger était de changer un filtre puis de revenir — recliquer le filtre
                    déjà actif ne change rien et ne déclenche donc aucune requête. */}
                <button type="button" className={styles.rafraichir}
                        title="Rafraîchir le catalogue"
                        disabled={chargement || occupe}
                        onClick={charger}>
                    Rafraîchir
                </button>
            </div>

            {chargement && donnees === null
                ? <Loader/>
                : annonces.length === 0
                    // Trois vides bien distincts : un hôtel désert ne se lit pas comme une
                    // recherche infructueuse, et le joueur doit savoir lequel des deux c'est.
                    ? <p className={styles.vide}>
                        {termeEnvoye
                            ? "Aucun lot ne correspond à votre recherche."
                            : type
                                ? "Aucun lot de cette catégorie n'est en vente."
                                : "L'hôtel des ventes est vide pour le moment."}
                      </p>
                    : <>
                        <div className={styles.grille}>
                            {/* Le serveur renvoie le nom de fichier BRUT et la position :
                                les conventions de dossier vivent dans itemImage(), seul
                                endroit du front à les connaître. */}
                            {annonces.map(annonce => (
                                <ItemCard key={annonce.id}
                                          name={annonce.item.nom}
                                          img={itemImage(annonce.item)}
                                          rarity={annonce.item.rarete}
                                          subline={`Vendu par ${annonce.vendeur.pseudo} · ${tempsRestant(annonce.expiresAt)}`}
                                          description={annonce.item.description}
                                          quantity={annonce.quantite}
                                          price={annonce.prix}
                                          meta={annonce.quantite > 1 ? `${annonce.prixUnitaire} po l'unité` : null}
                                          actionLabel="Acheter"
                                          pendingLabel="Achat…"
                                          pending={occupe}
                                          disabled={occupe || annonce.estMien}
                                          disabledLabel={annonce.estMien ? "Votre lot" : null}
                                          onAction={() => acheter(annonce)}/>
                            ))}
                        </div>

                        {donnees.pages > 1 && (
                            <div className={styles.pagination}>
                                <button type="button" className={styles.pageBouton}
                                        disabled={page <= 1 || chargement}
                                        onClick={() => setPage(page - 1)}>Précédent</button>
                                <span className={styles.pageEtat}>
                                    Page {donnees.page} / {donnees.pages} · {donnees.total} lots
                                </span>
                                <button type="button" className={styles.pageBouton}
                                        disabled={page >= donnees.pages || chargement}
                                        onClick={() => setPage(page + 1)}>Suivant</button>
                            </div>
                        )}
                      </>}
        </div>
    );
};

export default HotelAcheter;
