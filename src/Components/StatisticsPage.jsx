import { Link } from "react-router-dom"

function StatisticsPage({ tasks, dailyAllocations }) {

    const allocatedWorkToday =
        dailyAllocations.reduce(
            (total, allocation) =>
                total + Number(allocation.allocatedEffort),
            0
        )

    function getCurrentStage(task) {
        return task.stages?.find(
            stage => stage.completed === false
        )
    }


    function getTodayString() {
        const today = new Date()

        const year = today.getFullYear()

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0")

        const day = String(
            today.getDate()
        ).padStart(2, "0")

        return `${year}-${month}-${day}`
    }

    // Gets how much time is remaining for a specific task
    function getRemainingEffort(task) {
        return Math.max(
            0,
            Number(task.estimatedEffort) -
            Number(task.completedEffort)
        )
    }


    function formatHours(hours) {
        const totalMinutes =
            Math.round(hours * 60)

        const wholeHours =
            Math.floor(totalMinutes / 60)

        const minutes =
            totalMinutes % 60

        if (wholeHours === 0) {
            return `${minutes}m`
        }

        if (minutes === 0) {
            return `${wholeHours}h`
        }

        return `${wholeHours}h ${minutes}m`
    }

    //Sets finish time and takes a variable hours which is the time needed to work today
    function getFinishTime(hours) {
        const finishTime = new Date()

        finishTime.setMinutes(
            finishTime.getMinutes() +
            Math.round(hours * 60)
        )

        return finishTime.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    }


    const today = getTodayString()

    //Filters through every task and checks which are relevant (not in the future, not waiting for sm, not completed)
    const todaysTasks = tasks.filter(task => {

        if (task.completed) {
            return false
        }

        const currentStage =
            getCurrentStage(task)

        if (
            currentStage &&
            currentStage.ownerType === "other"
        ) {
            return false
        }

        return task.deadline <= today
    })

    //Sums all remaining effort from each task
    const requiredWorkToday =
        todaysTasks.reduce(
            (total, task) =>
                total + getRemainingEffort(task),
            0
        )

    const totalWorkToday = requiredWorkToday+allocatedWorkToday

    //Finish time stored in a variable
    const estimatedFinish =
        getFinishTime(totalWorkToday)


    return (
        <div className="statistics-page">

            <div className="statistics-header">

                <Link
                    to="/tasks"
                    className="statistics-back"
                >
                    ← Back to Tasks
                </Link>

                <h1>Statistics</h1>

                <p>
                    Your workload and progress for today.
                </p>

            </div>


            <div className="statistics-summary">

                <div className="statistics-card">
                    <span className="statistics-label">
                        Work remaining today
                    </span>

                    <strong>
                        {formatHours(totalWorkToday)}
                    </strong>
                </div>


                <div className="statistics-card">
                    <span className="statistics-label">
                        Estimated finish
                    </span>

                    <strong>
                        {totalWorkToday > 0
                            ? estimatedFinish
                            : "Done for today"}
                    </strong>
                </div>

            </div>


            <div className="statistics-today">

                <h2>Today's workload</h2>

                <h3>Required</h3>

                {todaysTasks.length === 0 ? (
                    <p className="statistics-empty">
                        No required work remaining today.
                    </p>
                ) : (
                    todaysTasks.map(task => (
                        <div
                            className="statistics-task"
                            key={task.id}
                        >
                            <div>
                                <strong>
                                    {task.title}
                                </strong>

                                <span>
                        {task.deadline < today
                            ? `Overdue · ${task.deadline}`
                            : "Due today"}
                    </span>
                            </div>

                            <strong>
                                {formatHours(
                                    getRemainingEffort(task)
                                )}
                            </strong>
                        </div>
                    ))
                )}


                <h3 className="statistics-subheading">
                    Chosen for today
                </h3>

                {dailyAllocations.length === 0 ? (
                    <p className="statistics-empty">
                        No additional work planned today.
                    </p>
                ) : (
                    dailyAllocations.map(allocation => (
                        <div
                            className="statistics-task"
                            key={allocation.id}
                        >
                            <div>
                                <strong>
                                    {allocation.taskTitle}
                                </strong>

                                {allocation.stageTitle && (
                                    <span>
                            Stage: {allocation.stageTitle}
                        </span>
                                )}
                            </div>

                            <strong>
                                {formatHours(
                                    Number(allocation.allocatedEffort)
                                )}
                            </strong>
                        </div>
                    ))
                )}

            </div>

        </div>
    )
}

export default StatisticsPage