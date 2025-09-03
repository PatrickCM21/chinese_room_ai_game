import { DndContext } from '@dnd-kit/core'
import React from 'react'

import Droppable from './Droppable'

export default function Desk() {
    const [dictionary, setDictionary] = React.useState(["你", "好"])

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
                <button className="dictionary">
                    <img src="dictionary.png" alt='character dictionary'></img>
                </button>
                <button className="rules">
                    <img src="rules.png" alt='rule book'></img>
                    
                </button>

            </section>
        </DndContext>
    )
}