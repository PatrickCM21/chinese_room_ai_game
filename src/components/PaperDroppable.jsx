import SortableDraggable from "./SortableDraggable"
import { SortableContext } from "@dnd-kit/sortable"
import Droppable from "./Droppable"

export default function PaperDroppable({container}) {
    const items = container.items;

    const playedWords = items.map((word) => {
        return <SortableDraggable key={word.id} id={word.id}>
            {word.character}
        </SortableDraggable>
    })

    return (
        <Droppable id={container.id}>
            <SortableContext
                items={items.map(item => item.id)}
            >
                {playedWords}
            </SortableContext>
        </Droppable>
    )
}