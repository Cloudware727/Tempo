import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import themePlugin from "@fullcalendar/react/themes/classic"

import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/classic/theme.css"
import "@fullcalendar/react/themes/classic/palette.css"


function CalendarView(props) {

    function getTaskStatus(task) {
        if (task.completed) {
            return "completed"
        }

        const currentStage = task.stages?.find(
            stage => stage.completed === false
        )

        if (
            currentStage &&
            currentStage.ownerType === "other"
        ) {
            return "waiting"
        }

        const today = new Date()

        const year = today.getFullYear()
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0")

        const day = String(
            today.getDate()
        ).padStart(2, "0")

        const todayString =
            `${year}-${month}-${day}`

        if (task.deadline < todayString) {
            return "overdue"
        }

        return "active"
    }


    function getTaskColors(status) {

        if (status === "completed") {
            return {
                color: "#c2f3c0",
                contrastColor: "#247a2a"
            }
        }

        if (status === "waiting") {
            return {
                color: "#f8dca8",
                contrastColor: "#704a16"
            }
        }

        if (status === "overdue") {
            return {
                color: "#ffe4e7",
                contrastColor: "#c44050"
            }
        }

        return {
            color: "#eee9ff",
            contrastColor: "#5d43b5"
        }
    }


    function formatHours(hours) {
        const totalMinutes =
            Math.round(Number(hours) * 60)

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


    const events = props.tasks.map((task) => {

        const remainingEffort = Math.max(
            0,
            Number(task.estimatedEffort) -
            Number(task.completedEffort)
        )

        const status = getTaskStatus(task)

        const colors =
            getTaskColors(status)

        return {
            id: String(task.id),

            title: task.title,

            date: task.deadline,

            color: colors.color,

            contrastColor:
            colors.contrastColor,

            extendedProps: {
                remainingEffort,
                completed: task.completed,
                status
            }
        }
    })


    return (
        <div className="calendar-view">

            <FullCalendar
                plugins={[
                    themePlugin,
                    dayGridPlugin
                ]}

                initialView="dayGridMonth"

                events={events}

                height="calc(100vh - 190px)"

                eventContent={(info) => (
                    <div className="calendar-task-event">

                        <strong>
                            {info.event.title}
                        </strong>

                        <span>
                            {
                                info.event.extendedProps.completed
                                    ? "Completed"
                                    : `${formatHours(
                                        info.event.extendedProps
                                            .remainingEffort
                                    )} left`
                            }
                        </span>

                    </div>
                )}
            />

        </div>
    )
}

export default CalendarView