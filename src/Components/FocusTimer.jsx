import { useState, useEffect, useRef } from 'react'
import { createPortal } from "react-dom"

function FocusTimer(props) {

    // your state here
    const [timerDuration,setTimerDuration] = useState(25)
    const [timeRemaining,setTimeRemaining] = useState(25*60)
    const [timerRunning,setTimerRunning] = useState(false)
    const [customMinutes,setCustomMinutes] = useState('')
    const [pipWindow, setPipWindow] = useState(null)
    const timerRef = useRef(null)

    //Constants for the timer animation
    const totalSeconds = timerDuration * 60

    const progress =
        totalSeconds > 0
            ? timeRemaining / totalSeconds
            : 0

    const radius = 63
    const circumference = 2 * Math.PI * radius

    const dashOffset =
        circumference * (1 - progress)

    const [position, setPosition] = useState({
        x: 0,
        y: 0
    }) //position of the timer wrt to its original starting position

    const dragStart = useRef(null)

    //  Function for PIP to work on the browser and across pages
    async function openPictureInPicture() {

        if (!("documentPictureInPicture" in window)) {
            alert("Picture-in-Picture is not supported in this browser.")
            return
        }

        if (window.documentPictureInPicture.window) {
            return
        }

        const newPipWindow =
            await window.documentPictureInPicture.requestWindow({
                width: 340,
                height: 500
            })

        newPipWindow.document.title = "Tempo Focus"

        copyStylesToPip(newPipWindow)

        newPipWindow.document.body.className = "pip-body"

        setPipWindow(newPipWindow)

        newPipWindow.addEventListener("pagehide", () => {
            setPipWindow(null)
        })
    }

    function copyStylesToPip(newPipWindow) {

        [...document.styleSheets].forEach((styleSheet) => {

            try {

                const cssRules =
                    [...styleSheet.cssRules]
                        .map((rule) => rule.cssText)
                        .join("")

                const style =
                    newPipWindow.document.createElement("style")

                style.textContent = cssRules

                newPipWindow.document.head.appendChild(style)

            }

            catch {

                if (styleSheet.href) {

                    const link =
                        newPipWindow.document.createElement("link")

                    link.rel = "stylesheet"
                    link.href = styleSheet.href

                    newPipWindow.document.head.appendChild(link)
                }
            }
        })
    }

    //Timer functions
    function onFinishSession(hoursWorked){

        setTimerRunning(false)

        if (hoursWorked > 0) {
            props.onLogWork(
                props.task.id,
                hoursWorked
            )
        } //In case timer is immediately skipped

    }

    useEffect(()=>{

        if(!timerRunning ||timeRemaining<=0){
            return
        }


        const timeout = setTimeout(()=>{
            if(timeRemaining === 1){
                setTimeRemaining(0)
                onFinishSession(timerDuration/60)
            }
            else{
                setTimeRemaining(timeRemaining-1)
            }
        },1000)

        return () => {
            clearInterval(timeout)
        } //Cleans up once effect is done

    },[timerRunning,timeRemaining,timerDuration])


    // your functions here
    function chooseTimer(time){

        const minutes = Number(time)

        setTimerDuration(minutes)
        setTimeRemaining(minutes*60)

    }

    function setCustomTimer(){

        const minutes = Number(customMinutes)

        if(minutes>0){
            chooseTimer(minutes)
            setCustomMinutes('')
        }

    }

    function onTimerStart(){
        setTimerRunning(true)
    }

    function formatTime() {

        const minutesLeft = Math.floor(timeRemaining/60)
        const secondsLeft = String(timeRemaining % 60).padStart(2,'0')

        return `${minutesLeft}:${secondsLeft}`

    }

    function pauseTimer() {
        setTimerRunning(false)
    }

    function resumeTimer() {
        setTimerRunning(true)
    }

    function skipTimer(){

        const elapsedHours = ((timerDuration*60)-timeRemaining)/3600

        onFinishSession(elapsedHours)

    }



    function startDrag(event) {
        const timerRect = timerRef.current.getBoundingClientRect()

        dragStart.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,

            startX: position.x,
            startY: position.y,

            left: timerRect.left,
            top: timerRect.top,
            right: timerRect.right,
            bottom: timerRect.bottom
        }

        event.currentTarget.setPointerCapture(event.pointerId)
    }


    function dragTimer(event) {
        if (!dragStart.current) {
            return
        }

        const changeX =
            event.clientX - dragStart.current.mouseX

        const changeY =
            event.clientY - dragStart.current.mouseY

        let newX =
            dragStart.current.startX + changeX

        let newY =
            dragStart.current.startY + changeY


        const newLeft =
            dragStart.current.left + changeX

        const newRight =
            dragStart.current.right + changeX

        const newTop =
            dragStart.current.top + changeY

        const newBottom =
            dragStart.current.bottom + changeY


        const margin = 10


        if (newLeft < margin) {
            newX += margin - newLeft
        }

        if (newRight > window.innerWidth - margin) {
            newX -=
                newRight - (window.innerWidth - margin)
        }

        if (newTop < margin) {
            newY += margin - newTop
        }

        if (newBottom > window.innerHeight - margin) {
            newY -=
                newBottom - (window.innerHeight - margin)
        }


        setPosition({
            x: newX,
            y: newY
        })
    }


    function stopDrag() {
        dragStart.current = null
    }

    const timerContent = (
        <div
            ref={timerRef}
            className="focus-timer"
            style={{
                transform: pipWindow
                    ? "none"
                    : `translate(${position.x}px, ${position.y}px)`
            }}
        >

            {/* TIMER HEADER */}

            <div
                className="focus-timer-header"
                onPointerDown={
                    pipWindow ? undefined : startDrag
                }
                onPointerMove={
                    pipWindow ? undefined : dragTimer
                }
                onPointerUp={
                    pipWindow ? undefined : stopDrag
                }
            >
            <span className="focus-drag-icon">
                ⋮⋮
            </span>

                <span className="focus-task-title">
                {props.task.title}
            </span>

                <button
                    className="pip-button"
                    type="button"
                    onPointerDown={(event) =>
                        event.stopPropagation()
                    }
                    onClick={openPictureInPicture}
                >
                    ↗
                </button>

                <button
                    className="focus-close-button"
                    type="button"
                    onPointerDown={(event) =>
                        event.stopPropagation()
                    }
                    onClick={props.onClose}
                >
                    ×
                </button>

            </div>


            {/* TIMER RING */}

            <div
                className={
                    timerRunning
                        ? "focus-ring-wrapper timer-active"
                        : "focus-ring-wrapper"
                }
            >
                <svg
                    className="focus-ring"
                    viewBox="0 0 140 140"
                >
                    <circle
                        className="focus-ring-track"
                        cx="70"
                        cy="70"
                        r={radius}
                    />

                    <circle
                        className="focus-ring-progress"
                        cx="70"
                        cy="70"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>

                <div className="focus-ring-center">

                    <div className="focus-mode">
                        Focus session
                    </div>

                    <div className="focus-time">
                        {formatTime()}
                    </div>

                </div>
            </div>


            {/* TIMER DURATION */}

            {!timerRunning && (
                <select
                    className="focus-duration"
                    value={timerDuration}
                    onChange={(event) =>
                        chooseTimer(event.target.value)
                    }
                >
                    <option value={25}>
                        25 minutes
                    </option>

                    <option value={40}>
                        40 minutes
                    </option>

                    <option value={50}>
                        50 minutes
                    </option>

                    {![25, 40, 50].includes(timerDuration) && (
                        <option value={timerDuration}>
                            {timerDuration} minutes
                        </option>
                    )}

                </select>
            )}


            {/* CUSTOM DURATION */}

            {!timerRunning && (
                <div className="custom-timer">

                    <input
                        type="number"
                        min="1"
                        placeholder="Custom minutes"
                        value={customMinutes}
                        onChange={(event) =>
                            setCustomMinutes(event.target.value)
                        }
                    />

                    <button
                        type="button"
                        className="custom-timer-button"
                        onClick={setCustomTimer}
                    >
                        Set
                    </button>

                </div>
            )}


            {/* TIMER CONTROLS */}

            <div className="focus-controls">

                {!timerRunning && (
                    <button
                        className="timer-primary-button"
                        onClick={
                            timeRemaining === timerDuration * 60
                                ? onTimerStart
                                : resumeTimer
                        }
                    >
                        {timeRemaining === timerDuration * 60
                            ? "Start"
                            : "Resume"}
                    </button>
                )}

                {timerRunning && (
                    <button
                        className="timer-primary-button"
                        onClick={pauseTimer}
                    >
                        Pause
                    </button>
                )}

                <button
                    className="timer-secondary-button"
                    onClick={skipTimer}
                >
                <span className="skip-icon">
                    ⏭
                </span>

                    Skip
                </button>

            </div>

        </div>
    )


    if (pipWindow) {
        return createPortal(
            timerContent,
            pipWindow.document.body
        )
    }


    return timerContent
}

export default FocusTimer