import { useEffect, useContext, useState } from 'react'
import { TutorialContext } from './Context'

export default function PopupItem({text, buttons, updateDialogue, actions, orderAnswerArr}) {
    const [orderAnswer, setOrderAnswer] = orderAnswerArr
    const [isTutorial, setIsTutorial] = useContext(TutorialContext)
    const [position, setPosition] = useState({})
    useEffect(() => {
        if (actions === -1) {
            setIsTutorial(true)
            setPosition({top: "50%", left: "50%", right: "auto", bottom: "auto"})
        } else if (actions === 0) {
            const newOrder = {
                id: 0,
                text: "你好吗",
                type: 'orders'
            }
            setOrderAnswer(prev => {
                return prev.map((c) => {
                    if (c.id === 'orders') {
                        return {
                            ...c,
                            items: [
                                ...c.items,
                                newOrder
                            ]
                        }
                    } else {
                        return c
                    }
                })
            })
            setPosition({top: "30%", left: "0%", right: "auto", bottom: "auto"})
        } else if (actions === 1) {
            setPosition({top: "30%", left: "auto", right: "0", bottom: "auto"})
        } else if (actions === 2) {
            setPosition({top: "30%", left: "auto", right: "15%", bottom: "auto"})
        } else if (actions === 3) {
            setPosition({top: "30%", left: "auto", right: "40%", bottom: "auto"})
        } else if (actions === 4) {
            setPosition({top: "30%", left: "auto", right: "30%", bottom: "auto"})
        } else if (actions === 5) {
            setPosition({top: "30%", left: "10%", right: "auto", bottom: "auto"})
        } else if (actions === 6) {
            setPosition({top: "30%", left: "auto", right: "-10%", bottom: "auto"})
        }
    }, [actions])

    let popupStyle
    let dataStyle
    let btnClass
    if (actions !== undefined) {
        btnClass = "popup-btns-side"
        popupStyle = {
            position: "absolute",
            width: "auto",
            height: "auto",
            top: position.top,
            left: position.left,
            right: position.right,
            bottom: position.bottom
        }
        dataStyle = {
            display: "flex",
            flexDirection: "row",
        }
    } else {
        btnClass = "popup-btns-bottom"

    }

    const buttonElements = buttons.map(btn => {
        return <button key={btn.id} onClick={() => updateDialogue(btn.goto)}>{btn.text}</button>
    })

    return (
        <div className="popup" key={'dialogue-box'} style={popupStyle}>
            <section className="popup-data" style={dataStyle}>
                <div className="popup-text">
                    {text}

                </div>
                <div className={`popup-btns ${btnClass}`}>
                    {buttonElements}
                </div>
            </section>
        </div>
    )
}
