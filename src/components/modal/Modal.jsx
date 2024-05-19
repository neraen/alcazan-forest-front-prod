import React from "react";

const Modal = ({ isShowing, hide, title, ...props }) => {
    console.log(isShowing);
    return isShowing ?
        <>
            <div className="modal-overlay" style={props.modalPosition}>
                <div className="modal-custom modal-position">
                    <div className="custom-modal-header">
                        <h4 className="custom-modal-title">{title}</h4>
                        <button
                            type="button"
                            className="modal-close-button"
                            onClick={hide}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="custom-modal-body">{props.children}</div>
                </div>
            </div>
        </>
        : null};


export default Modal;