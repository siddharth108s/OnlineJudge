import {useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
export default function Submissions() {
  const {probId} = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'descending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    axios.get(`${backendUrl}/stats/submissions`).then((res)=>{
        console.log(res.data);
      setSubmissions(res.data);
    }).catch((err)=>{
      setError(err.response.data.message);
    }).finally(()=>{
      setLoading(false);
    });
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
        direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const sortedSubmissions = useMemo(() => {
    let sortableItems = [...submissions];
    if (probId) {
        sortableItems = sortableItems.filter((submission)=>submission.probId === probId);
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [submissions, sortConfig, probId]);

//   sample submission
// const submission={
//     problemId:probId,
//     userId,
//     code, language,
//     datetime: new Date(),
//     compilationSuccess,
//     verdict: verdict,
//     totalTime: totalTime,
//   }
function handleViewVerdict(verdict){
    // show a modal with the verdict
    alert(verdict);
}
function handleViewCode(code, language){
    setSelectedCode(code);
    const lang = language.toLowerCase();
    if (lang.includes("c++") || lang.includes("cpp")) {
        setSelectedLanguage("cpp");
    } else if (lang.includes("python") || lang.includes("py")) {
        setSelectedLanguage("python");
    } else if (lang.includes("java")) {
        setSelectedLanguage("java");
    } else if (lang.includes("javascript") || lang.includes("js")) {
        setSelectedLanguage("javascript");
    } else {
        setSelectedLanguage("plaintext");
    }
    setIsModalOpen(true);
}
function handleCloseModal() {
    setIsModalOpen(false);
}
  return (
    <div>
        <div className='flex gap-2 items-center p-4'>
            <h1 className='text-2xl font-bold mx-1'>My Submissions</h1>
            <button className='align-self-center my-1 px-2 py-1 bg-blue-500 text-white rounded-lg' onClick={()=>{
                setLoading(true);
                axios.get(`${backendUrl}/stats/submissions`).then((res)=>{
                    setSubmissions(res.data);
                }).catch((err)=>{
                    setError(err.response.data.message);
                }).finally(()=>{
                    setLoading(false);
                });
            }}>Refresh</button>
        </div>
        <table className=''>
            <thead className='text-left'>
                <tr className='border-b border-gray-300 text-center'>
                    <th className='px-3 py-1 cursor-pointer hover:bg-gray-100' onClick={() => requestSort('probId')}>
                        🔢 Problem{sortConfig.key === 'probId' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                    </th>
                    <th className='px-3 py-1 cursor-pointer hover:bg-gray-100' onClick={() => requestSort('datetime')}>
                        ⌚ Datetime {sortConfig.key === 'datetime' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                    </th>
                    <th className='px-3 py-1 w-40'>✅ Execution Success</th>
                    <th className='px-3 py-1 w-30 cursor-pointer hover:bg-gray-100' onClick={() => requestSort('totalTime')}>
                        ⌛Total Time (ms) {sortConfig.key === 'totalTime' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                    </th>
                    <th className='px-3 py-1'>💻 Code</th>
                    <th className='px-3 py-1'>🔤 Language</th>
                    {/* <th>Verdict</th> */}
                </tr>
            </thead>
            {loading ? (
                <tbody className='text-left'>
                    <tr>
                        <td colSpan={6} className='px-1 py-1'>Loading...</td>
                    </tr>
                </tbody>
            ) : error ? (
                <tbody className='text-left'>
                    <tr>
                        <td colSpan={6} className='px-1 py-1'>{error}</td>
                    </tr>
                </tbody>
            ) : submissions.length === 0 ? (
                <tbody className='text-left'>
                    <tr>
                        <td colSpan={6} className='px-1 py-1'>No submissions found</td>
                    </tr>
                </tbody>
            ) : (
            <tbody className='text-left'>
                {sortedSubmissions.map((submission)=>(
                    <tr key={submission._id} className='py-1'>
                        {/* navigate to problem on clicking id */}
                        <td className='px-3'><Link to={`/problem/${submission.probId}`} className='text-blue-500 hover:text-blue-700'>{submission.probId}. {submission.title.length > 20 ? submission.title.slice(0, 20) + "..." : submission.title}</Link></td>
                        <td className='px-3'>{new Date(submission.datetime).toLocaleString()}</td>
                        <td className='px-3 text-center'>{submission.compilationSuccess ? <span className='px-2 py-1 bg-green-200 rounded-lg'>Yes</span> : <span className='px-2 py-1 bg-red-200 rounded-lg'>No</span>}</td>
                        {/* 1234.2332321 ms -> 1234 ms */}
                        <td className='px-3'>{submission.totalTime ? submission.totalTime.toFixed(0) : "N/A"}</td>
                        {/* <td><button onClick={()=>handleViewVerdict(submission.verdict)}>View Verdict</button></td> */}
                        {/* button to view code in a modal */}
                        <td className='px-3 text-center'><button className='px-1 py-1 my-1 bg-blue-500 text-white rounded-lg' onClick={()=>handleViewCode(submission.code, submission.language)}>View Code</button></td>
                        <td className='px-3 text-center'><span className='px-2 py-1 bg-gray-100  rounded-lg'>{submission.language}</span></td>
                    </tr>
                    ))}
                </tbody>
            )}
        </table>
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Submitted Code</h2>
                        <button onClick={handleCloseModal} className="text-black text-2xl font-bold">&times;</button>
                    </div>
                    <div className="flex-grow border rounded-lg overflow-hidden">
                        <Editor
                            height="100%"
                            language={selectedLanguage}
                            value={selectedCode}
                            theme="vs-dark"
                            options={{ readOnly: true, minimap: { enabled: false } }}
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}
