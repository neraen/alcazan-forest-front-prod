import React from "react";

const Modal = ({ isShowing, hide, title, ...props }) =>
    isShowing ?
        <>
            <div className="modal-overlay">

                    <div className="modal-custom">
                        <div className="modal-header">
                            {props.avatar && <img src={props.avatar} />}
                            <h4 className="custom-modal-title">{title}</h4>
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={hide}
                            >
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">{props.children}</div>
                    </div>

            </div>

            <style jsx="true">{`
            
            .custom-modal-title{
                text-align: center;
                display: flex;
                align-items: center;
                font-family: 'Modern Antiqua', cursive;
            }
           
            .modal-custom {
                height: 50vh;
                width: 39vw;
                position: absolute;
                top: 0px;
                left: 15px;
                background: rgba(5, 37, 39, 0.8);
                backdrop-filter: blur(16px);

                //border: solid 1px #FBCE58;
                z-index: 50;
                color: aliceblue;
                border-radius: 10px;
                overflow: scroll;
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
         
            }

            .modal-close-button {
              font-size: 1.4rem;
              font-weight: 700;
              color: aliceblue;
              cursor: pointer;
              border: none;
              background: transparent;
            }
            
            @media screen and (max-width: 1700px) {
                  .modal-custom {
                    height: 60vh;
                    width: 52vw;
                  }
            }
          `}</style>
        </>
        : null;


export default Modal;