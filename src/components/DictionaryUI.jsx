import { SortableContext } from '@dnd-kit/sortable'
import Draggable from './Draggable'
import SortableDraggable from './SortableDraggable'
import DraggableAnywhere from './DraggableAnywhere'
import Droppable from './Droppable'


export default function DictionaryUI({ dictionary, ref, pos, disabled }) {
    const characterElements = dictionary.items.map(word => {
        return (
            <SortableDraggable key={word.id} id={word.id} className='draggable' type='character'>{word.character}</SortableDraggable>
        )
    })
    return (
        <DraggableAnywhere 
            className='dictionary-ui' 
            id={dictionary.id} 
            ref={ref} 
            pos={pos} 
            disabled={disabled} 
            type='container'
        >
            <Droppable id='dictionary-drop'>
                <SortableContext items={dictionary.items.map(item => item.id)}>
                    {characterElements}
                </SortableContext>
            </Droppable>

        </DraggableAnywhere>
    )
}