import React, {useState, useContext} from "react";
import authAPI from "../../services/authAPI";
import AuthContext from "../../contexts/AuthContext";
import styles from "./LoginPage.module.scss";

const LoginPage = ({history }) =>{

    const {setIsAuthenticated} = useContext(AuthContext)


    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    })

    const [error, setError] = useState()

    const handleChange = (e) => {
        e.preventDefault()
        const value = e.currentTarget.value
        const name = e.currentTarget.name
        setCredentials({...credentials, [name]: value})
    }

    const handleSubmit = async event => {
        event.preventDefault()
        try {
            await authAPI.authenticate(credentials)
            setError("")
            if(authAPI.isAuthenticated()){
                setIsAuthenticated(true)
                history.replace("/carte")
            }else{
                setError("Combinaison email / mot de passe invalid ou email inexistant")
            }
        }catch(error){
            setError("Combinaison email / mot de passe invalid ou email inexistant")
        }
    }

    return (
        <div className={styles.page}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Connexion</h1>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="username">Adresse email</label>
                    <input type="email" name="username" id="username"
                           className={`${styles.input} ${error ? styles.inputError : ""}`}
                           value={credentials.username} onChange={handleChange}/>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">Mot de passe</label>
                    <input type="password" name="password" id="password" className={styles.input}
                           value={credentials.password} onChange={handleChange}/>
                </div>
                <button type="submit" className={styles.submit}>Je me connecte</button>
            </form>
        </div>
    );
}

export default LoginPage
