import React, {useState} from "react";
import {Link} from "react-router-dom";
import UsersApi from "../../services/UsersApi";
import styles from "./RegisterPage.module.scss";

const RegisterPage = ({history}) => {

    const [user, setUser] = useState({
        pseudo: '',
        sexe: 'feminin',
        email: '',
        password: '',
        passwordConfirm: '',
    })

    const [errors, setErrors] = useState({
        pseudo: '',
        email: '',
        password: '',
    })

    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget
        setUser({...user, [name]: value})
    }

    const handleSubmit = async event => {
        event.preventDefault();
        const apiErrors = {};
        if(user.password !== user.passwordConfirm){
            apiErrors.passwordConfirm = "Les deux mots de passes ne sont pas identiques";
            setErrors(apiErrors);
            return;
        }

        try {
            const data = await UsersApi.register(user);
            setErrors({});
            history.replace("/connexion");
        }catch(error){
            const {violations} = error.response.data;

            if(violations){
                violations.forEach(violation => {
                    apiErrors[violation.propertyPath] = violation.message;
                })
                setErrors(apiErrors);
            }
        }
    }

    const renderField = (name, label, type = "text", placeholder = "") => (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={name}>{label}</label>
            <input type={type} name={name} id={name} placeholder={placeholder || label}
                   className={`${styles.input} ${errors[name] ? styles.inputError : ""}`}
                   value={user[name]} onChange={handleChange}/>
            {errors[name] && <p className={styles.error}>{errors[name]}</p>}
        </div>
    );

    return (
        <div className={styles.page}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Inscription</h1>
                {renderField("pseudo", "Pseudo", "text", "Votre pseudo")}

                <div className={styles.field}>
                    <span className={styles.label}>Sexe du personnage</span>
                    <div className={styles.radioRow}>
                        <label className={styles.radio}>
                            <input type="radio" name="sexe" value="feminin"
                                   checked={user.sexe === "feminin"} onChange={handleChange}/>
                            Femme
                        </label>
                        <label className={styles.radio}>
                            <input type="radio" name="sexe" value="masculin"
                                   checked={user.sexe === "masculin"} onChange={handleChange}/>
                            Homme
                        </label>
                    </div>
                </div>

                {renderField("email", "Email", "email", "Votre email")}
                {renderField("password", "Mot de passe", "password", "Votre mot de passe")}
                {renderField("passwordConfirm", "Confirmation du mot de passe", "password", "Repetez le mot de passe")}

                <div className={styles.actions}>
                    <button type="submit" className={styles.submit}>Je m'inscrit</button>
                    <Link to='/connexion' className={styles.haveAccount}>J'ai déjà un compte</Link>
                </div>
            </form>
        </div>
    );
}

export default RegisterPage
