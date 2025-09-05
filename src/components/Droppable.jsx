import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export default function Droppable({children, id, className=''}) {
    const {isOver, setNodeRef} = useDroppable({
        id,
        data: {
            containerId: id
        }
    });
    
    
    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}