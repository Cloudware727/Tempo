import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import tempoLogo from "../assets/tempo_icon.png"
import "../AuthPages.css"

function RegisterPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] =
        useState("")

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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

            navigate("/login")

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
                    <span>GET STARTED</span>

                    <h1>Create your account</h1>

                    <p>
                        Start planning your work around
                        the time you actually have.
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
                            placeholder="At least 8 characters"
                            minLength="8"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Confirm password</label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={event =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Repeat your password"
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
                            ? "Creating account..."
                            : "Create account"}
                    </button>

                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">
                        Log in
                    </Link>
                </p>

            </div>

        </div>
    )
}

export default RegisterPage