import { Link } from "react-router-dom"

function StatisticsPage({ tasks }) {

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
    const totalWorkToday =
        todaysTasks.reduce(
            (total, task) =>
                total + getRemainingEffort(task),
            0
        )

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

                {todaysTasks.length === 0 ? (
                    <p className="statistics-empty">
                        No work remaining for today.
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
                                        : `Due today`}
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

            </div>

        </div>
    )
}

export default StatisticsPage