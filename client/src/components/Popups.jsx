import PopupItem from "./PopupItem"
import "./Popup.css"
import { LevelContext, TutorialContext } from "./Context"
import popupsJSON from "../assets/popups.json"

import React from 'react'

// Popup interface
// {id, content, button1, button2}

export default function Popups({orderAnswerArr}) {
    const [popupIndex, setPopupIndex] = React.useState(0)
    const [dialogue, setDialogue] = React.useContext(LevelContext).dialogue
    const [currentlyPlaying, setCurrentlyPlaying] = React.useContext(LevelContext).currentlyPlaying
    const dialogueClosed = React.useRef(false)
    const [key, setKey] = React.useState(0)
    const [isTutorial, setIsTutorial] = React.useState(false)

    let currentPopup
    if (dialogueClosed.current) {
        currentPopup = null
    } else {
        currentPopup = popupsJSON[dialogue].popups;
    }

    function updateDialogue(goto) {
        if (goto !== null) {
            setPopupIndex(goto)
        } else {
            dialogueClosed.current = true;
            setCurrentlyPlaying(true)
            setKey(prev => prev + 1)
        }
    }
    
    React.useEffect(() => {
        setPopupIndex(0)
    }, [dialogue])

    if (currentPopup === null) return;
    if (isTutorial) console.log("tutorial render")
    return (
        <TutorialContext value={[isTutorial, setIsTutorial]}>
            {!isTutorial ? <div className="popups" key={key}>
                <PopupItem
                    text={currentPopup[popupIndex].text}
                    buttons={currentPopup[popupIndex].buttons}
                    updateDialogue={updateDialogue}
                    actions={currentPopup[popupIndex]?.actions}
                    orderAnswerArr={orderAnswerArr}
                />
            </div>
            : <PopupItem
                    text={currentPopup[popupIndex].text}
                    buttons={currentPopup[popupIndex].buttons}
                    updateDialogue={updateDialogue}
                    actions={currentPopup[popupIndex]?.actions}
                    orderAnswerArr={orderAnswerArr}
            />}
        </TutorialContext>
    )
}