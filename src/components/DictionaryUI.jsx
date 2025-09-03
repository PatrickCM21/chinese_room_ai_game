import Draggable from './Draggable'

export default function DictionaryUI({ dictionary }) {
    const characterElements = dictionary.map(word => {
        return (
            <Draggable key={word} id={word}>{word}</Draggable>
        )
    })
    return (
        <div>
            {characterElements}
        </div>
    )
}