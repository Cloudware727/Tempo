import TasksPage from "./Components/TasksPage.jsx"
import TaskForm from "./Components/TaskForm.jsx"
import FocusTimer from "./Components/FocusTimer.jsx";
import CalendarView from "./Components/CalendarView.jsx"
import HomePage from "./Components/HomePage.jsx"
import LoginPage from "./Components/LoginPage.jsx"
import RegisterPage from "./Components/RegisterPage.jsx"
import WaitingCard from "./Components/WaitingCard";
import "./App.css";

import { useEffect, useState } from "react";
import {
    Routes,
    Route,
    Navigate,
    NavLink,
    useLocation
} from "react-router-dom"
import tempoLogo from "./assets/tempo_icon.png";

function ProtectedRoute({ user, authLoading, children }) {
    if (authLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}


function App() {
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [focusTask, setFocusTask] = useState(null);
    const [tasksLoaded, setTasksLoaded] = useState(false)
    const API_URL = import.meta.env.VITE_API_URL

    //To authenticate users
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    const location = useLocation()

    const showAppNavigation =
        location.pathname === "/tasks" ||
        location.pathname === "/calendar"

    useEffect(()=>{
        async function checkAuthentication(){
            try{
                const response = await fetch(
                    `${API_URL}/auth/me`,
                    {
                        credentials: "include"
                    }
                )

                if(!response.ok){
                    setUser(null)
                    return
                }

                //If response returns a user, save it in a state
                const loggedInUser = await response.json()

                setUser(loggedInUser)
            }

            catch (error) {
                console.error(error)
                setUser(null)

            }

            finally {
                setAuthLoading(false) // finished checking users authenticity
            }
        }
        checkAuthentication()

    },[API_URL])


    useEffect(() => {

        //If user is not logged in or has not been checked yet
        if (!user) {
            setTasks([])
            return
        }

        async function loadTasks() {
            const response = await fetch(
                `${API_URL}/tasks`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            setTasks(data);
            setTasksLoaded(true)
        }

        loadTasks();
    }, [user]);

    async function addTask(task) {
        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(task)
            }
        );

        const createdTask = await response.json();

        setTasks((tasks) => [
            ...tasks,
            createdTask
        ]);
    }

    async function logWork(id, hours) {
        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ hours })
            }
        );

        const updatedTask = await response.json();

        if (!response.ok) {
            throw new Error(updatedTask.error);
        }

        setTasks((tasks) =>
            tasks.map((task) => {
                if (task.id === updatedTask.id) {
                    return updatedTask;
                }

                return task;
            })
        );
    }

    async function toggleStage(stageId, completed) {
        const response = await fetch(
            `${API_URL}/stages/${stageId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({
                    completed: completed
                })
            }
        );

        const updatedStage = await response.json();

        if (!response.ok) {
            throw new Error(updatedStage.error);
        }

        setTasks((tasks) =>
            tasks.map((task) => {
                return {
                    ...task,
                    stages: task.stages.map((stage) => {
                        if (stage.id === updatedStage.id) {
                            return updatedStage;
                        }

                        return stage;
                    })
                };
            })
        );
    }

    async function editStage(stageId, updatedDetails) {
        const response = await fetch(
            `${API_URL}/stages/${stageId}/details`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(updatedDetails)
            }
        )

        const updatedStage = await response.json()

        if (!response.ok) {
            throw new Error(updatedStage.error)
        }

        setTasks(tasks =>
            tasks.map(task => {
                return {
                    ...task,
                    stages: task.stages.map(stage => {
                        if (stage.id === updatedStage.id) {
                            return updatedStage
                        }

                        return stage
                    })
                }
            })
        )
    }

    async function addStage(taskId, stageDetails) {
        const response = await fetch(
            `${API_URL}/tasks/${taskId}/stages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(stageDetails)
            }
        )

        const createdStage = await response.json()

        if (!response.ok) {
            throw new Error(createdStage.error)
        }

        setTasks(tasks =>
            tasks.map(task => {
                if (task.id === createdStage.taskId) {
                    return {
                        ...task,
                        stages: [
                            ...task.stages,
                            createdStage
                        ]
                    }
                }

                return task
            })
        )
    }

    async function deleteStage(stageId) {
        const response = await fetch(
            `${API_URL}/stages/${stageId}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        )

        const deletedStage = await response.json()

        if (!response.ok) {
            throw new Error(deletedStage.error)
        }

        setTasks(tasks =>
            tasks.map(task => {
                if (task.id === deletedStage.taskId) {
                    return {
                        ...task,
                        stages: task.stages.filter(
                            stage => stage.id !== deletedStage.id
                        )
                    }
                }

                return task
            })
        )
    }

    async function extendEstimatedTime(id,minutes){
        const response = await fetch(
            `${API_URL}/tasks/${id}/estimate`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    minutes: minutes
                })
            }
        );

        const updatedTask = await response.json()

        if (!response.ok) {
            throw new Error(updatedTask.error);
        }

        setTasks((tasks)=>
            tasks.map((task)=>{
                if(task.id === updatedTask.id){
                    return{...task, estimatedEffort:updatedTask.estimatedEffort}
                }
                return task
            }))
    }


    function startFocus(task) {
        setFocusTask(task);
    }

    async function deleteTask(id) {
        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            }
        );

        if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.error);
        }

        setTasks((tasks) =>
            tasks.filter((task) =>
                task.id !== id
            )
        );
    }

    async function completeTask(id) {
        const response = await fetch(
            `${API_URL}/tasks/${id}/complete`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            }
        );

        const updatedTask = await response.json()

        if (!response.ok) {
            throw new Error(updatedTask.error)
        }

        setTasks((tasks) =>
            tasks.map((task) => {
                if (task.id === updatedTask.id) {
                    return {
                        ...task,
                        completed: updatedTask.completed
                    };
                }

                return task
            })
        )
    }


    //async functions for tasks and calendar
    async function editTask(id, updatedDetails) {
        const response = await fetch(
            `${API_URL}/tasks/${id}/details`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(updatedDetails)
            }
        )

        const editedTask = await response.json()

        if (!response.ok) {
            throw new Error(editedTask.error)
        }

        setTasks((tasks) =>
            tasks.map((task) => {
                if (task.id === editedTask.id) {
                    return {
                        ...task,
                        title: editedTask.title,
                        deadline: editedTask.deadline,
                        estimatedEffort: editedTask.estimatedEffort
                    }
                }

                return task
            })
        )
    }

    async function logout() {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        })

        setUser(null)
        setTasks([])
        setFocusTask(null)
    }

    return (
        <div
            className={
                location.pathname === "/"
                    ? "app landing-app"
                    : "app"
            }
        >

            {/* =========================
            TOP BAR
           ========================= */}
            {showAppNavigation && (
                <div className="top-bar">

                    <div className="brand">
                        <img
                            src={tempoLogo}
                            alt="Tempo"
                            className="tempo-wordmark"
                        />
                    </div>

                    <div className="top-bar-actions">

                        <div className="view-switch">

                            <NavLink
                                to="/tasks"
                                className={({ isActive }) =>
                                    isActive
                                        ? "view-button active"
                                        : "view-button"
                                }
                            >
                                Tasks
                            </NavLink>

                            <NavLink
                                to="/calendar"
                                className={({ isActive }) =>
                                    isActive
                                        ? "view-button active"
                                        : "view-button"
                                }
                            >
                                Calendar
                            </NavLink>

                        </div>

                        <button
                            className="logout-button"
                            onClick={logout}
                        >
                            Logout
                        </button>

                        <button
                            className="add-task-toggle"
                            onClick={() =>
                                setShowTaskForm(!showTaskForm)
                            }
                        >
                            {showTaskForm
                                ? "× Close"
                                : "+ Add task"}
                        </button>

                    </div>

                </div>
            )}


            {/* =========================
            ADD TASK FORM
           ========================= */}
            {showAppNavigation && showTaskForm && (
                <div className="new-task-section">

                    <TaskForm
                        onAddTask={addTask}
                    />

                </div>
            )}


            {/* =========================
            ROUTES
           ========================= */}

            <Routes>


                {/* Redirect / to /tasks */}

                <Route
                    path="/"
                    element={<HomePage/>} // Default route
                />

                <Route
                    path="/login"
                    element={<LoginPage
                        onLogin={setUser}
                    />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />


                {/* =========================
                TASKS PAGE
               ========================= */}

                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute
                            user={user}
                            authLoading={authLoading}
                        >
                            <TasksPage
                                tasks={tasks}
                                onLogWork={logWork}
                                onDeleteTask={deleteTask}
                                onCompleteTask={completeTask}
                                onEditTask={editTask}
                                onToggleStage={toggleStage}
                                onStartFocus={startFocus}
                                onExtendEstimate={extendEstimatedTime}
                                onEditStage={editStage}
                                onAddStage={addStage}
                                onDeleteStage={deleteStage}
                            />
                        </ProtectedRoute>
                    }
                />

                {/* =========================
                CALENDAR PAGE
               ========================= */}

                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute
                            user={user}
                            authLoading={authLoading}
                        >
                            <div className="calendar-page">
                                {!tasksLoaded && (
                                    <p>Loading calendar...</p>
                                )}

                                {tasksLoaded && (
                                    <CalendarView tasks={tasks} />
                                )}
                            </div>
                        </ProtectedRoute>
                    }
                />

            </Routes>


            {/* =========================
            GLOBAL FOCUS TIMER
           ========================= */}

            {focusTask && (
                <FocusTimer
                    task={focusTask}
                    onLogWork={logWork}
                    onClose={() =>
                        setFocusTask(null)
                    }
                />
            )}

        </div>
    );
}

export default App;
