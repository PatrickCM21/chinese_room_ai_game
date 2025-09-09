import { closestCenter, DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'
import { v4 as newId } from 'uuid';
import axios from "axios"

import DictionaryUI from './DictionaryUI.jsx'
import PaperDroppable from './PaperDroppable.jsx';
import RuleBook from './RuleBook.jsx';
import DeskOverlay from './DeskOverlay.jsx';
import { LevelContext } from '../Context.jsx';

const characterContainer = {
    DICTIONARY: 0,
    PAPER: 1
}

const orderAnswerContainer = {
    ORDER: 0,
    ANSWER: 1,
    STAPLER: 2,
    RESPONSES: 3,
    BIN: 4,
    PAPERCONTAINER: 5
}   

// Used to toggle api
const useAPI = false;

let fetchedOnce = import.meta.hot?.data?.fetchedOnce ?? false;
if (import.meta.hot) {
    import.meta.hot.dispose((data) => {
        data.fetchedOnce = fetchedOnce; // save on module replacement
    });
}


export default function Desk({orderAnswerArr}) {
    const [fetchedData, setFetchedData] = React.useState({})
    const [appliedFetchedOnce, setAppliedFetchedOnce] = React.useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = React.useContext(LevelContext).currentlyPlaying
    const [level, setLevel] = React.useContext(LevelContext).level


    const [orderAnswer, setOrderAnswer] = orderAnswerArr
    const [characters, setCharacters] = React.useState([{
        id: "dictionary",
        items: [
            {"id":"1","character":"恨"},
            {"id":"2","character":"我"},
            {"id":"25","character":"中"},
            {"id":"3","character":"好"},
        ]
        },
        {
        id: "paper",
        items: []
    }])


    const [rules, setRules] = React.useState({
        inactive: [
            {
                id: 1,
                order: "中",
                answer: "中"
            }
        ],
        active: [
            {
                id: 1,
                order: "你好吗",
                answer: "我恨好"
            },
        ]
    })

    const fetchAPI = async () => {
        const response = await axios.get("http://localhost:8080/initialise")
        console.log(response)
        setFetchedData(response)
    }

    React.useEffect(() => {
        if (!fetchedOnce && useAPI) {
            fetchedOnce = true;
            if (import.meta.hot) import.meta.hot.data.fetchedOnce = true;
            fetchAPI()
            console.log("called api")
        }
    }, [])


    React.useEffect(() => {
        if (!currentlyPlaying) return;
        if (!fetchedData) return;
        if (!useAPI) return
        if (appliedFetchedOnce) return;
        setCharacters([
        { id: "dictionary", items: fetchedData.data.dictionary ?? [] },
        { id: "paper", items: [] },
        ]);
        setRules({
        inactive: fetchedData.data.rules.slice(4),
        active: fetchedData.data.rules.slice(0,4) ?? [],
        });
        setAppliedFetchedOnce(true);
    }, [currentlyPlaying, fetchedData, appliedFetchedOnce]);



    const generateNewOrder = React.useCallback(() => {
        if (!rules.active?.length) return;
        const randRule = Math.floor(Math.random() * rules.active.length);
        const newOrder = {
        id: newId(),
        text: rules.active[randRule].order,
        type: 'orders',
        };
        setOrderAnswer(prev =>
        prev[orderAnswerContainer.ORDER].items.length >= 5
            ? prev
            : prev.map(c =>
                c.id === 'orders'
                ? { ...c, items: [...c.items, newOrder] }
                : c
            )
        );
    }, [rules.active, setOrderAnswer]);

    const [activeId, setActiveId] = React.useState(null)
    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)
    const dictionaryImg = React.useRef(null)
    const ruleBookUIRef = React.useRef(null)
    const ruleBookImg = React.useRef(null)


    const orderDelay = 20 * 1000; // 10 seconds

    React.useEffect(() => {
        if (!currentlyPlaying) return
        const interval = setInterval(generateNewOrder, orderDelay)
        return (() => clearInterval(interval))
    }, [currentlyPlaying, generateNewOrder])

    React.useEffect(() => {
        if (level.level === 0) return;
        setRules(prev => {
            const newRules = prev.inactive.splice(0,4)
            prev.active.push(...newRules)
            return prev
        })        
    }, [level.level])

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


    const getActiveItem = () => {
        let item;
        
        for (const container of characters) {
            item = container.items.find(item => 
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

        if (active.id === 'dictionary-handle' || active.id === 'rulebook-handle') return;


        const activeContainerId = findCharacterContainerId(activeId)
        const overContainerId = findCharacterContainerId(overId)
        const activeContainerIndex = characters.findIndex(c => c.id === activeContainerId)

        const activeObj = characters[activeContainerIndex].items.find(item => item.id === activeId)

        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId) return;

        setCharacters(prev => {
            const activeContainer = prev.find(c => c.id === activeContainerId)
            if (!activeContainer) return prev;
            
            const activeItem = activeContainer.items.find(item => item.id === activeId)
            if (!activeItem) return prev;

            

            const newContainers = prev.map(container => {
                if (container.id === activeContainerId) {
                    if (container.id === 'dictionary') {

                        console.log("triggered duplicating in dic")
                        const currItemIndex = container.items.findIndex(item => item.id === activeId)
                        if (currItemIndex === -1) return container
                        

                        const newDic = {
                        ...container,
                        items: [
                            ...container.items.slice(0, currItemIndex),
                            {...activeObj, id: newId()},
                            ...container.items.slice(currItemIndex + 1)
                        ]
                        } 
                        return newDic
                    } else {
                        return {
                            ...container,
                            items: container.items.filter(item => item.id !== activeId),
                        }
                    }
                    
                }
                if (container.id === overContainerId) {
                    if (overContainerId === 'dictionary') {
                        const newDic = {
                        ...container,
                        items: [
                            ...container.items.filter(char => char.character !== activeObj.character),
                            activeObj,
                        ]
                        } 
                        return newDic
                    }
                    if (overId === overContainerId) {
                        return {
                        ...container,
                        items: [...container.items, activeItem]
                        }   
                    }
                }

                const overItemIndex = container.items.findIndex(item => item.id === overId)
                if (overItemIndex !== -1) {
                    console.log("removed but indexing this time")
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

        if (newContainer === 'dictionary') {
            setCharacters(prev => {
                return prev.map(c => {
                    if (c.id === 'dictionary') {
                        return normaliseDictionary(c)
                    } else {
                        return c
                    }
                })
            })
        }
        setActiveId(null)
    }

    function normaliseDictionary(c) {
        const seen = new Set();
        const charsSet = c.items.filter(char => {
            if (!seen.has(char.character)) {
                seen.add(char.character)
                return true
            } else {
                return false
            }
        })
        return {
            ...c,
            items: charsSet
        }
    }

    function CharacterOverlay({ children, className }) {
        return (
            <div className={className}>
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
                } else return container
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
    }


    return (
        <>
            <DeskOverlay orderAnswerArr = {[orderAnswer, setOrderAnswer]} rulesList = {[rules, setRules]}/>

            <section id='desk'>
                {/* Gives space for the image which is used in overlay */}
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
                    disabled={parentDisabled}
                    rules={rules}
                />
                
                <button className="rules" onClick={openRuleBook}>
                    <img src="rules.png" alt='rule book' ref={ruleBookImg}></img>
                
                </button>
                <RuleBook
                    ref={ruleBookUIRef}
                    rules={rules}
                />

                <DragOverlay
                    dropAnimation={{
                    duration: 150,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
                    }}
                    > 
                    {activeId && (getActiveItem() !== null) 
                    ? (
                    <CharacterOverlay className='draggable'>
                        {getActiveItem()?.character}
                    </CharacterOverlay>
                    ): null}
                </DragOverlay>
            </DndContext>
            

        </section>
    </>
    )
}
