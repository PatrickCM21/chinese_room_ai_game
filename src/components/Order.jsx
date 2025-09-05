import DraggableAnywhere from "./DraggableAnywhere"

export default function Order({ children, id }) {
    return (
        <DraggableAnywhere 
            id={id}
            type='order'
            startPos={{x: 120, y: 120}}
            className='paper-ui'
        >
            <article className='paper order'>
                <span>Please Respond:</span>
                {children}
            </article>


        </DraggableAnywhere>
        
    )
}
