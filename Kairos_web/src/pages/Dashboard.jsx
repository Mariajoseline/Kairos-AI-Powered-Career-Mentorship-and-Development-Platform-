
import React from 'react';
import { Link } from 'react-router-dom';
import { Map, MessageCircle, LogOut, Menu } from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <aside className={`bg-white shadow-lg fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <span className="text-2xl font-bold text-gradient">Kairos</span>
          </div>
          
          <div className="flex items-center p-4 border-b border-gray-200">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center p-3 text-gray-700 rounded-lg bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3 text-kairos-600" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/roadmap"
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3 text-gray-400" />
              <span>My Roadmap</span>
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <MessageCircle className="h-5 w-5 mr-3 text-gray-400" />
              <span>AI Assistant</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button
              className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={() => {
                // Handle logout here
              }}
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-6">
          <button 
            className="lg:hidden mr-4 text-gray-600"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
              <p className="text-gray-600 mb-4">
                Ready to continue your career journey? Choose an option below to get started.
              </p>
            </div>

            {/* Main Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link to="/roadmap" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center h-16 w-16 bg-kairos-100 rounded-lg mb-4">
                    <Map className="h-8 w-8 text-kairos-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-kairos-600 transition-colors">
                    Personalized Roadmap
                  </h3>
                  <p className="text-gray-600">
                    View your customized career path based on your education, skills, and goals.
                  </p>
                </div>
              </Link>

              <Link to="/chatbot" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center h-16 w-16 bg-teal-100 rounded-lg mb-4">
                    <MessageCircle className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-600 transition-colors">
                    AI Chatbot
                  </h3>
                  <p className="text-gray-600">
                    Get real-time answers and guidance from our AI assistant about your career questions.
                  </p>
                </div>
              </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-lg">
                  <p className="text-gray-700">
                    <span className="font-medium">Profile Created</span> - Your profile information has been saved.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Today</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg">
                  <p className="text-gray-700">
                    <span className="font-medium">Initial Roadmap Generated</span> - Based on your profile details.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Today</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
