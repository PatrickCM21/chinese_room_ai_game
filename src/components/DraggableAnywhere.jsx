import * as React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, useDndContext } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers'; // optional

function DraggableAnywhere({ children, ref }) {
  // starting position (pixels from top-left of the viewport)
    const [pos, setPos] = React.useState({ x: 120, y: 120 });
    const [parentDisabled, setParentDisabled] = React.useState(false)

    const sensors = useSensors(
    useSensor(PointerSensor, 
        { activationConstraint: { distance: 3 },
    }) // tiny movement before drag starts
    );

    return (
    <div ref={ref}>
        <DndContext
            sensors={sensors}
            modifiers={[restrictToWindowEdges]} // remove this line if you truly want *anywhere*, even off-screen
            onDragStart={({active}) => {
                String(active.id).startsWith("child-") ? setParentDisabled(true) : null
            }}
            onDragEnd={({ delta }) => {
            // No droppables: just commit the movement delta
                setPos(p => ({ x: p.x + delta.x, y: p.y + delta.y }));
            }}
            
        >
            <DraggableBox pos={pos} disabled={parentDisabled}>
                {children}
            </DraggableBox>
        </DndContext>
    </div>
    );
}

function DraggableBox({ pos, children, parentDisabled }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable(
        { 
            id: 'free-box', 
            disabled: parentDisabled
        });

    

  // During drag, dnd-kit gives a live `transform` we can compose with our saved position.
    const style = {
    position: 'fixed',            // or 'absolute' inside a positioned ancestor
    left: pos.x,
    top: pos.y,
    transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    width: 120,
    height: 80,
    cursor: 'grab',
    border: '1px solid #999',
    borderRadius: 12,
    padding: 12,
    background: 'white',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    userSelect: 'none',
    };

    return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {children}
    </div>
    );
}

export default DraggableAnywhere;