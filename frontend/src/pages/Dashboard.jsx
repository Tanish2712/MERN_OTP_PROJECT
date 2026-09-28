import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const getProfile = async () => {

            try {

                const response =
                    await api.get(
                        "/auth/profile"
                    );

                setUser(
                    response.data.data.user
                );

            } catch (error) {

                console.log(error);

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");

            } finally {

                setLoading(false);

            }

        };


        getProfile();

    }, [navigate]);


    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    };


    if (loading) {

        return <h2>Loading...</h2>;

    }


    return (

        <div className="register-container">

            <div className="register-card">

                <h1>Dashboard</h1>

                {user && (

                    <div>

                        <h3>
                            Welcome, {user.name}
                        </h3>

                        <p>
                            Email: {user.email}
                        </p>

                        <p>
                            Verified:{" "}
                            {user.isVerified
                                ? "Yes"
                                : "No"
                            }
                        </p>

                    </div>

                )}

                <button
                    onClick={() => navigate("/products")}
                    style={{ marginTop: "20px", marginBottom: "10px" }}
                >
                    Manage products
                </button>


                <button
                    onClick={handleLogout}
                    style={{ marginTop: "10px" }}
                >
                    Logout
                </button>

            </div>

        </div>

    );

}

export default Dashboard;