import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableDraggable from '../base_dnd/SortableDraggable'
import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import Droppable from '../base_dnd/Droppable'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'



export default function DictionaryUI({ dictionary, ref, disabled, rules }) {
    const characterElements = dictionary.items.map(word => {
        if (!rules.active.find(rule => rule.answer.split('').includes(word.character))) return
        return (
            <SortableDraggable key={word.id} id={word.id} className='draggable' type='character'>{word.character}</SortableDraggable>
        )
    })

    return (
        <DraggableAnywhere 
            id='dictionary-handle'
            ref={ref} 
            startPos={{x: useWindowWidth() * 0.55, y: useWindowHeight() / 2 - 80}} 
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