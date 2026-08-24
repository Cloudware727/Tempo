import TaskCard from "./TaskCard.jsx"
import WaitingCard from "./WaitingCard.jsx"

function TasksPage({
                       tasks,
                       onLogWork,
                       onDeleteTask,
                       onCompleteTask,
                       onEditTask,
                       onToggleStage,
                       onStartFocus,
                       onExtendEstimate,
                       onEditStage,
                       onAddStage,
                       onDeleteStage
                   }) {

    function getCurrentStage(task) {
        return task.stages?.find(
            stage => stage.completed === false
        )
    }


    function getDaysRemaining(deadline) {
        const today = new Date()
        const deadlineDate = new Date(deadline)

        const millisecondsPerDay =
            1000 * 60 * 60 * 24

        return Math.ceil(
            (deadlineDate - today) /
            millisecondsPerDay
        )
    }


    function getRequiredWorkPerDay(task) {
        const remainingDays =
            getDaysRemaining(task.deadline)

        const remainingEffort =
            Number(task.estimatedEffort) -
            Number(task.completedEffort)

        if (remainingDays <= 0) {
            return Infinity
        }

        return remainingEffort / remainingDays
    }


    const activeTasks = tasks.filter(task => {
        const currentStage = getCurrentStage(task)

        return (
            !task.completed &&
            (
                currentStage === undefined ||
                currentStage.ownerType === "me"
            )
        )
    })


    const sortedTasks = [...activeTasks].sort(
        (a, b) =>
            getRequiredWorkPerDay(b) -
            getRequiredWorkPerDay(a)
    )


    const completedTasks = tasks.filter(
        task => task.completed
    )


    const waitingTasks = tasks.filter(task => {
        const currentStage = getCurrentStage(task)

        return (
            !task.completed &&
            currentStage !== undefined &&
            currentStage.ownerType === "other"
        )
    })


    return (
        <div className="task-layout">

            {/* ACTIVE TASKS */}

            <div className="tasks-section">

                <div className="tasks-header">

                    <h2>Tasks</h2>

                    <span>
                        {activeTasks.length} active
                    </span>

                </div>


                {sortedTasks.map(task => (

                    <TaskCard
                        key={task.id}

                        id={task.id}
                        title={task.title}
                        deadline={task.deadline}

                        estimatedEffort={
                            task.estimatedEffort
                        }

                        completedEffort={
                            task.completedEffort
                        }

                        completed={
                            task.completed
                        }

                        stages={
                            task.stages
                        }

                        onLogWork={onLogWork}
                        onDeleteTask={onDeleteTask}
                        onCompleteTask={onCompleteTask}
                        onEditTask={onEditTask}
                        onToggleStage={onToggleStage}
                        onStartFocus={onStartFocus}
                        onExtendEstimate={onExtendEstimate}
                        onEditStage={onEditStage}
                        onAddStage={onAddStage}
                        onDeleteStage={onDeleteStage}
                    />

                ))}

            </div>


            {/* RIGHT SIDEBAR */}

            <div className="right-sidebar">


                {/* COMPLETED */}

                <div className="completed-section">

                    <div className="completed-header">

                        <h2>Completed</h2>

                        <span>
                            {completedTasks.length} completed
                        </span>

                    </div>


                    {completedTasks.map(task => (

                        <TaskCard
                            key={task.id}

                            id={task.id}
                            title={task.title}
                            deadline={task.deadline}

                            estimatedEffort={
                                task.estimatedEffort
                            }

                            completedEffort={
                                task.completedEffort
                            }

                            completed={
                                task.completed
                            }

                            stages={
                                task.stages
                            }

                            onLogWork={
                                onLogWork
                            }

                            onDeleteTask={
                                onDeleteTask
                            }

                            onToggleStage={
                                onToggleStage
                            }
                        />

                    ))}

                </div>


                {/* WAITING */}

                <div className="waiting-section">

                    <div className="waiting-header">

                        <h2>Waiting</h2>

                        <span>
                            {waitingTasks.length} waiting
                        </span>

                    </div>


                    {waitingTasks.map(task => (

                        <WaitingCard
                            key={task.id}

                            title={
                                task.title
                            }

                            deadline={
                                task.deadline
                            }

                            currentStage={
                                getCurrentStage(task)
                            }

                            onToggleStage={
                                onToggleStage
                            }

                            onDeleteTask={
                                onDeleteTask
                            }
                        />

                    ))}

                </div>

            </div>

        </div>
    )
}


export default TasksPage