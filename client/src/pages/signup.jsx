import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/signup/",
        {
          username,
          email,
          password,
        }
      );

      console.log(res.data);
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.log(error);
      alert("Registration Failed!");
    }
  };

  return (
    <div className="Signup">
      <section className="vh-100" style={{ backgroundColor: "#eee" }}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div
                className="card text-black"
                style={{ borderRadius: "25px" }}
              >
                <div className="card-body p-md-5">
                  <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-6 col-xl-5">

                      <p className="text-center h1 fw-bold mb-5 mt-4">
                        Sign Up
                      </p>

                      <form
                        className="mx-1 mx-md-4"
                        onSubmit={handleSignup}
                      >
                        {/* Username */}
                        <div className="mb-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                              setUsername(e.target.value)
                            }
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                              setEmail(e.target.value)
                            }
                            required
                          />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            required
                          />
                        </div>

                        {/* Register Button */}
                        <div className="text-center mb-3">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                          >
                            Register
                          </button>
                        </div>

                        {/* Login Section */}
                        <div className="text-center">
                          <p className="mb-1">
                            Already have an account?
                          </p>
                          <Link
                            to="/login"
                            className="btn btn-outline-secondary btn-sm"
                          >
                            Login
                          </Link>
                        </div>
                      </form>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Signup;
