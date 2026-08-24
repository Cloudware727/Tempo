import { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "motion/react"

import tempoLogo from "../assets/tempo_icon.png"
import "../HomePage.css"

function StorySection({ eyebrow, title, text, reverse = false, children }) {
    const sectionRef = useRef(null)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 85%", "end 15%"]
    })

    const copyY = useTransform(scrollYProgress, [0, 0.45, 1], [65, 0, -20])
    const copyOpacity = useTransform(
        scrollYProgress,
        [0, 0.18, 0.75, 1],
        [0, 1, 1, 0.72]
    )

    return (
        <section
            ref={sectionRef}
            className={`home-story-section ${reverse ? "reverse" : ""}`}
        >
            <motion.div
                className="home-story-copy"
                style={{ y: copyY, opacity: copyOpacity }}
            >
                <span className="home-story-eyebrow">{eyebrow}</span>
                <h2>{title}</h2>
                <p>{text}</p>
            </motion.div>

            <div className="home-story-visual">
                {children(scrollYProgress)}
            </div>
        </section>
    )
}


function HeroPreview() {
    return (
        <motion.div
            className="home-hero-preview"
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
            <div className="hero-preview-glow" />

            <motion.div
                className="hero-task-card"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="hero-task-heading">
                    <div>
                        <span className="hero-card-label">TODAY</span>
                        <h3>Finish project report</h3>
                    </div>
                    <span className="hero-priority">High priority</span>
                </div>

                <div className="hero-task-pills">
                    <span>Due tomorrow</span>
                    <span>3h planned</span>
                    <span>1h 20m left</span>
                </div>

                <div className="hero-progress-heading">
                    <span>Progress</span>
                    <span>56%</span>
                </div>

                <div className="hero-progress-track">
                    <motion.div
                        className="hero-progress-fill"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 0.56 }}
                        transition={{ duration: 1.4, delay: 0.7, ease: "easeOut" }}
                    />
                </div>

                <button type="button" className="hero-focus-button">
                    Start focus
                </button>
            </motion.div>

            <motion.div
                className="hero-floating-timer"
                animate={{ y: [0, 8, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="hero-timer-ring">
                    <div>
                        <small>FOCUS</small>
                        <strong>24:18</strong>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="hero-floating-waiting"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
            >
                <small>WAITING</small>
                <strong>Approval</strong>
                <span>Follow up tomorrow</span>
            </motion.div>
        </motion.div>
    )
}


function PlanVisual({ progress }) {
    const cardY = useTransform(progress, [0, 0.48, 1], [95, 0, -35])
    const cardRotate = useTransform(progress, [0, 0.5, 1], [-4, 0, 1])
    const cardScale = useTransform(progress, [0, 0.45, 1], [0.92, 1, 0.98])
    const fillScale = useTransform(progress, [0.1, 0.75], [0.12, 0.72])
    const detailOpacity = useTransform(progress, [0.22, 0.48], [0, 1])
    const badgeX = useTransform(progress, [0.25, 0.65], [60, 0])

    return (
        <motion.div
            className="plan-visual-card"
            style={{ y: cardY, rotate: cardRotate, scale: cardScale }}
        >
            <div className="plan-visual-header">
                <div>
                    <span>TASK</span>
                    <h3>Prepare presentation</h3>
                </div>

                <motion.span
                    className="plan-priority-badge"
                    style={{ x: badgeX, opacity: detailOpacity }}
                >
                    Due soon
                </motion.span>
            </div>

            <div className="plan-stat-row">
                <div>
                    <small>Deadline</small>
                    <strong>Tuesday</strong>
                </div>
                <div>
                    <small>Estimated</small>
                    <strong>4h</strong>
                </div>
                <div>
                    <small>Remaining</small>
                    <strong>1h 45m</strong>
                </div>
            </div>

            <div className="plan-progress-label">
                <span>Work completed</span>
                <span>56%</span>
            </div>

            <div className="plan-progress-track">
                <motion.div
                    className="plan-progress-fill"
                    style={{ scaleX: fillScale }}
                />
            </div>

            <motion.div
                className="plan-suggestion"
                style={{ opacity: detailOpacity }}
            >
                <span className="plan-suggestion-dot" />
                <div>
                    <strong>Best time to continue</strong>
                    <p>Start a focused session before 17:30.</p>
                </div>
            </motion.div>
        </motion.div>
    )
}


function FocusVisual({ progress }) {
    const timerScale = useTransform(progress, [0, 0.45, 1], [0.82, 1, 0.94])
    const timerY = useTransform(progress, [0, 0.5, 1], [90, 0, -30])
    const windowX = useTransform(progress, [0.2, 0.65], [-90, 0])
    const windowOpacity = useTransform(progress, [0.15, 0.42], [0, 1])

    const circumference = 2 * Math.PI * 58
    const dashOffset = useTransform(
        progress,
        [0.1, 0.85],
        [circumference * 0.9, circumference * 0.22]
    )

    return (
        <motion.div
            className="focus-story-stage"
            style={{ scale: timerScale, y: timerY }}
        >
            <div className="focus-story-window">
                <div className="focus-story-window-top">
                    <span />
                    <span />
                    <span />
                </div>

                <div className="focus-story-content">
                    <svg
                        className="focus-story-ring"
                        viewBox="0 0 140 140"
                        aria-hidden="true"
                    >
                        <circle
                            className="focus-story-ring-background"
                            cx="70"
                            cy="70"
                            r="58"
                        />
                        <motion.circle
                            className="focus-story-ring-progress"
                            cx="70"
                            cy="70"
                            r="58"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset: dashOffset }}
                        />
                    </svg>

                    <div className="focus-story-time">
                        <span>FOCUS</span>
                        <strong>24:18</strong>
                        <small>Project report</small>
                    </div>
                </div>
            </div>

            <motion.div
                className="focus-pip-card"
                style={{ x: windowX, opacity: windowOpacity }}
            >
                <span>Picture-in-Picture</span>
                <strong>Keep your timer with you</strong>
            </motion.div>
        </motion.div>
    )
}


function WaitingVisual({ progress }) {
    const cardX = useTransform(progress, [0, 0.55, 1], [-95, 0, 35])
    const cardY = useTransform(progress, [0, 0.5, 1], [75, 0, -25])
    const ownerOpacity = useTransform(progress, [0.15, 0.4], [0, 1])
    const followOpacity = useTransform(progress, [0.42, 0.68], [0, 1])
    const followY = useTransform(progress, [0.42, 0.68], [30, 0])
    const lineScale = useTransform(progress, [0.25, 0.72], [0, 1])

    return (
        <div className="waiting-story-stage">
            <motion.div
                className="waiting-story-card"
                style={{ x: cardX, y: cardY }}
            >
                <span className="waiting-story-label">WAITING</span>
                <h3>Get report approved</h3>

                <motion.div
                    className="waiting-owner-row"
                    style={{ opacity: ownerOpacity }}
                >
                    <span>Waiting for</span>
                    <strong>Alex</strong>
                </motion.div>

                <div className="waiting-stage-pill">
                    Stage 2 · Review
                </div>
            </motion.div>

            <motion.div
                className="waiting-connector"
                style={{ scaleX: lineScale }}
            />

            <motion.div
                className="waiting-follow-card"
                style={{ opacity: followOpacity, y: followY }}
            >
                <span>FOLLOW-UP</span>
                <strong>Tomorrow · 09:00</strong>
                <p>Nothing slips through the cracks.</p>
            </motion.div>
        </div>
    )
}


function CalendarVisual({ progress }) {
    const calendarY = useTransform(progress, [0, 0.5, 1], [105, 0, -30])
    const calendarScale = useTransform(progress, [0, 0.45, 1], [0.9, 1, 0.97])
    const taskOpacity = useTransform(progress, [0.25, 0.5], [0, 1])
    const taskY = useTransform(progress, [0.25, 0.6], [18, 0])

    return (
        <motion.div
            className="calendar-story-card"
            style={{ y: calendarY, scale: calendarScale }}
        >
            <div className="calendar-story-header">
                <div>
                    <span>CALENDAR</span>
                    <h3>August 2026</h3>
                </div>
                <div className="calendar-story-arrows">‹ &nbsp; ›</div>
            </div>

            <div className="calendar-weekdays">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
            </div>

            <div className="calendar-grid">
                {Array.from({ length: 28 }, (_, index) => {
                    const day = index + 3
                    const hasPurpleTask = day === 11
                    const hasAmberTask = day === 18
                    const hasGreenTask = day === 27

                    return (
                        <div
                            className={`calendar-day ${day === 23 ? "today" : ""}`}
                            key={day}
                        >
                            <span>{day}</span>

                            {hasPurpleTask && (
                                <motion.div
                                    className="calendar-task-pill purple"
                                    style={{ opacity: taskOpacity, y: taskY }}
                                >
                                    Presentation
                                </motion.div>
                            )}

                            {hasAmberTask && (
                                <motion.div
                                    className="calendar-task-pill amber"
                                    style={{ opacity: taskOpacity, y: taskY }}
                                >
                                    Follow-up
                                </motion.div>
                            )}

                            {hasGreenTask && (
                                <motion.div
                                    className="calendar-task-pill green"
                                    style={{ opacity: taskOpacity, y: taskY }}
                                >
                                    Report due
                                </motion.div>
                            )}
                        </div>
                    )
                })}
            </div>
        </motion.div>
    )
}


function HomePage() {
    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header-inner">
                    <Link to="/" className="home-brand-link">
                        <img src={tempoLogo} alt="Tempo" className="home-logo" />
                    </Link>

                    <div className="home-auth-actions">
                        <Link to="/login" className="home-login">
                            Log in
                        </Link>
                        <Link to="/register" className="home-signup">
                            Sign up
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="home-hero">
                    <motion.div
                        className="home-hero-copy"
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <span className="home-eyebrow">
                            PLAN · FOCUS · FOLLOW THROUGH
                        </span>

                        <h1>
                            Your work,
                            <span>timed right.</span>
                        </h1>

                        <p className="home-hero-description">
                            Tempo turns deadlines, effort and follow-ups into a clear
                            picture of what deserves your attention next.
                        </p>

                        <div className="home-hero-actions">
                            <Link to="/register" className="home-primary-cta">
                                Start planning <span>→</span>
                            </Link>
                            <Link to="/tasks" className="home-secondary-cta">
                                Open Tempo
                            </Link>
                        </div>

                        <div className="home-mini-features">
                            <span>✓ Deadline planning</span>
                            <span>✓ Focus sessions</span>
                            <span>✓ Follow-up tracking</span>
                        </div>
                    </motion.div>

                    <HeroPreview />

                    <motion.div
                        className="home-scroll-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                    >
                        <span>Scroll to explore</span>
                        <div className="home-scroll-line" />
                    </motion.div>
                </section>

                <div className="home-story-shell">
                    <StorySection
                        eyebrow="01 · PLAN"
                        title="Know what needs your time before it becomes urgent."
                        text="Tempo keeps deadlines, estimated effort and work already completed together, so a task is more than a name on a to-do list."
                    >
                        {(progress) => <PlanVisual progress={progress} />}
                    </StorySection>

                    <StorySection
                        eyebrow="02 · FOCUS"
                        title="Turn the plan into focused work."
                        text="Start a work session directly from a task, keep the timer visible in Picture-in-Picture, and log the time you actually spent."
                        reverse
                    >
                        {(progress) => <FocusVisual progress={progress} />}
                    </StorySection>

                    <StorySection
                        eyebrow="03 · FOLLOW UP"
                        title="Waiting on someone is still part of the work."
                        text="Move a task into a waiting stage, remember who has it, and surface the follow-up exactly when you need it."
                    >
                        {(progress) => <WaitingVisual progress={progress} />}
                    </StorySection>

                    <StorySection
                        eyebrow="04 · SEE THE MONTH"
                        title="Deadlines make more sense when you can see them together."
                        text="The calendar gives you a wider view of upcoming work, completed tasks and the days where your workload starts to pile up."
                        reverse
                    >
                        {(progress) => <CalendarVisual progress={progress} />}
                    </StorySection>
                </div>

                <motion.section
                    className="home-final-cta"
                    initial={{ opacity: 0, y: 45 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                >
                    <div className="home-final-glow" />

                    <span>MAKE TIME VISIBLE</span>
                    <h2>Less guessing. More doing.</h2>
                    <p>
                        Plan what matters, focus on it, and keep track of everything
                        that is still moving around you.
                    </p>

                    <Link to="/register" className="home-final-button">
                        Create your Tempo account <span>→</span>
                    </Link>
                </motion.section>
            </main>

            <footer className="home-footer">
                <img src={tempoLogo} alt="Tempo" />
                <span>Plan your work around the time you actually have.</span>
            </footer>
        </div>
    )
}

export default HomePage