import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import AuthService from "../services/auth.service";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await AuthService.login(username, password).then(
        () => {
          navigate("/dashboard");
          window.location.reload();
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <section className="vh-100" style={{ backgroundColor: "#eee" }}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div className="card text-black" style={{ borderRadius: "25px" }}>
                <div className="card-body p-md-5">
                  <div className="row justify-content-center">
                    
                    {/* Login Form */}
                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                      <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                        Login
                      </p>

                      <form
                        className="mx-1 mx-md-4"
                        onSubmit={handleLogin}
                      >
                        {/* Username */}
                        <div className="d-flex flex-row align-items-center mb-4">
                          <div className="form-outline flex-fill mb-0">
                            <input
                              type="text"
                              className="form-control"
                              value={username}
                              onChange={(e) =>
                                setUsername(e.target.value)
                              }
                              required
                            />
                            <label className="form-label">
                              Username
                            </label>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="d-flex flex-row align-items-center mb-4">
                          <div className="form-outline flex-fill mb-0">
                            <input
                              type="password"
                              className="form-control"
                              value={password}
                              onChange={(e) =>
                                setPassword(e.target.value)
                              }
                              required
                            />
                            <label className="form-label">
                              Password
                            </label>
                          </div>
                        </div>

                        {/* Login Button */}
                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-2">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                          >
                            Login
                          </button>
                        </div>

                        {/* Register Section */}
                        <div className="text-center mt-3">
                          <p className="mb-1">
                            Don't have an account?
                          </p>
                          <Link
                            to="/signup"
                            className="btn btn-outline-secondary btn-sm"
                          >
                            Register
                          </Link>
                        </div>
                      </form>
                    </div>

                    {/* Image Section */}
                    <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                        className="img-fluid"
                        alt="Sample"
                      />
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

export default Login;
