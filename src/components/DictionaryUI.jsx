import Draggable from './Draggable'
import DraggableAnywhere from './DraggableAnywhere'


export default function DictionaryUI({ dictionary, ref }) {
    const characterElements = dictionary.map(word => {
        return (
            <Draggable key={word} id={`child-${word}`}>{word}</Draggable>
        )
    })
    return (
        <DraggableAnywhere className='dictionary-ui' ref={ref}>
            {characterElements}
        </DraggableAnywhere>
    )
}