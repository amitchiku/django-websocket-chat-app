import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import AuthGuard from "../services/AuthGuard";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const storedData = localStorage.getItem("user");
  const userData = storedData ? JSON.parse(storedData) : null;
  const accessToken = userData?.access;
  const userEmail = userData?.email;

  const [users, setUsers] = useState([]);
  const [interest, setInterest] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/users/",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchInterest = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/recieved-interest/",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setInterest(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
    fetchInterest();
  }, [accessToken]);

  async function sendRequest(userId) {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/send-interest/",
        { receiver: userId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function rejectUser(id) {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/reject-interest/",
        { user_id: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function acceptUser(id) {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/accept-interest/",
        { user_id: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container">
      <div className="row">

        {/* Interest Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-primary mb-3"
                onClick={() => navigate("/chat")}
              >
                Inbox
              </button>

              <h5>Your Interest Requests {userEmail}</h5>

              <table className="table">
                <tbody>
                  {interest.map((item, index) => {
                    const isSender = item.sender.email === userEmail;
                    const user = isSender ? item.receiver : item.sender;

                    return (
                      <tr key={`${item.id}-${index}`}>
                        <td>
                          {user.username} ({user.email})
                        </td>
                        <td className="text-end">
                          {item.status === "pending" && !isSender && (
                            <>
                              <button
                                onClick={() => acceptUser(user.id)}
                                className="btn btn-success btn-sm me-2"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => rejectUser(user.id)}
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.status !== "pending" && item.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>All Users</h5>

              <table className="table">
                <tbody>
                  {users
                    .filter((user) => user.email !== userEmail)
                    .map((user, index) => (
                      <tr key={`${user.id}-${index}`}>
                        <td>
                          {user.username} ({user.email})
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => sendRequest(user.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Send Request
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthGuard(Dashboard);
