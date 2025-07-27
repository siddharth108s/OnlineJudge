// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "axios";
import HomePage from "./components/HomePage";
import Submissions from "./components/Submissions";
import Login from "./components/Login";
import Register from "./components/Register";
import Problem from "./components/Problem";
import LandingPage from "./components/LandingPage";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
const cookies = new Cookies();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkAuth = async () => {
    try {
      const res = await axios.get(`${backendUrl}/user/me`);
      const data = res.data;
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  
  useEffect(() => {
    checkAuth();
  }, []);
  // useEffect(() => {
  //   const token = cookies.get("token");
  //   if (token) {
  //     try {
  //       const payload = JSON.parse(atob(token.split(".")[1]));
  //       setUser({
  //         id: payload.id,
  //         email: payload.email,
  //         name: payload.name,
  //       });
  //       setIsAuthenticated(true);
  //     } catch (error) {
  //       cookies.remove("token");
  //       setIsAuthenticated(false);
  //       setUser(null);
  //     }
  //   }
  //   setLoading(false);
  // }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);setUser(userData);
  };
  const handleLogout = () => {
    cookies.remove("token");
    setIsAuthenticated(false);setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isAuthenticated && <NavbarComponent user={user} handleLogout={handleLogout} />}
        <Routes>
          <Route path="/"
            element={
              isAuthenticated ? (
                <HomePage user={user} />
              ) : (
                // <Navigate to="/login" replace />
                <LandingPage />
              )
            }
          />
          <Route path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            }
          />
          <Route path="/submissions"
            element={
              isAuthenticated ? (
                <Submissions />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/submissions/:probId"
            element={
              isAuthenticated ? (
                <Submissions />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/problem/:problemId"
            element={
              isAuthenticated ? (
                <Problem />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function NavbarComponent(props){
  const user=props.user;
  const handleLogout=props.handleLogout;
  return(
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between mx-auto py-2 px-4">
        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
          {/* link to home page */}
          <Link to="/">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="ByteJudge" className="h-8" />
              <span className="text-2xl font-semibold whitespace-nowrap dark:text-white">ByteJudge</span>
            </div>
          </Link>
        </span>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-gray-700 dark:text-gray-200">{`Hi, ${user?.name}`}</span>
            <span className="text-gray-700 dark:text-gray-200">{`${user?.email}`}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none hover:cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

// import { useState, useEffect, Fragment } from "react";
// import "./App.css";
// import NavbarComponent from "./components/NavbarComponent";
// import HeadingComponent from "./components/HeroComponent/HeadingComponent";
// function App() {
  
//   return (
//     <div className="dark:bg-gray-800 w-screen h-screen">
//       <NavbarComponent />
//       <HeadingComponent />
//       <ProblemList />
//       {/* problem list */}
//     </div>
//   );
// }
// function ProblemList() {
//   const problems = [
//     {
//       title: "Problem 1",
//       statement: "This is the statement for Problem 1.",
//       constraints: "Constraints for Problem 1.",
//     },
//     {
//       title: "Problem 2",
//       statement: "This is the statement for Problem 2.",
//       constraints: "Constraints for Problem 2.",
//     },
//   ];
//   return (
//     <>
//       <table>
//         <th>
//           <td>Title</td>
//         </th>
//         {problems.map((element, index) => {
//           return <tr><ProblemListItem problem={element}/></tr>;
//         })}
//       </table>
//     </>
//   );
// }
// function ProblemListItem(props) {
//   const problem=props.problem
//   return(
//     <>
//       <td>{problem.title}</td>
//     </>
//   )
// }
// export default App;
