export default function PopupItem({text, buttons, updateDialogue}) {

    const buttonElements = buttons.map(btn => {
        return <button key={btn.id} onClick={() => updateDialogue(btn.goto)}>{btn.text}</button>
    })

    return (
        <div className="popup">
            <section className="popup-data">
                <div className="popup-text">
                    {text}

                </div>
                <div className="popup-btns">
                    {buttonElements}
                </div>
            </section>
        </div>
    )
}