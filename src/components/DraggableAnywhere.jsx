import Draggable from './Draggable' 

function DraggableAnywhere({ children, ref, className, id, pos, disabled }) {

    return (
        <div ref={ref} className='default-off'>
            <Draggable id={id} ref={ref} className={className} pos={pos} disabled={disabled}>
                {children}
            </Draggable>
        </div>
    );
}


export default DraggableAnywhere;
