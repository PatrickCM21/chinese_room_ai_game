import { DndContext } from '@dnd-kit/core'
import React from 'react'

import Droppable from './Droppable'
import DictionaryUI from './DictionaryUI'


export default function Desk() {
    const [dictionary, setDictionary] = React.useState(["你", "好"])
    const dictionaryUIRef = React.useRef(null)

    function openDictionary() {
        const dictionaryEl = dictionaryUIRef.current;
        if (dictionaryEl.style.visibility === "hidden") {
            dictionaryEl.style.visibility = "visible"
        } else {
            dictionaryEl.style.visibility = "hidden"
        }
    }

    return (
        <DndContext>
            <section id='desk'>
            
                <div classname='orders'>

                </div>
                <div classname='workspace'>
                    <img src="paper.png" alt='working-paper'></img>
                    <Droppable>

                    </Droppable>

                </div>

                <DictionaryUI dictionary={dictionary} ref={dictionaryUIRef}/>
                <button className="dictionary" onClick={openDictionary}>
                    <img src="dictionary.png" alt='character dictionary'></img>
                </button>
                <button className="rules">
                    <img src="rules.png" alt='rule book'></img>
                    
                </button>

            </section>
        </DndContext>
    )
}