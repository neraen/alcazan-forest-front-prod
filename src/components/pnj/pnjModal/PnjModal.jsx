import React from "react";
import Modal from "../../modal/Modal";
import ShopView from "../shopView/ShopView";
import QuestView from "../questView/QuestView";
import ActionView from "../actionView/ActionView";
import GuildeView from "../guildeView/GuildeView";


class PnjModal extends React.Component{

    constructor(props) {
        super(props);
        console.log(props);
    }

    renderComponent(){
        switch (this.props.pnj.typePnj) {
            case "shop":
                return <ShopView typeShop={this.props.pnj.typeShop} items={this.props.pnj.items} />;
            case "quest":
                return <QuestView pnj={this.props.pnj} />;
            case "action":
                return <ActionView pnjId={this.props.pnj.pnjId} />;
            case "guilde":
                return <GuildeView pnjId={this.props.pnj.pnjId} />;
            default:
                return null; // ou un composant par défaut, si nécessaire
        }
    }

    render() {
        console.log(this.props.pnj.typePnj)
        return  <Modal
                isShowing={this.props.isDialogShowed}
                hide={this.props.toggleDialogPnj}
                title={this.props.pnj.title}
                avatar={this.props.pnj.avatar}
        >
            {this.renderComponent()}
        </Modal>
    }
}

export default PnjModal