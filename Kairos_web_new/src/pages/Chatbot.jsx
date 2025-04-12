
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, MessageCircle, LogOut, Menu, Send, Mic, MicOff } from 'lucide-react';

const Chatbot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m your Kairos AI assistant. How can I help with your career questions today?' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);
  
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  };

  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  
  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInput(transcript);
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleToggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setInput('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response (replace with actual API call in production)
    setTimeout(() => {
      let botResponse;
      const lowercaseInput = input.toLowerCase();
      
      if (lowercaseInput.includes('roadmap') || lowercaseInput.includes('path') || lowercaseInput.includes('career')) {
        botResponse = { 
          sender: 'bot', 
          text: 'Based on your profile as a web developer, I recommend focusing on strengthening your JavaScript fundamentals and then diving deeper into React. Have you considered learning about state management with Redux or context API?' 
        };
      } else if (lowercaseInput.includes('skill') || lowercaseInput.includes('learn')) {
        botResponse = { 
          sender: 'bot', 
          text: 'For your skill development, I recommend taking structured online courses and building projects to apply what you\'ve learned. Would you like me to suggest some specific resources for JavaScript and React?' 
        };
      } else {
        botResponse = { 
          sender: 'bot', 
          text: 'That\'s a great question! Based on your profile, I\'d suggest focusing on building projects that showcase your skills while continuing to learn new technologies. Would you like more specific guidance on this topic?' 
        };
      }
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3 text-gray-400" />
              <span>My Roadmap</span>
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center p-3 text-gray-700 rounded-lg bg-gray-100"
            >
              <MessageCircle className="h-5 w-5 mr-3 text-kairos-600" />
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

      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-6">
          <button 
            className="lg:hidden mr-4 text-gray-600"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
        </header>

        {/* Chat Interface */}
        <main className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-md rounded-lg p-4 ${
                      message.sender === 'user' 
                        ? 'bg-kairos-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={endOfMessagesRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kairos-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                    isRecording ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="submit"
                className="ml-2 bg-kairos-600 hover:bg-kairos-700 text-white p-3 rounded-lg flex-shrink-0"
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                {isRecording ? 'Listening... Speak now' : 'Click the microphone icon to use voice input'}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chatbot;
