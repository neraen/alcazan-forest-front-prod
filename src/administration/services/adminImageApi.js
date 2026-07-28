import axios from 'axios';
import {API_URL} from "../../config";

/**
 * Upload des images de l'administration (métiers, objets, PNJ, monstres, cases interactives).
 *
 * Le back renomme le fichier d'après le nom de l'élément édité et le range dans le dossier de
 * sa collection : l'admin n'a plus à déposer les images à la main dans `public/img`.
 * Les icônes d'équipement gardent leur route dédiée (`EquipementApi.uploadIcone`), elles
 * seules ayant un sous-dossier par position.
 *
 * ⚠️ Ce catalogue est le miroir de l'enum `App\Enum\CollectionImage` : toute collection
 * ajoutée côté back doit l'être ici, avec la MÊME règle d'extension — c'est elle qui décide si
 * la base stocke « bois.png » ou « bois ». Le serveur revalide de toute façon.
 */
export const COLLECTIONS_IMAGE = {
    metier: {dossier: "metier", avecExtension: false},
    objet: {dossier: "objet", avecExtension: true},
    pnj_avatar: {dossier: "pnj", avecExtension: true},
    pnj_skin: {dossier: "pnj", avecExtension: false},
    monstre: {dossier: "monstre", avecExtension: false},
    interaction: {dossier: "interaction", avecExtension: false},
};

/**
 * URL publique d'une valeur déjà enregistrée en base (null si aucune image).
 *
 * L'extension est recollée quand la valeur n'en porte pas, quelle que soit la collection :
 * les valeurs saisies à la main avant l'upload sont hétérogènes (`armurier` et
 * `maitreGuildeAvatar.png` cohabitent dans `pnj.avatar`), et un aperçu cassé sur une fiche
 * par ailleurs correcte ferait chercher un bug là où il n'y en a pas. Même tolérance que les
 * vignettes de `PnjMakerPage`. Les valeurs produites par l'upload, elles, sont normalisées.
 */
export const urlImage = (collection, valeur) => {
    const descripteur = COLLECTIONS_IMAGE[collection];
    if (!descripteur || !valeur) {
        return null;
    }

    return `/img/${descripteur.dossier}/${valeur.includes(".") ? valeur : `${valeur}.png`}`;
};

/** Formats acceptés par le back, restreints au PNG quand l'extension n'est pas stockée. */
export const formatsAcceptes = (collection) =>
    COLLECTIONS_IMAGE[collection]?.avecExtension
        ? "image/png,image/jpeg,image/webp,image/gif"
        : "image/png";

/**
 * Envoie l'image et renvoie `{fichier, url}` : `fichier` est la valeur à enregistrer dans le
 * champ (avec ou sans extension selon la collection), `url` celle à afficher.
 */
const uploader = (file, {collection, nom, valeurActuelle}) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("collection", collection);
    formData.append("nom", nom || "");
    formData.append("valeurActuelle", valeurActuelle || "");

    return axios.post(API_URL + "admin/image/upload", formData).then(response => response.data);
};

const adminImageApi = {uploader};

export default adminImageApi;
