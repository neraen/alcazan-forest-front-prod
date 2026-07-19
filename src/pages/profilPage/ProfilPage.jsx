import React, { useEffect, useState} from 'react'
import Profil from "../../components/profil/profil/profil";
import UsersApi from "../../services/UsersApi";
import authAPI from "../../services/authAPI";
import {NavLink, Redirect, Switch} from "react-router-dom";
import PrivateRoute from "../../components/PrivateRoute";
import ProfilSpells from "../../components/profil/profilSpells/ProfilSpells";
import Options from "../../components/profil/options/Options";
import styles from "./ProfilPage.module.scss";

const ProfilPage = ({match, history}) => {

    const [user, setUser] = useState({})

    const { pseudo = undefined} = match.params;

    useEffect(()=> {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        const user = await UsersApi.find(await authAPI.getUserInfo().id)
        setUser(user)
    }

    return (
        <div className={styles.page}>
            <nav className={styles.subnav}>
                <NavLink to='/personnage/profil' className={styles.subnavItem} activeClassName={styles.subnavActive}>Profil</NavLink>
                <NavLink to='/personnage/sorts' className={styles.subnavItem} activeClassName={styles.subnavActive}>Sorts</NavLink>
                <NavLink to='/personnage/options' className={styles.subnavItem} activeClassName={styles.subnavActive}>Options</NavLink>
            </nav>

            <Switch>
                <PrivateRoute path="/personnage/profil" component={() => <Profil history={history} pseudo={pseudo} user={user} />}/>
                <PrivateRoute path="/personnage/sorts" component={() => <ProfilSpells />}/>
                <PrivateRoute path="/personnage/options" component={() => <Options />}/>
                {history.location.pathname === '/personnage' && <Redirect to="/personnage/profil"></Redirect>}
            </Switch>
        </div>
    )
}

export default ProfilPage
