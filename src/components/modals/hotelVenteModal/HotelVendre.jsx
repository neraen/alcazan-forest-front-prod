import React, {useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "react-toastify";
import InventaireApi from "../../../services/InventaireApi";
import Glyph from "../../ui/glyphs/Glyph";
import GameButton from "../../ui/gameButton/GameButton";
import Loader from "../../loader/Loader";
import Slot from "../../ui/slot/Slot";
import {
    normalizeConsommable,
    normalizeEquipement,
    normalizeObjet,
} from "../../inventory/screen/itemUtils";
import styles from "./HotelVenteModal.module.scss";

const FILTRES = [
    {id: "tous", label: "Tout"},
    {id: "equipement", label: "Équip."},
    {id: "consommable", label: "Conso."},
    {id: "objet", label: "Objets"},
];

/**
 * Onglet « Vendre » : le sac à gauche, le formulaire de dépôt à droite.
 *
 * Les frais affichés sont calculés avec les CURSEURS DU SERVEUR (`curseurs.tauxFrais`), jamais
 * avec une constante recopiée : retoucher l'équilibrage côté back ne doit pas mentir à l'écran.
 * Le serveur les recalcule de toute façon au dépôt, ce qui s'affiche ici n'engage rien.
 *
 * Un équipement PORTÉ n'est pas dans le sac (invariant d'EquipementEquipeService) : il
 * n'apparaît donc pas ici, et c'est le comportement voulu — il faut le retirer pour le vendre.
 */
const HotelVendre = ({curseurs, occupe, emplacementsUtilises, onVendre}) => {

    const [inventaire, setInventaire] = useState(null);
    const [filtre, setFiltre] = useState("tous");
    const [recherche, setRecherche] = useState("");
    const [selection, setSelection] = useState(null);
    const [quantite, setQuantite] = useState(1);
    // « null = le champ suit la valeur par défaut, chaîne = saisie en cours » : même patron que
    // l'or de l'échange. Sans ça, taper « 1 » puis « 2 » se ferait écraser à chaque rendu.
    const [prixSaisi, setPrixSaisi] = useState(null);

    const charger = useCallback(() => InventaireApi.getPlayerInventaire()
        .then(reponse => setInventaire([
            ...(reponse.equipements || []).map(equipement => normalizeEquipement(equipement)),
            ...(reponse.consommables || []).map(consommable => normalizeConsommable(consommable)),
            ...(reponse.objets || []).map(objet => normalizeObjet(objet)),
        ].filter(item => item.qty > 0)))
        .catch(() => toast.error("Votre sac est inaccessible.")), []);

    useEffect(() => { charger(); }, [charger]);

    const items = useMemo(() => (inventaire || []).filter(item => {
        if (filtre !== "tous" && item.cat !== filtre) {
            return false;
        }
        return sansAccent(item.name).includes(sansAccent(recherche));
    }), [inventaire, filtre, recherche]);

    // La sélection doit suivre le sac : après un dépôt, la pile a fondu ou disparu.
    useEffect(() => {
        if (selection === null || inventaire === null) {
            return;
        }
        const frais = inventaire.find(item => item.key === selection.key);
        if (frais === undefined) {
            setSelection(null);
        } else if (frais.qty !== selection.qty) {
            setSelection(frais);
            setQuantite(courante => Math.min(courante, frais.qty));
        }
    }, [inventaire, selection]);

    const choisir = (item) => {
        setSelection(precedente => precedente?.key === item.key ? null : item);
        setQuantite(1);
        // Prix de départ suggéré : ce qu'en donnerait le marchand. C'est un repère, pas une
        // contrainte — le vendeur décide, le marché tranche.
        setPrixSaisi(null);
    };

    const prixDefaut = selection ? Math.max(1, (selection.value || 1) * quantite) : 1;
    const prix = prixSaisi === null ? prixDefaut : Math.floor(Number(prixSaisi) || 0);
    const frais = calculerFrais(prix, curseurs);
    const prixValide = prix >= (curseurs?.prixMin ?? 1) && prix <= (curseurs?.prixMax ?? Infinity);
    const plafondAtteint = emplacementsUtilises >= (curseurs?.annoncesMax ?? Infinity);

    const deposer = async () => {
        await onVendre(selection.cat, selection.id, quantite, prix);
        await charger();
        setPrixSaisi(null);
    };

    if (inventaire === null) {
        return <Loader/>;
    }

    return (
        <div className={styles.vendre}>
            <div className={styles.colonneSac}>
                <label className={styles.recherche}>
                    <Glyph name="search" size={15} className={styles.rechercheIcone}/>
                    <input className={styles.rechercheInput} type="search"
                           placeholder="Chercher dans le sac…"
                           value={recherche}
                           onChange={(event) => setRecherche(event.target.value)}/>
                </label>

                <div className={styles.filtres}>
                    {FILTRES.map(item => (
                        <button key={item.id} type="button"
                                className={`${styles.puce} ${filtre === item.id ? styles.puceActive : ""}`}
                                onClick={() => setFiltre(item.id)}>
                            {item.label}
                        </button>
                    ))}
                </div>

                {items.length === 0
                    ? <p className={styles.vide}>
                        {inventaire.length === 0
                            ? "Votre sac est vide."
                            : "Aucun objet du sac ne correspond."}
                      </p>
                    : <div className={styles.sac}>
                        {items.map(item => (
                            <Slot key={item.key}
                                  src={item.img}
                                  alt={item.name}
                                  title={`${item.name}${item.qty > 1 ? ` ×${item.qty}` : ""}`}
                                  className={selection?.key === item.key ? styles.slotActif : ""}
                                  onClick={() => choisir(item)}>
                                {item.qty > 1 && <span className={styles.slotQty}>{item.qty}</span>}
                            </Slot>
                        ))}
                      </div>}
            </div>

            <div className={styles.colonneForm}>
                {selection === null
                    ? <p className={styles.vide}>Choisissez un objet de votre sac à mettre en vente.</p>
                    : <>
                        <div className={styles.formTitre}>{selection.name}</div>

                        <label className={styles.champ}>
                            <span className={styles.champLabel}>Quantité (sur {selection.qty})</span>
                            <input className={styles.champInput} type="number"
                                   min={1} max={selection.qty} step={1}
                                   value={quantite}
                                   disabled={occupe}
                                   onChange={(event) => setQuantite(borner(event.target.value, 1, selection.qty))}
                                   onFocus={(event) => event.target.select()}/>
                        </label>

                        <label className={styles.champ}>
                            <span className={styles.champLabel}>Prix total du lot (or)</span>
                            <input className={styles.champInput} type="number"
                                   min={curseurs?.prixMin ?? 1} step={1}
                                   value={prixSaisi === null ? prixDefaut : prixSaisi}
                                   disabled={occupe}
                                   onChange={(event) => setPrixSaisi(event.target.value)}
                                   onFocus={(event) => event.target.select()}/>
                        </label>

                        <div className={styles.recap}>
                            <div className={styles.recapLigne}>
                                <span>Frais de dépôt</span>
                                <strong className={styles.recapFrais}>−{frais} po</strong>
                            </div>
                            <div className={styles.recapLigne}>
                                <span>Si le lot se vend</span>
                                <strong className={styles.recapGain}>+{prix} po</strong>
                            </div>
                            <p className={styles.recapNote}>
                                Les frais sont prélevés maintenant et ne sont pas remboursés.
                                Le lot reste en vente {curseurs?.dureeHeures ?? 48} h, après quoi
                                l'invendu vous revient.
                            </p>
                        </div>

                        {plafondAtteint && (
                            <p className={styles.alerte}>
                                Vous avez déjà {curseurs.annoncesMax} lots en vente : retirez-en un
                                pour en déposer un autre.
                            </p>
                        )}

                        <GameButton disabled={occupe || !prixValide || plafondAtteint}
                                    onClick={deposer}>
                            {occupe ? "Dépôt…" : `Mettre en vente (${frais} po de frais)`}
                        </GameButton>
                      </>}
            </div>
        </div>
    );
};

/** Comparaison insensible à la casse ET aux accents : « épée » doit sortir sur « epee ». */
function sansAccent(texte) {
    return (texte || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function borner(valeur, min, max) {
    const nombre = Math.floor(Number(valeur));
    return Number.isNaN(nombre) ? min : Math.min(max, Math.max(min, nombre));
}

/**
 * Miroir de HotelVenteConfig::fraisDepot — pourcentage arrondi au supérieur, jamais sous le
 * plancher. Les DEUX chiffres viennent du serveur : c'est la formule qui est dupliquée, pas
 * l'équilibrage, et le serveur recalcule au dépôt.
 */
function calculerFrais(prix, curseurs) {
    if (!curseurs || !(prix > 0)) {
        return 0;
    }
    return Math.max(curseurs.fraisMinimum, Math.ceil(prix * curseurs.tauxFrais));
}

export default HotelVendre;
