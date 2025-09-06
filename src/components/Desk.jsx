import { closestCenter, DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'
import { v4 as newId } from 'uuid';

import { useWindowWidth } from '@react-hook/window-size'

import DictionaryUI from './DictionaryUI'
import PaperDroppable from './PaperDroppable';
import Order from './Order.jsx';
import Answer from './Answer';
import Droppable from './Droppable';
import RuleBook from './RuleBook';

const orderAnswerContainer = {
    ORDER: 0,
    ANSWER: 1,
    STAPLER: 2,
    FINISHED: 3
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
            {id: 8 , character: "马"},
        ]
        },
        {
        id: "paper",
        items: [
            {id: 5 , character: "中"},
            {id: 6 , character: "很"}
        ]
    }])

    const [orderAnswer, setOrderAnswer] = React.useState([
        {
        id: "orders",
        items: [
            {id: 1 , text: "你好马"},
        ]
        },
        {
        id: "answers",
        items: [
            {id: 2 , text: "好"},
        ]
        },
        {
        id: "stapler",
        items: [
            {id: 3 , text: "你你你", type: 'orders'}
        ]
        },
        {
        id: "finished",
        items: [
            {
                id: 4,
                order: null,
                answer: null,  
            }
        ]
        }
    ])
    


    
    const [activeId, setActiveId] = React.useState(null)
    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)
    const dictionaryImg = React.useRef(null)
    const ruleBookUIRef = React.useRef(null)
    const ruleBookImg = React.useRef(null)
    const outputSidebar = React.useRef(null)
    const [holdingOutput, setHoldingOutput] = React.useState(false)
    const [showOutput, setShowOutput] = React.useState(false)

    

    // Show the sidebar when paper is brought to it
    React.useEffect(() => {
        const checkMousePosition = (e) => {
            if (holdingOutput) {

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


    const staplerItems = orderAnswer[orderAnswerContainer.STAPLER]
    const orderItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'orders')
    const answerItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'answers')
    const staplerItemsElements = (
        <>
            <div className='stapler-drop'>
                {orderItem ? 
                <div>{orderItem.text}</div>
                : <span>Place your order's here!</span>}
            </div>
            <div className='stapler-drop'>
                {answerItem ? 
                <div>{answerItem.text}</div>
                : <span>Place your answer's here!</span>}
            </div>
            {orderItem && answerItem ? 
            <button className='stapler-btn' onClick={createResponse}>Staple</button>
            : null}
        </>
    )

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

    
    function openRuleBook() {
        const ruleBookEl = ruleBookUIRef.current;
        if (!ruleBookEl.style.visibility || ruleBookEl.style.visibility === "hidden") {
            ruleBookEl.style.visibility = "visible"
            ruleBookImg.current.src= "rulesOpen.png"
        } else {
            ruleBookEl.style.visibility = "hidden"
            ruleBookImg.current.src= "rules.png"

        }
    }
    

    function findCharacterContainerId(itemId) {
        if (characters.some(container => container.id === itemId)) {
            return itemId
        }
        return characters.find(container => 
            container.items.some((item) => item.id === itemId)
        )?.id;
    }

    function findPaperContainerId(itemId) {
        if (orderAnswer.some(container => container.id === itemId)) {
            return itemId
        }
        return orderAnswer.find(container => 
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

        const activeContainerId = findCharacterContainerId(activeId)
        const overContainerId = findCharacterContainerId(overId)

        
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

        const prevContainer = findCharacterContainerId(active.id);
        const newContainer = findCharacterContainerId(over.id)
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

    function createResponse() {
        
    }

    function handleNotesDragStart() {
        setHoldingOutput(true)
    }

    function handleNotesDragHover(event) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        console.log("active : " + activeId)
        console.log("over : " + overId)

        const activeContainerId = findPaperContainerId(activeId)
        const overContainerId = findPaperContainerId(overId)

        const activeContainerIndex = orderAnswer.findIndex(c => c.id === activeContainerId)
        const overContainerIndex = orderAnswer.findIndex(c => c.id === overContainerId)

        const activeObj = orderAnswer[activeContainerIndex].items.find(item => item.id === activeId)

        console.log("active cont: " + activeContainerId)
        console.log("over cont: " + overContainerId)
        
        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId) return;

        console.log(orderAnswer[orderAnswerContainer.ANSWER].items)


        setOrderAnswer(prev => {
            return prev.map(container => {
                if (container.id === 'stapler') {
                    const existingItem = container.items.find(item => item.type === activeContainerId)
                    const itemList = existingItem ? 
                        [...container.items.filter(item => item.id !== existingItem.id),
                            {...activeObj, type: activeContainerId}
                        ]
                        : [...container.items, {...activeObj, type: activeContainerId}]
                    return  {
                        ...container,
                        items: itemList
                    }
                } 

                if (container.id === activeContainerId) {
                    const existingItem = prev[orderAnswerContainer.STAPLER].items.find(item => item.type === activeContainerId)
                    // console.log("prev items")
                    // console.log(prev[orderAnswerContainer.STAPLER].items)
                    // console.log("found item")
                    // console.log(existingItem)
                    const itemList = existingItem ? 
                        [...container.items.filter(item => item.id !== activeId),
                        existingItem
                        ]
                        : [...container.items.filter(item => item.id !== activeId)]
                    return {
                        ...container,
                        items: itemList
                    }
                    
                }
                return container;
            })
        })

    }

    function handleNotesDragEnd() {
        setHoldingOutput(false)


    }

    return (
        <>

            <DndContext
                collisionDetection={pointerWithin}
                sensors={sensors}
                modifiers={[restrictToWindowEdges]}  
                autoScroll={false}
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
                        <Droppable id='bin' className='sidebar-container'>

                        </Droppable>
                        
                    </div>
                    <div className='paper-container'>
                        <Droppable id='paper-container' className='sidebar-container'>
                            
                        </Droppable>
                        
                    </div>
                    
                </div>
                <div className='stapler'>
                    <img src='stapler.png' alt='stapler button'></img>

                    <Droppable id='stapler' className='stapler-ui'>
                        {staplerItemsElements}
                    </Droppable>
                </div>
            
            </DndContext>

            <section id='desk'>
                {/* Gives space for the image which is used above */}
                <div className='stapler'>
                </div>
            
            <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                autoScroll={false}
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
                
                <button className="rules" onClick={openRuleBook}>
                    <img src="rules.png" alt='rule book' ref={ruleBookImg}></img>
                
                </button>
                <RuleBook
                    startPos={{x: 150, y: 150}} 
                    ref={ruleBookUIRef}
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
            

        </section>
    </>
    )
}
