import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import adminImageApi, {COLLECTIONS_IMAGE, formatsAcceptes, urlImage} from "../../../services/adminImageApi";

/**
 * Champ image de l'administration : aperçu + envoi du fichier, à la place du champ texte
 * « déposez l'image dans public/img/… » qu'il fallait honorer à la main.
 *
 * L'envoi part DÈS LA SÉLECTION du fichier (et non au submit du formulaire comme dans
 * l'EquipementMaker) : le nom de fichier est calculé par le serveur, l'aperçu affiché est donc
 * la vraie image telle que le jeu la servira, et les formulaires hôtes n'ont pas à intercaler
 * un await dans leur sauvegarde. Le champ ne fait ensuite que remonter la valeur à stocker via
 * `onChange` — c'est l'enregistrement du formulaire qui la persiste.
 *
 * Le champ texte est conservé sous l'aperçu : c'est le seul moyen de réutiliser une image déjà
 * présente dans le dossier (les jeux d'images existants sont volumineux) ou d'en retirer une.
 *
 * @param collection clé de `COLLECTIONS_IMAGE` (miroir de l'enum back `CollectionImage`)
 * @param nom        nom de l'élément édité : le serveur en dérive le nom de fichier
 * @param valeur     valeur actuellement stockée en base
 * @param onChange   reçoit la nouvelle valeur à stocker
 */
const ImageUploadField = ({collection, label, nom, valeur, onChange, id}) => {

    const [envoi, setEnvoi] = useState(false);
    // Un nom de fichier en base ne garantit pas que l'image existe sur le disque (valeurs
    // saisies avant l'upload) : on retombe sur le repère plutôt que sur l'icône cassée.
    const [introuvable, setIntrouvable] = useState(false);
    const descripteur = COLLECTIONS_IMAGE[collection];
    const champId = id || `image-${collection}`;
    const apercu = urlImage(collection, valeur);

    useEffect(() => setIntrouvable(false), [apercu]);

    const envoyer = async ({currentTarget}) => {
        const file = currentTarget.files && currentTarget.files[0];
        // Réinitialise l'input : sans ça, re-sélectionner le même fichier ne déclencherait
        // aucun change et l'admin croirait l'envoi bloqué.
        currentTarget.value = "";
        if (!file) {
            return;
        }
        if (!(nom || "").trim()) {
            toast.error("Nommez l'élément avant d'envoyer une image.");
            return;
        }

        setEnvoi(true);
        try {
            const {fichier} = await adminImageApi.uploader(file, {collection, nom, valeurActuelle: valeur});
            onChange(fichier);
            toast.success("Image envoyée.");
        } catch (error) {
            toast.error(error.response?.data?.error || "Échec de l'envoi de l'image.");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <div className="form-group image-upload">
            <label className="form-label" htmlFor={champId}>{label}</label>

            <div className="image-upload-corps">
                <div className="image-upload-apercu">
                    {apercu && !introuvable
                        ? <img src={apercu} alt={label} onError={() => setIntrouvable(true)}/>
                        : <span className="image-upload-vide" title={introuvable ? `Fichier absent : ${apercu}` : undefined}>
                            {introuvable ? "⚠" : "✦"}
                        </span>}
                </div>

                <div className="image-upload-actions">
                    <label className={`image-upload-bouton ${envoi ? "occupe" : ""}`}>
                        <span>{envoi ? "Envoi…" : (valeur ? "Changer l'image" : "Choisir une image")}</span>
                        <input type="file" accept={formatsAcceptes(collection)}
                               disabled={envoi} onChange={envoyer}/>
                    </label>

                    <input id={champId} type="text" className="image-upload-nom"
                           value={valeur || ""} onChange={(event) => onChange(event.target.value)}
                           placeholder="ou nom d'un fichier déjà présent"/>

                    <small>
                        Envoyée dans <code>img/{descripteur?.dossier}</code> et renommée d'après le nom.
                        {descripteur && !descripteur.avecExtension && " PNG uniquement (le jeu ajoute « .png »)."}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadField;
