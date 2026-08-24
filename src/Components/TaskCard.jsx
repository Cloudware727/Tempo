import { useState } from "react"

function TaskCard(props) {
    const stages = props.stages || []
    const remainingEffort = Math.max(0, Number(props.estimatedEffort) - Number(props.completedEffort))
    const estimateReached = Number(props.completedEffort) >= Number(props.estimatedEffort)

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [editDeadline, setEditDeadline] = useState("")
    const [editEstimatedEffort, setEditEstimatedEffort] = useState("")

    const [editingStageId, setEditingStageId] = useState(null)
    const [editStageTitle, setEditStageTitle] = useState("")
    const [editStageOwnerType, setEditStageOwnerType] = useState("me")
    const [editStageOwnerName, setEditStageOwnerName] = useState("")
    const [editStageFollowUpDate, setEditStageFollowUpDate] = useState("")

    const [addingStage, setAddingStage] = useState(false)
    const [newStageTitle, setNewStageTitle] = useState("")
    const [newStageOwnerType, setNewStageOwnerType] = useState("me")
    const [newStageOwnerName, setNewStageOwnerName] = useState("")
    const [newStageFollowUpDate, setNewStageFollowUpDate] = useState("")

    function startEditing() {
        setEditTitle(props.title)
        setEditDeadline(props.deadline)
        setEditEstimatedEffort(props.estimatedEffort)
        setIsEditing(true)
    }

    function startStageEditing(stage) {
        setEditingStageId(stage.id)
        setEditStageTitle(stage.title)
        setEditStageOwnerType(stage.ownerType)
        setEditStageOwnerName(stage.ownerName || "")
        setEditStageFollowUpDate(stage.followUpDate || "")
    }

    function buildStageDetails(title, ownerType, ownerName, followUpDate) {
        return {
            title,
            ownerType,
            ownerName: ownerType === "me" ? "Me" : ownerName,
            followUpDate: ownerType === "other" ? followUpDate : ""
        }
    }

    async function saveEdit() {
        await props.onEditTask(props.id, {
            title: editTitle,
            deadline: editDeadline,
            estimatedEffort: Number(editEstimatedEffort)
        })
        setIsEditing(false)
    }

    async function saveStageEdit(stageId) {
        await props.onEditStage(
            stageId,
            buildStageDetails(
                editStageTitle,
                editStageOwnerType,
                editStageOwnerName,
                editStageFollowUpDate
            )
        )
        setEditingStageId(null)
    }

    async function saveNewStage() {
        if (!newStageTitle.trim()) return

        await props.onAddStage(
            props.id,
            buildStageDetails(
                newStageTitle,
                newStageOwnerType,
                newStageOwnerName,
                newStageFollowUpDate
            )
        )

        setNewStageTitle("")
        setNewStageOwnerType("me")
        setNewStageOwnerName("")
        setNewStageFollowUpDate("")
        setAddingStage(false)
    }

    function formatHours(hours) {
        const totalMinutes = Math.max(0, Math.round(Number(hours) * 60))
        const wholeHours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        if (wholeHours === 0) return `${minutes}m`
        if (minutes === 0) return `${wholeHours}h`
        return `${wholeHours}h ${minutes}m`
    }

    return (
        <div className="task-card">
            <div className="task-card-top">
                <h2>{props.title}</h2>

                <div className="task-pills">
                    <span className="pill due-pill">Due {props.deadline}</span>
                    <span className="pill total-pill">{formatHours(props.estimatedEffort)} total</span>
                    <span className="pill done-pill">{formatHours(props.completedEffort)} done</span>
                    <span className="pill remaining-pill">{formatHours(remainingEffort)} remaining</span>
                </div>
            </div>

            {(stages.length > 0 || props.onAddStage) && (
                <div className="task-stages">
                    <h3>Stages</h3>

                    <div className="task-stage-list">
                        {stages.map((stage, index) =>
                            editingStageId === stage.id ? (
                                <div className="task-stage editing-stage" key={stage.id}>
                                    <div className="stage-edit-panel">
                                        <div className="stage-edit-main">
                                            <span className="task-card-stage-number">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={editStageTitle}
                                                onChange={event => setEditStageTitle(event.target.value)}
                                                placeholder="Stage title"
                                            />
                                        </div>

                                        <select
                                            value={editStageOwnerType}
                                            onChange={event => setEditStageOwnerType(event.target.value)}
                                        >
                                            <option value="me">Me</option>
                                            <option value="other">Someone else</option>
                                        </select>

                                        {editStageOwnerType === "other" && (
                                            <div className="stage-edit-other">
                                                <input
                                                    type="text"
                                                    value={editStageOwnerName}
                                                    onChange={event => setEditStageOwnerName(event.target.value)}
                                                    placeholder="Person's name"
                                                />
                                                <input
                                                    type="date"
                                                    value={editStageFollowUpDate}
                                                    onChange={event => setEditStageFollowUpDate(event.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="stage-edit-actions">
                                            <button
                                                type="button"
                                                className="stage-icon-button stage-save-icon"
                                                title="Save stage"
                                                onClick={() => saveStageEdit(stage.id)}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                className="stage-icon-button stage-cancel-icon"
                                                title="Cancel"
                                                onClick={() => setEditingStageId(null)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="task-stage" key={stage.id}>
                                    <input
                                        type="checkbox"
                                        checked={stage.completed}
                                        onChange={event =>
                                            props.onToggleStage(stage.id, event.target.checked)
                                        }
                                    />

                                    <span>{index + 1}. {stage.title}</span>


                                    <span className="stage-owner">
                                        {stage.ownerType === "other"
                                            ? stage.ownerName || "Someone else"
                                            : "Me"}
                                    </span>


                                    {props.onEditStage && props.onDeleteStage && (
                                        <div className="stage-management">
                                            <button
                                                type="button"
                                                className="stage-icon-button stage-edit-icon"
                                                title="Edit stage"
                                                onClick={() => startStageEditing(stage)}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    style={{
                                                        display: "inline-block",
                                                        transform: "scaleX(-1)"
                                                    }}
                                                >
                                                    ✎
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                className="stage-icon-button stage-delete-icon"
                                                title="Delete stage"
                                                onClick={() => props.onDeleteStage(stage.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>

                    {props.onAddStage && !addingStage && (
                        <button
                            type="button"
                            className="add-stage-button"
                            onClick={() => setAddingStage(true)}
                        >
                            + Add stage
                        </button>
                    )}

                    {props.onAddStage && addingStage && (
                        <div className="new-stage-editor">
                            <input
                                type="text"
                                value={newStageTitle}
                                onChange={event => setNewStageTitle(event.target.value)}
                                placeholder="Stage title"
                            />

                            <select
                                value={newStageOwnerType}
                                onChange={event => setNewStageOwnerType(event.target.value)}
                            >
                                <option value="me">Me</option>
                                <option value="other">Someone else</option>
                            </select>

                            {newStageOwnerType === "other" && (
                                <div className="stage-edit-other">
                                    <input
                                        type="text"
                                        value={newStageOwnerName}
                                        onChange={event => setNewStageOwnerName(event.target.value)}
                                        placeholder="Person's name"
                                    />
                                    <input
                                        type="date"
                                        value={newStageFollowUpDate}
                                        onChange={event => setNewStageFollowUpDate(event.target.value)}
                                    />
                                </div>
                            )}

                            <div className="stage-edit-actions">
                                <button
                                    type="button"
                                    className="stage-icon-button stage-save-icon"
                                    title="Add stage"
                                    onClick={saveNewStage}
                                >
                                    ✓
                                </button>
                                <button
                                    type="button"
                                    className="stage-icon-button stage-cancel-icon"
                                    title="Cancel"
                                    onClick={() => setAddingStage(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {estimateReached && !props.completed && props.onExtendEstimate && (
                <div className="estimate-warning">
                    <div className="estimate-warning-text">
                        <span className="estimate-warning-title">Estimate reached</span>
                        <span className="estimate-warning-subtitle">
                            Need more time? Extend your estimate.
                        </span>
                    </div>

                    <div className="estimate-extension-buttons">
                        <button type="button" onClick={() => props.onExtendEstimate(props.id, 15)}>+15m</button>
                        <button type="button" onClick={() => props.onExtendEstimate(props.id, 30)}>+30m</button>
                        <button type="button" onClick={() => props.onExtendEstimate(props.id, 60)}>+1h</button>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="task-edit-section">
                    <div className="task-edit-field">
                        <label>Title</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={event => setEditTitle(event.target.value)}
                        />
                    </div>

                    <div className="task-edit-field">
                        <label>Deadline</label>
                        <input
                            type="date"
                            value={editDeadline}
                            onChange={event => setEditDeadline(event.target.value)}
                        />
                    </div>

                    <div className="task-edit-field">
                        <label>Estimated effort</label>
                        <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={editEstimatedEffort}
                            onChange={event => setEditEstimatedEffort(event.target.value)}
                        />
                    </div>

                    <div className="task-edit-actions">
                        <button type="button" className="save-edit-button" onClick={saveEdit}>
                            Save
                        </button>
                        <button
                            type="button"
                            className="cancel-edit-button"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="task-card-bottom">
                {props.onStartFocus && (
                    <button
                        type="button"
                        onClick={() => props.onStartFocus({ id: props.id, title: props.title })}
                    >
                        Start focus
                    </button>
                )}

                {props.onEditTask && (
                    <button type="button" className="edit-task-button" onClick={startEditing}>
                        ✏️ Edit
                    </button>
                )}

                {props.onCompleteTask && (
                    <button
                        type="button"
                        className="complete-task-button"
                        onClick={() => props.onCompleteTask(props.id)}
                    >
                        ✓ Complete
                    </button>
                )}

                {props.onDeleteTask && (
                    <button
                        type="button"
                        className="delete-button"
                        onClick={() => props.onDeleteTask(props.id)}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}

export default TaskCard