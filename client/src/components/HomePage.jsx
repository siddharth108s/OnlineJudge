// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios  from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

axios.defaults.withCredentials = true;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [titleSearch, setTitleSearch] = useState("");

  const [userStats, setUserStats] = useState({});
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  const [userStatsError, setUserStatsError] = useState(null);
  useEffect(()=>{
    axios.get(`${backendUrl}/stats/dashboard-stats`).then((res)=>{
      setUserStats(res.data);
      console.log(res.data);
    }).catch((err)=>{
      console.log(err);
      setUserStatsError(err.response.data.message);
    }).finally(()=>{
      setUserStatsLoading(false);
    });
  },[]);


  useEffect(() => {
    fetchProblems();
  }, []);


  const fetchProblems = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(`${backendUrl}/problems`);
      if (response.status === 200) {
        setProblems(response.data || []);
      } else {
        setError("Failed to fetch problems");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const sortedProblems = React.useMemo(() => {
    let sortableProblems = [...problems];
    if (sortConfig !== null) {
      sortableProblems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // For difficulty, sort by Easy < Medium < Hard
        if (sortConfig.key === "difficulty") {
          const order = { Easy: 1, Medium: 2, Hard: 3 };
          aValue = order[aValue] || 99;
          bValue = order[bValue] || 99;
        }
        // For id, sort numerically
        if (sortConfig.key === "id") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableProblems;
  }, [problems, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => {
    if (sortConfig.key !== key) return <span className="ml-1 text-gray-400">↕</span>;
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-gray-600">▲</span>
    ) : (
      <span className="ml-1 text-gray-600">▼</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-lg font-semibold">Loading problems...</span>
      </div>
    );
  }

  function UserStats(){
    return (
      <div className="flex gap-2 p-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold">User Stats</h3>
        {userStatsLoading ? (
          <span>Loading...</span>
        ) : userStatsError ? (
          <span>{userStatsError}</span>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Total Submissions: {userStats.totalSubmissions}</span>
            <span className="font-semibold">Execution Accuracy: {userStats.compilationAccuracy ? userStats.compilationAccuracy.toFixed(2)*100 : 0}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 h-fit">
        <button onClick={()=> navigate("/submissions")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          My Submissions
        </button>
      </div>


      </div>
    )
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-3 sm:py-1">
      <UserStats/>
      <div className="px-4 mx-auto max-w-4xl lg:px-12">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
          <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
            <div className="flex items-center flex-1 space-x-4">
              {/* <h5>
                <span className="text-gray-500">Total Problems:</span>
                <span className="dark:text-white ml-1">{problems.length}</span>
              </h5> */}
              {/* You can add more stats here if you want */}
              {/* difficulty filter */}
              <div className="flex items-center space-x-2 flex-wrap">
                {/* enable toggle for all */}
                <button onClick={()=>setDifficultyFilter("all")} className={`px-4 py-2 rounded ${difficultyFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>All<span className="text-xs ml-1">({problems.length})</span></button>
                <button onClick={()=>setDifficultyFilter("Easy")} className={`px-4 py-2 rounded ${difficultyFilter === "Easy" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>Easy<span className="text-xs ml-1">({problems.filter(problem => problem.difficulty === "Easy").length})</span></button>
                <button onClick={()=>setDifficultyFilter("Medium")} className={`px-4 py-2 rounded ${difficultyFilter === "Medium" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}>Medium<span className="text-xs ml-1">({problems.filter(problem => problem.difficulty === "Medium").length})</span></button>
                <button onClick={()=>setDifficultyFilter("Hard")} className={`px-4 py-2 rounded ${difficultyFilter === "Hard" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}>Hard<span className="text-xs ml-1">({problems.filter(problem => problem.difficulty === "Hard").length})</span></button>
                {/* title text search */}
                <input type="text" placeholder="Search by title" className="px-4 py-2 rounded bg-gray-200 text-gray-700" value={titleSearch} onChange={(e)=>setTitleSearch(e.target.value)}/>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={fetchProblems}
                  disabled={isRefreshing}
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
            {/* <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3"> */}
              {/* <button
                type="button"
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Add Problem
              </button>
              <button
                type="button"
                className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Export
              </button> */}
            {/* </div> */}
          </div>
          <div className="overflow-x-auto">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
            )}
            {problems.length === 0 ? (
              <div className="text-gray-500 px-4 py-4">No problems available at the moment.</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 cursor-pointer select-none"
                      onClick={() => requestSort("id")}
                    >
                      ID {getArrow("id")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 cursor-pointer select-none"
                      onClick={() => requestSort("title")}
                    >
                      Title {getArrow("title")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 cursor-pointer select-none"
                      onClick={() => requestSort("difficulty")}
                    >
                      Difficulty {getArrow("difficulty")}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Action
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Submissions
                    </th>

                  </tr>
                </thead>
                <tbody>
                  {sortedProblems.filter((problem)=>difficultyFilter === "all" || problem.difficulty === difficultyFilter).filter((problem)=>problem.title.toLowerCase().includes(titleSearch.toLowerCase())).map((problem) => (
                    <tr
                      key={problem.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {problem.id}
                      </td>
                      <td className="px-4 py-2">{problem.title}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            problem.difficulty === "Easy"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : problem.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/problem/${problem.id}`}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          Solve
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/submissions/${problem.id}`}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          Submissions
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );





  // return (
  //   // <div className="max-w-4xl mx-auto py-8 px-4">
  //   //   <div>
  //   //     <h2 className="text-2xl font-semibold mb-4">Problems</h2>
  //   //     {error && (
  //   //       <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
  //   //     )}
  //   //     {problems.length === 0 ? (
  //   //       <div className="text-gray-500">No problems available at the moment.</div>
  //   //     ) : (
  //   //       <div className="grid gap-4 md:grid-cols-2">
  //   //         {problems.map((problem) => (
  //   //           <div
  //   //             key={problem.id}
  //   //             className="bg-white rounded-lg shadow p-4 border border-gray-200"
  //   //           >
  //   //             <div className="flex flex-row items-center justify-between">
  //   //               <h3 className="text-lg font-semibold">{`${problem.id}. ${problem.title}`}</h3>
  //   //               <p className="text-sm text-gray-500 mb-2">{problem.difficulty}</p>
  //   //             </div>
  //   //             {/* open Problem component on clicking corresponding solve button for the problem using react router */}
  //   //             <Link 
  //   //               to={`/problem/${problem.id}`}
  //   //               className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //   //             >
  //   //               Solve
  //   //             </Link>
  //   //           </div>
  //   //         ))}
  //   //       </div>
  //   //     )}
  //   //   </div>
  //   <div className="max-w-4xl mx-auto py-8 px-4">
  //   <div>
  //     <h2 className="text-2xl font-semibold mb-4">Problems</h2>
  //     {error && (
  //       <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
  //     )}
  //     {problems.length === 0 ? (
  //       <div className="text-gray-500">No problems available at the moment.</div>
  //     ) : (
  //       <div className="overflow-x-auto">
  //         <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
  //           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
  //             <tr>
  //               <th scope="col" className="px-6 py-3">ID</th>
  //               <th scope="col" className="px-6 py-3">Title</th>
  //               <th scope="col" className="px-6 py-3">Difficulty</th>
  //               <th scope="col" className="px-6 py-3">Action</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {problems.map((problem) => (
  //               <tr key={problem.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
  //                 <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
  //                   {problem.id}
  //                 </td>
  //                 <td className="px-6 py-4">{problem.title}</td>
  //                 <td className="px-6 py-4">{problem.difficulty}</td>
  //                 <td className="px-6 py-4">
  //                   <Link
  //                     to={`/problem/${problem.id}`}
  //                     className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
  //                   >
  //                     Solve
  //                   </Link>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     )}
  //   </div>
  //     {/* quick actions */}
  //     <div className="mt-10">
  //       <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
  //       <div className="flex gap-4">
  //         <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
  //           My Submissions
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default HomePage;