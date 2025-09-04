import { closestCorners, DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'

import DictionaryUI from './DictionaryUI'
import PaperDroppable from './PaperDroppable';


export default function Desk() {
    const [characters, setCharacters] = React.useState([{
        id: "dictionary",
        items: [
            {id: 0 , character: "你"},
            {id: 1 , character: "好"}
        ]
        },
        {
            id: "paper",
        items: [
            {id: 3 , character: "中"},
            {id: 4 , character: "文"}
        ]
        }]
    )

    const [dicPos, setDicPos] = React.useState({ x: 120, y: 120 });
    const [activeId, setActiveId] = React.useState(null)
    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor)
    )

    function openDictionary() {
        const dictionaryEl = dictionaryUIRef.current;
        if (!dictionaryEl.style.visibility || dictionaryEl.style.visibility === "hidden") {
            dictionaryEl.style.visibility = "visible"
        } else {
            dictionaryEl.style.visibility = "hidden"
        }
    }

    

    function findContainerId(itemId) {
        if (characters.some(container => container.id === itemId)) {
            return itemId
        }
        return characters.find(container => 
            container.items.some((item) => item.id === itemId)
        )?.id;
    }

    function findIndex(itemId, container) {
        return container.indexOf(itemId);
    }
    
    
    const getActiveItem = () => {
        for (const container of characters) {
        const item = container.items.find(item => 
            item.id === activeId
        )
        if (item) return item
        }
        return null
    }


    function handleDragStart(event) {
        setActiveId(event.active.id)
    }

    function handleDragOver(event) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainerId = findContainerId(activeId)
        const overContainerId = findContainerId(overId)

        
        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId) return;

        setCharacters(prev => {
            const activeContainer = prev.find(c => c.id === activeContainerId)
            if (!activeContainer) return prev;
            
            const activeItem = activeContainer.items.find(item => item.id === activeId)
            if (!activeItem) return prev;

            const newContainers = prev.map(container => {
                if (container.id === activeContainerId) {
                    return {
                        ...container,
                        items: container.items.filter(item => item.id !== activeId)
                    }
                }
                if (container.id === overContainerId) {
                    if (overId === overContainerId) {
                        console.log("over empty")
                        return {
                        ...container,
                        items: [...container.items, activeItem]
                        }
                    }
                }

                const overItemIndex = container.items.findIndex(item => item.id === overId)
                if (overItemIndex !== -1) {
                    return {
                        ...container,
                        items: [
                        ...container.items.slice(0, overItemIndex + 1),
                        activeItem,
                        ...container.items.slice(overItemIndex + 1)
                        ]
                    }
                }

                return container
            })
            return newContainers
        })
    }

    function handleCharacterDragEnd(event) {
        const {active, over} = event;

        if (!over) {
            setActiveId(null);
            return;
        }
        const prevContainer = findContainerId(active.id);
        const newContainer = findContainerId(over.id)
        if (!prevContainer || !newContainer) return;


        if (prevContainer === newContainer && active.id === over.id) {
            const containerIndex = characters.findIndex(c => c.id === prevContainer)

            if (containerIndex === -1) {
                setActiveId(null)
                return
            }

            const container = characters[containerIndex]
            const activeIndex = container.items.findIndex(item => item.id === active.id)
            const overIndex = container.items.findIndex(item => item.id === over.id)

            if (activeIndex !== -1 && overIndex !== -1) {
                const newItems = arrayMove(container.items, activeIndex, overIndex)

                setCharacters((container) => {
                    return container.map((c, i) => {
                        if (i === containerIndex) {
                            return {...c, items: newItems}
                        } else {
                            return c
                        }
                    })
                })
            }
        }
        setActiveId(null)
    }

    return (
        <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            modifiers={[restrictToWindowEdges]} 
            onDragStart={(event) => {
                event.active.data.current.type === 'character' ? setParentDisabled(true) : null
                handleDragStart(event)
            }}
            onDragOver={handleDragOver}
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
                    <PaperDroppable container={characters.find(container => container.id === "paper")} />
                </div>

                <button className="dictionary" onClick={openDictionary}>
                    <img src="dictionary.png" alt='character dictionary'></img>
                </button>
                <button className="rules">
                    <img src="rules.png" alt='rule book'></img>
                    
                </button>

            </section>
            <DictionaryUI 
                dictionary={characters.find(container => container.id === "dictionary")} 
                ref={dictionaryUIRef} 
                pos={dicPos} 
                disabled={parentDisabled}
            />

        </DndContext>
    )
}
