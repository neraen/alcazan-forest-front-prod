import React from "react";
import {Link, Redirect, Switch} from "react-router-dom";

class SocialPage extends React.Component{
    render(){
        return (<>
            <div className="inventaire-header">
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/joueurs' >Joueurs</Link></h3>
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/amis' >Amis</Link></h3>
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/guilde' >Guilde</Link></h3>
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/messagerie' >Messagerie</Link></h3>
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/chat' >Chat</Link></h3>
                <h3 className="inventaire-title"><Link activeClassName="inventaire-active" className="title-map-font inventaire-active" to='/social/event' >Event</Link></h3>
            </div>

            <Switch>
                {this.props.history.location.pathname === '/social' && <Redirect to="/social/joueurs"></Redirect>}
            </Switch>
        </>  )
    }
}