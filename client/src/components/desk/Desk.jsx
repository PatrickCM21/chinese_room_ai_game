import { closestCenter, DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'
import { v4 as newId } from 'uuid';
import axios from "axios"
import { Wheel } from 'react-custom-roulette-r19'

import useSound from 'use-sound';
import spinSound from '../../assets/sounds/spin.mp3'
import paperRuffleSound from '../../assets/sounds/paperRuffle.wav'
import bookOpenSound from '../../assets/sounds/bookOpen.wav'
import bookCloseSound from '../../assets/sounds/bookClose.wav'
import swooshSound from '../../assets/sounds/swoosh.wav'
import tileSound from '../../assets/sounds/tile.wav'

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
const useAPI = true;

let fetchedOnce = import.meta.hot?.data?.fetchedOnce ?? false;
if (import.meta.hot) {
    import.meta.hot.dispose((data) => {
        data.fetchedOnce = fetchedOnce; // save on module replacement
    });
}


export default function Desk({orderAnswerArr}) {
    const [playSpin] = useSound(spinSound)
    const [playRuffle] = useSound(paperRuffleSound)
    const [playBookOpen] = useSound(bookOpenSound)
    const [playBookClose] = useSound(bookCloseSound)
    const [playSwoosh] = useSound(swooshSound)
    const [playTile] = useSound(tileSound)

    const [fetchedData, setFetchedData] = React.useState(null)
    const [appliedFetchedOnce, setAppliedFetchedOnce] = React.useContext(LevelContext).fetched;
    const [currentlyPlaying, setCurrentlyPlaying] = React.useContext(LevelContext).currentlyPlaying
    const [level, setLevel] = React.useContext(LevelContext).level
    const [speaksChinese, setSpeaksChinese] = React.useContext(LevelContext).speaksChinese
    const [startAPICall, setStartAPICall] = React.useContext(LevelContext).startAPICall
    const [wheelPresent, setWheelPresent] = React.useState(false)
    const [wheelData, setWheelData] = React.useState({})
    const [winningNumber, setWinningNumber] = React.useState()
    const consideredRule = React.useRef()
    const [mustSpin, setMustSpin] = React.useState(false)
    const [potentialChars, setPotentialChars] = React.useState([{"id":"1","character":"恨"},
            {"id":"2","character":"我"},
            {"id":"25","character":"中"},
            {"id":"3","character":"好"}])

    const [orderAnswer, setOrderAnswer] = orderAnswerArr
    const [characters, setCharacters] = React.useState([{
        id: "dictionary",
        items: [
            {"id":"1","character":"恨"},
            {"id":"2","character":"我"},
            {"id":"3","character":"好"},
        ]
        },
        {
        id: "paper",
        items: []
    }])


    const [rules, setRules] = React.useState({
        inactive: [
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
        const host = import.meta.env.VITE_HOST;
        const language = speaksChinese ? "Greek" : "Chinese"
        const response = await axios.get(`${host}/initialise`, {params: {symbol: language}})
        setFetchedData(response)
        console.log("received data")
        console.log(response)
    }

    React.useEffect(() => {
        if (!fetchedOnce && useAPI && startAPICall) {
            fetchedOnce = true;
            if (import.meta.hot) import.meta.hot.data.fetchedOnce = true;
            fetchAPI()
            console.log("called api")
        }
    }, [startAPICall])

    function shuffle(array) {
        let currentIndex = array.length;
    
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }

    React.useEffect(() => {
        if (!fetchedData) return
        if (!useAPI) return
        if (!currentlyPlaying) return
        if (appliedFetchedOnce) return
        console.log('updated using API')
        const seen = new Set();
        setPotentialChars(fetchedData.data.dictionary)
        setCharacters(prev => {
            return prev.map(c => {
                if (c.id === 'paper') return c
                const shuffledRules = [...fetchedData.data.rules]
                shuffle(shuffledRules)
                const items = shuffledRules.map(rule => {
                    const shuffledAnswer = rule.answer.split('')
                    shuffle(shuffledAnswer)
                    return shuffledAnswer.filter(char => {
                        if (!seen.has(char)) {
                            seen.add(char)
                            return true
                        } else return false         
                    })
                })
                return {
                    ...c,
                    items: items.flat().map((char, index) => {return {id: index, character: char}})
                }
        })
        })
        
        setRules({
        inactive: fetchedData.data.rules.slice(4),
        active: fetchedData.data.rules.slice(0,4) ?? [],
        });
        // starting order
        setAppliedFetchedOnce(true);
    }, [currentlyPlaying, fetchedData, appliedFetchedOnce]);

    React.useEffect(() => {
        if (appliedFetchedOnce) {
            generateNewOrder()

        }
    }, [currentlyPlaying])

    const generateNewOrder = React.useCallback(() => {
        if (!rules.active?.length) return;
        const randRule = Math.floor(Math.random() * rules.active.length);
        const newOrder = {
        id: newId(),
        text: rules.active[randRule].order,
        type: 'orders',
        };
        setOrderAnswer(prev => {
            if (prev[orderAnswerContainer.ORDER].items.length >= 5) {
                return prev
            } else {
                playSwoosh()
                return prev.map(c =>
                c.id === 'orders'
                ? { ...c, items: [...c.items, newOrder] }
                : c)
            }
        }
        );
    }, [rules.active, setOrderAnswer]);

    const [activeId, setActiveId] = React.useState(null)
    const [parentDisabled, setParentDisabled] = React.useState(false)
    const dictionaryUIRef = React.useRef(null)
    const dictionaryImg = React.useRef(null)
    const ruleBookUIRef = React.useRef(null)
    const ruleBookImg = React.useRef(null)


    const orderDelay = 15 * 1000; // 15 seconds

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
        if (level.level >= 2) {
            setRules(prev => {
                return {
                    ...prev,
                    active: prev.active.map(rule => {
                        return {id: rule.id, order: rule.order, answer: "???"}
                    })
                }
            })        
        }
    }, [level.level])

    function updateRule(order) {
        
        let data = [];
        for (let i = 0; i < 10; i++) {
            let prizeChars = [];
            for (let j = 0; j < 3; j++) {
                const randInd = Math.floor(Math.random() * potentialChars.length)
                prizeChars.push(potentialChars[randInd].character)
            }
            const color = i % 2 === 0 ? 'green' : 'white';
            data.push({ option: prizeChars.join(''), style: { backgroundColor: color, textColor: 'black' } })
        }
        consideredRule.current = order
        setWheelData(data)
        setWinningNumber(Math.floor(Math.random() * data.length))
        setWheelPresent(true)
        playSpin()

        requestAnimationFrame(() => {
            setMustSpin(true);
        });

    }

    function finishSpinning() { 
        playDing()
        setTimeout(() => {
            setMustSpin(false)
            setWheelPresent(false)
            setRules(prev => {
                return {
                    ...prev,
                    active: prev.active.map(rule => {
                        if (rule.order === consideredRule.current) {
                                return {...rule, answer: wheelData[winningNumber].option}
                            } else return rule
                        })
                }
            })
        }, 2 * 1000)

    }

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
            playBookOpen()
            dictionaryEl.style.visibility = "visible"
            dictionaryImg.current.src= "dictionaryOpen.png"
        } else {
            playBookClose()
            dictionaryEl.style.visibility = "hidden"
            dictionaryImg.current.src= "dictionary.png"

        }
    }

    
    function openRuleBook() {
        const ruleBookEl = ruleBookUIRef.current;
        if (!ruleBookEl.style.visibility || ruleBookEl.style.visibility === "hidden") {
            playBookOpen()
            ruleBookEl.style.visibility = "visible"
            ruleBookImg.current.src= "rulesOpen.png"
        } else {
            playBookClose()
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
        
        playTile()

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
        playRuffle()
        setOrderAnswer(prev => {
            return prev.map(container => {
                if (container.id !== 'answers') return container
                return {
                    ...container,
                    items: [
                        ...container.items,
                        {
                            id: newId(),
                            text: collectCharacters(characters[characterContainer.PAPER].items),
                            type: "answers"
                        }
                    ]
                }
            })

        })
        resetPaper()
    }


    return (
        <>
            {wheelPresent && wheelData.length > 0 && 
            <div className="spinner-wheel">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={winningNumber}
                    data={wheelData}
                    backgroundColors={['#3e3e3e', '#df3428']}
                    textColors={['#ffffff']}
                    onStopSpinning={finishSpinning}
                    spinDuration={0.4}
                    disableInitialAnimation={true}
                />
                
            </div>}
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
                    updateRule={updateRule}
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
