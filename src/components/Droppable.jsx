import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export default function Droppable({children, id}) {
    const {isOver, setNodeRef} = useDroppable({
        id,
        data: {
            containerId: id
        }
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };
    
    
    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
}