import { SortableContext } from '@dnd-kit/sortable'
import Draggable from './Draggable'
import SortableDraggable from './SortableDraggable'
import DraggableAnywhere from './DraggableAnywhere'


export default function DictionaryUI({ dictionary, ref, id, pos, disabled }) {
    const characterElements = dictionary.map(word => {
        return (
            <SortableDraggable key={word} id={`child-${word}`}>{word}</SortableDraggable>
        )
    })
    return (
        <DraggableAnywhere className='dictionary-ui' id={id} ref={ref} pos={pos} disabled={disabled}>
            <SortableContext items={dictionary.map(char => `child-${char}`)}>
                {characterElements}
            </SortableContext>
        </DraggableAnywhere>
    )
}