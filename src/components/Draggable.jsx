import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

export default function Draggable({id, disabled=false, children, className, pos}) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id,
        data: {
            type: 'container'
        },
        disabled
    });
    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
        left: pos.x,
        top: pos.y
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} id={id} className={className}>
            {children}
        </div>
    );
}