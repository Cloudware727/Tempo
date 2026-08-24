function WaitingCard(props) {
    const stage = props.currentStage
    const followUpStatus =
        getFollowUpStatus(props.currentStage.followUpDate)

    function getTodayString() {
        const today = new Date()

        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const day = String(today.getDate()).padStart(2, "0")

        return `${year}-${month}-${day}`
    }

    function getFollowUpStatus(date) {
        if (!date) {
            return null
        }

        const today = getTodayString()

        if (date < today) {
            return "overdue"
        }

        if (date === today) {
            return "today"
        }

        return "upcoming"
    }

    return (
        <div className="waiting-card">

            <h3>{props.title}</h3>

            <div className="waiting-for">
                <span className="waiting-label">
                    Waiting for
                </span>

                <span className="waiting-owner">
                    {stage.ownerName}
                </span>
            </div>

            {props.currentStage.followUpDate && (
                <div
                    className={`waiting-follow-up ${followUpStatus}`}
                >
                    {followUpStatus === "overdue" && (
                        <>
                            ⚠ Follow-up overdue ·{" "}
                            {props.currentStage.followUpDate}
                        </>
                    )}

                    {followUpStatus === "today" && (
                        <>
                            ⚠ Follow up today
                        </>
                    )}

                    {followUpStatus === "upcoming" && (
                        <>
                            Follow up ·{" "}
                            {props.currentStage.followUpDate}
                        </>
                    )}
                </div>
            )}

            <p className="waiting-stage-title">
                {stage.title}
            </p>

            <div className="waiting-card-bottom">

                <span className="waiting-due">
                    📅 Due {props.deadline}
                </span>

                <label className="waiting-complete">
                    <input
                        type="checkbox"
                        checked={stage.completed}
                        onChange={() =>
                            props.onToggleStage(
                                stage.id,
                                !stage.completed
                            )
                        }
                    />

                    Received / done
                </label>

            </div>

        </div>
    )
}

export default WaitingCard