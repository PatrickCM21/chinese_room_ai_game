import { closestCorners, DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'

import Draggable from './Draggable'
import SortableDraggable from './SortableDraggable'
import Droppable from './Droppable'
import DictionaryUI from './DictionaryUI'


export default function Desk() {
    const [characters, setCharacters] = React.useState({
        inDic: ["你", "好"],
        inPaper: ["中", "文"]
    })

    const [dicPos, setDicPos] = React.useState({ x: 120, y: 120 });

    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)

    function openDictionary() {
        const dictionaryEl = dictionaryUIRef.current;
        if (!dictionaryEl.style.visibility || dictionaryEl.style.visibility === "hidden") {
            dictionaryEl.style.visibility = "visible"
        } else {
            dictionaryEl.style.visibility = "hidden"
        }
    }

    const playedWords = characters.inPaper.map((word) => {
        return <SortableDraggable key={word} id={word}>
            {word}
        </SortableDraggable>
    })

    const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }) // tiny movement before drag starts
    );

    function findContainer(itemId, containers) {
        return Object.keys(containers).find(cid => {
            return containers[cid].includes(itemId)

        }
        );
    }

    function findIndex(itemId, container) {
        return container.indexOf(itemId);
    }


    function handleCharacterDragEnd(event) {
        const {active, over} = event;
        console.log(active)
        console.log(over)

        if (!over || active.id === over.id) return;

        const prevContainer = findContainer(active.id, characters);
        const newContainer = findContainer(over.id, characters);
        console.log(characters[prevContainer])


        if (prevContainer === newContainer) {
            console.log("same container")
            const oldIndex = findIndex(active.id, characters[prevContainer]);
            const newIndex = findIndex(over.id, characters[newContainer]);
            setCharacters((prev) => ({
            ...prev,
            [newContainer]: arrayMove(prev[newContainer], oldIndex, newIndex),
            }));
            return;
        }

        setCharacters(prev => {
            const from = [...prev[prevContainer]];
            const to = [...prev[newContainer]];

            const oldIndex = findIndex(active.id, from);
            const newIndex = findIndex(over.id, to);

            let insertIndex = to.length;
            if (newIndex != -1) insertIndex = newIndex;

            from.splice(oldIndex, 1);
            to.splice(insertIndex, 0, active.id)

            return ({
                ...prev,
                [fromCid]: from,
                [toCid]: to,
            })
        })
    }

    return (
        <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            modifiers={[restrictToWindowEdges]} 
            onDragStart={({active}) => {
                active.data.current.type === 'character' ? setParentDisabled(true) : null
            }}
            onDragEnd={({ active, over, delta }) => {
            // No droppables: just commit the movement delta
                if (!parentDisabled) {
                    setDicPos(p => ({ x: p.x + delta.x, y: p.y + delta.y }));
                } else {
                    setParentDisabled(false);
                    handleCharacterDragEnd({active, over})
                }
            }}
        >
            <section id='desk'>
            
                <div className='orders'>

                </div>
                <div className='workspace'>
                    <SortableContext
                        items={characters.inPaper}
                    >
                        {playedWords}
                    </SortableContext>
                </div>

                <button className="dictionary" onClick={openDictionary}>
                    <img src="dictionary.png" alt='character dictionary'></img>
                </button>
                <button className="rules">
                    <img src="rules.png" alt='rule book'></img>
                    
                </button>

            </section>
            <DictionaryUI 
                dictionary={characters.inDic} 
                ref={dictionaryUIRef} 
                id='dictionary-ui'
                pos={dicPos} 
                disabled={parentDisabled}
            />

        </DndContext>
    )
}

// <div ref={ref} className='dictionary-ui-holder'>
//     <DndContext
//         
        
//     >
//         <DraggableBox  className={className}>
//             {children}
//         </DraggableBox>
//     </DndContext>
// </div>