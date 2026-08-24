import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import tempoLogo from "../assets/tempo_icon.png"
import "../AuthPages.css"

function LoginPage(props) {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            const response = await fetch(
                "http://localhost:3000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            props.onLogin(data)

            navigate("/tasks")

        } catch (error) {
            setError(error.message)

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">

            <Link to="/" className="auth-logo-link">
                <img
                    src={tempoLogo}
                    alt="Tempo"
                    className="auth-logo"
                />
            </Link>

            <div className="auth-card">

                <div className="auth-heading">
                    <span>WELCOME BACK</span>
                    <h1>Log in to Tempo</h1>
                    <p>
                        Pick up where you left off.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="auth-field">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={event =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={event =>
                                setPassword(event.target.value)
                            }
                            placeholder="Your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Log in"}
                    </button>

                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Sign up
                    </Link>
                </p>

            </div>

        </div>
    )
}

export default LoginPage