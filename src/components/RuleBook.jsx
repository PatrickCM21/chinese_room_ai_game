import DraggableAnywhere from "./DraggableAnywhere"

export default function RuleBook({ref, startPos}) {

    return (
        <DraggableAnywhere 
            id='rulebook-handle'
            ref={ref} 
            startPos={startPos} 
            className='rulebook-ui'
            type='container'
            off={true}
        >
            <div>

            </div>
        </DraggableAnywhere>
    )
}