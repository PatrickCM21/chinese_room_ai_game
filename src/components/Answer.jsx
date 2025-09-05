import DraggableAnywhere from "./DraggableAnywhere"

export default function Answer({id, children}) {
    return (
        <DraggableAnywhere 
            id={id}
            type='answer'
            startPos={{x: 120, y: 120}}
            className='paper-ui'
        >
            <article className='paper answer'>
                {children}
            </article>


        </DraggableAnywhere>
        
    )
}