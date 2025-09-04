import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

export default function SortableDraggable({id, disabled=false, children}){
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({
        id
    });
    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className='draggable'>
            {children}
        </div>
    );
}