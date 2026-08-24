import { useState } from 'react'
function TaskForm(props){
    const [title, setTitle] = useState('')
    const [deadline, setDeadline] = useState('')
    const [estimatedeffort, setEstimatedEffort] = useState('')
    const [stages,setStages] = useState([])

    function addStage(){
        const newStages = [...stages,
            {
                title: '',
                ownerType: 'me',
                ownerName: '',
                followUpDate: ''}]

        setStages(newStages)
    }

    function updateStage(index,field,value){
        const updatedStages = stages.map((stage,currentIndex)=> {
            if(currentIndex === index){
                return{
                    ...stage,[field]: value
                }
            }
            return  stage
        })
        setStages(updatedStages)
    }

    function handleSubmit(event) {
        event.preventDefault() // Prevents browser's normal behaviour

        const validStages = stages.filter(
            stage => stage.title.trim() !== ''
        )

        //Logging form data for debugging
        const task ={
            title: title,
            deadline: deadline,
            estimatedEffort: estimatedeffort,
            completedEffort: 0,
            stages: validStages
        }
        const empty = ''

        props.onAddTask(task)
        setTitle(empty)
        setDeadline(empty)
        setEstimatedEffort(empty)
        setStages(     [])
    }

    return(
        <div>
        <h2>New Task</h2>
        <form onSubmit={handleSubmit}>
            <div>
            <label>Task Title</label>
            <input
                type="text"
                value={title}
                onChange={(event)=>setTitle(event.target.value)}
                required
            />
            </div>

            <div>
            <label>Deadline</label>
            <input
                type="date"
                value={deadline}
                onChange={(event)=>setDeadline(event.target.value)}
                required
            />
            </div>

            <div>
                <label>Estimated Effort</label>
                <input
                    type="number"
                    value={estimatedeffort}
                    onChange={(event)=>setEstimatedEffort(event.target.value)}
                    min="0"
                    step="0.25"
                    required
                />
            </div>

            <button type="submit">Add Task</button>

            <div className="stages-section">

                <h3>Stages</h3>

                {stages.map((stage, index) => (
                    <div
                        className="stage-row"
                        key={index}
                    >
            <span className="stage-number">
                {index + 1}
            </span>

            <span className = "stage-title">
                <label> Stage Title</label>
                <input
                    type= "text"
                    value = {stage.title}
                    onChange={(event)=>
                        updateStage(
                            index,'title',event.target.value
                        )
                }
                  required
                />
            </span>

            <span className= "ownerType" >
               <select
                   value = {stage.ownerType}
                   onChange={
                   (event)=>updateStage(
                       index,'ownerType',event.target.value
                   )
               }
                   >
                   <option value="me"> Me </option>
                   <option value= "other">Someone else</option>
               </select>
            </span>

            {stage.ownerType === 'other' &&(
            <span className= "ownerName">
                <label> Who? </label>

                <input
                    type= "text"
                    value= {stage.ownerName}
                    onChange = {(event) =>
                        updateStage(
                            index,'ownerName',event.target.value
                        )
                }
                    required
                />
            </span>
                )}
                {stage.ownerType === "other" && (
                    <div className="stage-follow-up-field">
                        <label>Follow up</label>

                        <input
                            type="date"
                            value={stage.followUpDate}
                            onChange={(event) =>
                                updateStage(
                                    index,
                                    "followUpDate",
                                    event.target.value
                                )
                            }
                        />
                </div>
                )}
                    </div>
                ))}


                <button
                    type="button"
                    className="add-stage-button"
                    onClick={addStage}
                >
                    + Add stage
                </button>

            </div>
        </form>
        </div>
    )
}
export default TaskForm