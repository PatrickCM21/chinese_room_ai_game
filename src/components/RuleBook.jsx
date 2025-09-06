import DraggableAnywhere from "./DraggableAnywhere"
import { useState } from 'react'
export default function RuleBook({ref, startPos, rules}) {

    const [currPage, setCurrPage] = useState(1);
    const rulesPerPage = 4;

    const lastIndex = currPage * rulesPerPage;
    const firstIndex = lastIndex - rulesPerPage;

    const currRules = rules.active.slice(firstIndex, lastIndex)

    const rulesElements = currRules.map(rule => {
        return (
            <div className='rule' key={rule.id}>
                <span>They say: {rule.order}</span>
                <span>Then you say: {rule.answer}</span>
            </div>
        )
    })

    const pageCount = Math.ceil(rules.active.length / rulesPerPage);
    console.log(rules.active.length)

    let pageButtons = [];
    for (let i = 1; i < pageCount + 1; i++)  {
        pageButtons.push(
            <button 
                onClick={() => setCurrPage(i)} 
                className={currPage === i ? "active-btn" : ""}
            >{i}</button>
        )
    }

    return (
        <DraggableAnywhere 
            id='rulebook-handle'
            ref={ref} 
            startPos={startPos} 
            className='rulebook-ui'
            type='container'
            off={true}
        >
            {rulesElements}
            <div className="rulebook-btns">
                {pageButtons}
            </div>
        </DraggableAnywhere>
    )
}