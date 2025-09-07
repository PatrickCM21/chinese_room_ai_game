import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableDraggable from '../base_dnd/SortableDraggable'
import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import Droppable from '../base_dnd/Droppable'


export default function DictionaryUI({ dictionary, ref, startPos, disabled }) {
    const characterElements = dictionary.items.map(word => {
        return (
            <SortableDraggable key={word.id} id={word.id} className='draggable' type='character'>{word.character}</SortableDraggable>
        )
    })

    return (
        <DraggableAnywhere 
            id='dictionary-handle'
            ref={ref} 
            startPos={startPos} 
            disabled={disabled} 
            className='dictionary-ui'
            type='container'
            off={true}
        >
            <Droppable id={dictionary.id} className='container'>
                <SortableContext 
                    items={dictionary.items.map(item => item.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {characterElements}
                </SortableContext>
            </Droppable>

        </DraggableAnywhere>
    )
}