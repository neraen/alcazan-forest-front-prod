import React from "react";

const Modal = ({ isShowing, hide, title, ...props }) =>
    isShowing ?
        <>
            <div className="modal-overlay">
                <div className="modal-background">
                    <div className="modal-custom">
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
            </div>
        </>
        : null;


export default Modal;