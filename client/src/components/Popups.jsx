import PopupItem from "./PopupItem"
import "./Popup.css"

import React from 'react'

// Popup interface
// {id, content, button1, button2}

export default function Popups() {
    const [popupList, setPopupList] = React.useState([])

    if (popupList.length < 1) return;

    const currentPopup = popupList[0];
    return (
        <div className="popups">
            <PopupItem/>

        </div>
    )
}