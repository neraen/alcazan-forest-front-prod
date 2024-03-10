import React from "react"

const Loader = (props) => {
    return(
        <>
        {props.maxWidth && (
            <section className="loader-section" style={{maxWidth: props.maxWidth, maxHeight: props.maxHeight}}>
                <span className="loader-73"></span>
            </section>
        ) || (
            <section className="loader-section">
                <span className="loader-73"></span>
            </section>
        )}
        </>

    )
}

export default Loader