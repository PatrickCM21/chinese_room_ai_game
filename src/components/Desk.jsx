import { closestCenter, DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'
import { v4 as newId } from 'uuid';

import { useWindowWidth } from '@react-hook/window-size'

import DictionaryUI from './DictionaryUI'
import PaperDroppable from './PaperDroppable';
import Order from './oRDER.JSX';
import Answer from './Answer';
import Droppable from './Droppable';

const orderAnswerContainer = {
    ORDER: 0,
    ANSWER: 1
}

const characterContainer = {
    DICTIONARY: 0,
    PAPER: 1
}


export default function Desk() {
    const windowWidth = useWindowWidth();


    const [characters, setCharacters] = React.useState([{
        id: "dictionary",
        items: [
            {id: 1 , character: "你"},
            {id: 2 , character: "好"},
            {id: 3 , character: "中"},
            {id: 4 , character: "文"},
            {id: 7 , character: "马"},
        ]
        },
        {
        id: "paper",
        items: [
            {id: 5 , character: "中"},
            {id: 6 , character: "很"}
        ]
    }])

    const [orderAnswer, setOrderAnswer] = React.useState([{
        id: "orders",
        items: [
            {id: 1 , text: "你好马"},
        ]
        },

        {
        id: "answers",
        items: [
            {id: 5 , text: "好"},
        ]
    }])

    
    const [activeId, setActiveId] = React.useState(null)
    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)
    const dictionaryImg = React.useRef(null)
    const outputSidebar = React.useRef(null)
    const [holdingOutput, setHoldingOutput] = React.useState(false)
    const [showOutput, setShowOutput] = React.useState(false)

    React.useEffect(() => {
        const checkMousePosition = (e) => {
            if (holdingOutput) {
            console.log(outputSidebar.current)

                if (e.clientX > (windowWidth * 0.6)) {
                    setShowOutput(true)
                } else {
                    setShowOutput(false)
                }
            }
        }
        window.addEventListener('mousemove', checkMousePosition)

        return () => {
            window.removeEventListener('mousemove', checkMousePosition)
            setShowOutput(false)

        }
    }, [holdingOutput])

    const orderList = orderAnswer.find(container => container.id === 'orders').items.map(order => {
        return <Order id={order.id}>
            {order.text}
        </Order>
    })

    const answerList = orderAnswer.find(container => container.id === 'answers').items.map(order => {
        return <Answer id={order.id}>
            {order.text}
        </Answer>
    })

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
            dictionaryImg.current.src= "dictionaryOpen.png"
        } else {
            dictionaryEl.style.visibility = "hidden"
            dictionaryImg.current.src= "dictionary.png"

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

        if (prevContainer === newContainer && active.id !== over.id) {
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
                    return characters.map((c, i) => {
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

    function ItemOverlay({ children }) {
        return (
            <div className='draggable'>
                <span >{children}</span>
            </div>
        )
    }

    function resetPaper() {
        setCharacters(containers => {
            return containers.map(container => {
                if (container.id === 'paper') {
                    return {
                        id: 'paper',
                        items: []
                    }
                }
                return {
                    ...container,
                    items: [
                        ...container.items,
                        ...characters[characterContainer.PAPER].items
                    ]
                }
            })
        })
    }

    function collectCharacters(items) {
        const charList = items.map(item => item.character);
        return charList.join("")
    }

    function createAnswer() {
        if (characters[characterContainer.PAPER].items.length === 0) return;
        setOrderAnswer(prev => {
            return prev.map(container => {
                if (container.id !== 'answers') return container
                return {
                    ...container,
                    items: [
                        ...container.items,
                        {
                            id: newId(),
                            text: collectCharacters(characters[characterContainer.PAPER].items)
                        }
                    ]
                }
            })

        })
        resetPaper()
        console.log(orderAnswer)
    }

    function handleNotesDragStart() {
        setHoldingOutput(true)
    }

    function handleNotesDragHover() {
        console.log("over")
    }

    function handleNotesDragEnd() {
        setHoldingOutput(false)


    }

    return (
        <>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToWindowEdges]} 
                onDragStart={handleNotesDragStart}
                onDragOver={handleNotesDragHover}
                onDragEnd={handleNotesDragEnd}
            >
                <div>
                    {orderList}

                    {answerList}
                </div>
                <div className={`output ${showOutput ? 'output-display' : ''}`} ref={outputSidebar}>
                    <div className='bin'>
                        <Droppable id='bin' className='container'>

                        </Droppable>
                        
                    </div>
                    <div className='paper-container'>
                        <Droppable id='paper-container' className='container'>
                            
                        </Droppable>
                        
                    </div>
                </div>
            
            </DndContext>
            <section id='desk'>
            
            <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                modifiers={[restrictToWindowEdges]} 
                onDragStart={(event) => {
                    event.active.data.current.type === 'character' ? setParentDisabled(true) : null
                    handleDragStart(event)
                }}
                onDragOver={handleDragOver}
                onDragEnd={({ active, over, delta }) => {
                    setParentDisabled(false);
                    handleCharacterDragEnd({active, over})
                    
                }}
            >
                <div className='orders'></div>
                <div className='workspace'>
                    <button className='paper-furl-btn' onClick={createAnswer}></button>
                    <PaperDroppable container={characters.find(container => container.id === "paper")} />
                </div>

                <button className="dictionary" onClick={openDictionary}>
                    <img src="dictionary.png" alt='character dictionary' ref={dictionaryImg}></img>
                </button>
                <DictionaryUI 
                    dictionary={characters.find(container => container.id === "dictionary")} 
                    ref={dictionaryUIRef} 
                    startPos={{x: 150, y: 150}} 
                    disabled={parentDisabled}
                />
                <DragOverlay
                    dropAnimation={{
                    duration: 150,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
                    }}
                    > 
                    {activeId ? (
                    <ItemOverlay>
                        {getActiveItem()?.character}
                    </ItemOverlay>
                    ): null}
                </DragOverlay>
            </DndContext>
            <button className="rules">
                <img src="rules.png" alt='rule book'></img>
                
            </button>
            

        </section>
    </>
    )
}
