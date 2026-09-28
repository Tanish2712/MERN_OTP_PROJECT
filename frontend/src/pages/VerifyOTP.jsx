import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function VerifyOTP() {

    const navigate = useNavigate();

    const [email] = useState(
        () => sessionStorage.getItem(
            "verificationEmail"
        ) || ""
    );
    const [otp, setOtp] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);


    useEffect(() => {

        if (!email) {
            navigate("/register");
        }

    }, [email, navigate]);


    const handleVerify = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/verify-otp",
                {
                    email,
                    otp
                }
            );

            setMessage(
                response.data.message
            );

            sessionStorage.removeItem(
                "verificationEmail"
            );

            // For now go back to register.
            // Login will be added in Part 3.
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            if (error.response) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    "Unable to connect to server"
                );
            }

        } finally {

            setLoading(false);
        }
    };


    const handleResend = async () => {

        setMessage("");
        setError("");
        setResending(true);

        try {

            const response = await api.post(
                "/auth/send-otp",
                {
                    email
                }
            );

            setMessage(
                response.data.message
            );

        } catch (error) {

            if (error.response) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    "Unable to connect to server"
                );
            }

        } finally {

            setResending(false);
        }
    };


    return (

        <div className="register-container">

            <div className="register-card">

                <h1>Verify Email</h1>

                <p className="subtitle">
                    Enter the OTP sent to
                </p>

                <p className="otp-email">
                    {email}
                </p>


                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleVerify}>

                    <div className="form-group">

                        <label>OTP</label>

                        <input
                            type="text"
                            value={otp}
                            onChange={(event) =>
                                setOtp(event.target.value)
                            }
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify OTP"
                        }
                    </button>

                </form>


                <button
                    className="resend-button"
                    onClick={handleResend}
                    disabled={resending}
                >
                    {resending
                        ? "Sending..."
                        : "Resend OTP"
                    }
                </button>

            </div>

        </div>
    );
}

export default VerifyOTP;