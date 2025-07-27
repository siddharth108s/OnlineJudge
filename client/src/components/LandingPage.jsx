import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalUsers: 0,
    totalProblems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${backendUrl}/stats/website-stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching website stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <LandingPageNavbar />
      <main>
        <HeroSection />
        <StatsSection stats={stats} loading={loading} />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

const LandingPageNavbar = () => (
  <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="ByteJudge" className="h-8 w-auto" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              ByteJudge
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="bg-white dark:bg-gray-800">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
        Welcome to ByteJudge
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
        The ultimate platform for honing your coding skills, preparing for
        interviews, and competing with fellow programmers.
      </p>
      <div className="mt-8">
        <Link
          to="/register"
          className="inline-block px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </div>
  </section>
);

const StatsSection = ({ stats, loading }) => (
  <section className="py-12 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-500">
            {loading ? "..." : stats.totalUsers}
          </p>
          <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
            Total Users
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-500">
            {loading ? "..." : stats.totalProblems}
          </p>
          <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
            Total Problems
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-500">
            {loading ? "..." : stats.totalSubmissions}
          </p>
          <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
            Total Submissions
          </p>
        </div>
      </div>
    </div>
  </section>
);

const features = [
  {
    name: "Vast Problem Library",
    description: "Access a wide range of problems with varying difficulty levels to challenge yourself.",
  },
  {
    name: "Real-time Judging",
    description: "Get instant feedback on your submissions with our fast and reliable code judge.",
  },
  {
    name: "Detailed Submission History",
    description: "Track your progress, review past submissions, and learn from your mistakes.",
  },
   {
    name: "AI Integration",
    description: "Remove Comments and Reformat your code.",
  },
];

const FeaturesSection = () => (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Features
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Everything you need to boost your programming skills.
          </p>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.name} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

const Footer = () => (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} ByteJudge. All rights reserved.
        </p>
      </div>
    </footer>
  );

export default LandingPage;
