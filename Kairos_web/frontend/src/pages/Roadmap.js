
import React from 'react';
import { Link } from 'react-router-dom';
import { Map, MessageCircle, LogOut, Menu, CheckCircle, Circle, Award, ExternalLink } from 'lucide-react';

const Roadmap = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const roadmapSteps = [
    {
      title: 'Foundations',
      description: 'Build core skills required for your career path',
      status: 'in-progress',
      progress: 60,
      items: [
        { name: 'Complete Introduction to JavaScript', completed: true },
        { name: 'Learn React Fundamentals', completed: true },
        { name: 'Study Database Concepts', completed: false },
        { name: 'Understanding API Development', completed: false },
      ]
    },
    {
      title: 'Specialization',
      description: 'Develop expertise in your chosen field',
      status: 'upcoming',
      progress: 0,
      items: [
        { name: 'Advanced React Patterns', completed: false },
        { name: 'State Management with Redux', completed: false },
        { name: 'Backend Development with Node.js', completed: false },
        { name: 'Authentication and Security', completed: false },
      ]
    },
    {
      title: 'Professional Growth',
      description: 'Build your portfolio and professional network',
      status: 'upcoming',
      progress: 0,
      items: [
        { name: 'Create Personal Portfolio', completed: false },
        { name: 'Contribute to Open Source', completed: false },
        { name: 'Networking on LinkedIn', completed: false },
        { name: 'Technical Interview Preparation', completed: false },
      ]
    }
  ];

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
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3 text-gray-400" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/roadmap"
              className="flex items-center p-3 text-gray-700 rounded-lg bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3 text-kairos-600" />
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
          <h1 className="text-xl font-semibold text-gray-800">Career Roadmap</h1>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Roadmap Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">Your Web Development Career Path</h2>
              <p className="text-gray-600 mb-4">
                Based on your skills, education, and goals, we've crafted a personalized roadmap for your career journey.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-kairos-100 text-kairos-800 text-sm px-3 py-1 rounded-full">JavaScript</span>
                <span className="bg-kairos-100 text-kairos-800 text-sm px-3 py-1 rounded-full">React</span>
                <span className="bg-kairos-100 text-kairos-800 text-sm px-3 py-1 rounded-full">Full Stack Development</span>
              </div>
            </div>

            {/* Roadmap Timeline */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {roadmapSteps.map((step, index) => (
                <div key={index} className="relative flex items-start">
                  <div className="absolute left-0 mt-1 h-10 w-10 flex items-center justify-center">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-9 w-9 text-green-500" />
                    ) : step.status === 'in-progress' ? (
                      <Circle className="h-9 w-9 text-kairos-500" />
                    ) : (
                      <Circle className="h-9 w-9 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="ml-14 w-full">
                    <div className={`bg-white rounded-xl shadow-sm border ${
                      step.status === 'in-progress' 
                        ? 'border-kairos-200'
                        : step.status === 'completed'
                        ? 'border-green-200'
                        : 'border-gray-100'
                    } p-6`}>
                      <div className="flex flex-wrap justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <div>
                          {step.status === 'completed' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                          )}
                          {step.status === 'in-progress' && (
                            <span className="bg-kairos-100 text-kairos-800 text-xs px-2 py-1 rounded-full">In Progress</span>
                          )}
                          {step.status === 'upcoming' && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Upcoming</span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      {step.progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                          <div 
                            className="bg-kairos-600 h-2.5 rounded-full" 
                            style={{ width: `${step.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      <ul className="space-y-3">
                        {step.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center">
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            )}
                            <span className={item.completed ? "text-gray-700" : "text-gray-600"}>
                              {item.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      {step.status !== 'upcoming' && (
                        <div className="mt-4 flex justify-end">
                          <button className="text-kairos-600 hover:text-kairos-700 text-sm font-medium flex items-center">
                            View Resources <ExternalLink className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <div className="flex items-start">
                <div className="bg-kairos-100 p-3 rounded-lg mr-4">
                  <Award className="h-6 w-6 text-kairos-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Continue Your Journey</h3>
                  <p className="text-gray-600 mb-4">
                    Keep making progress on your roadmap. Need help or have questions about your next steps?
                  </p>
                  <Link 
                    to="/chatbot"
                    className="inline-flex items-center text-white bg-kairos-600 hover:bg-kairos-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Ask AI Assistant <MessageCircle className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Roadmap;
