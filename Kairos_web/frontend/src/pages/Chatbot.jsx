import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, MessageCircle, LogOut, Menu, Send, Mic, MicOff } from 'lucide-react';
import { sendMessage, transcribeAudio } from '../../services/chat';
import { startInterview, uploadResume } from '../../services/interview';

const Chatbot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m your Kairos AI assistant. How can I help with your career questions today?' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [interviewMode, setInterviewMode] = useState(false);
  const endOfMessagesRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        audioChunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          try {
            const response = await transcribeAudio(audioBlob);
            setInput(response.data.text);
          } catch (error) {
            console.error('Transcription error:', error);
            setMessages(prev => [...prev, { 
              sender: 'bot', 
              text: 'Sorry, I couldn\'t process your audio. Please try again.' 
            }]);
          }
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Microphone access denied. Please enable microphone permissions.' 
        }]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send to backend
      const response = await sendMessage(input, conversationId);
      
      // Add bot response
      const botResponse = { sender: 'bot', text: response.data.response };
      setMessages(prev => [...prev, botResponse]);
      setConversationId(response.data.conversation_id);
    } catch (error) {
      const errorMessage = { 
        sender: 'bot', 
        text: "Sorry, I encountered an error. Please try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterviewSession = async (topic, difficulty = 'medium') => {
    setIsLoading(true);
    try {
      const response = await startInterview(topic, difficulty);
      setMessages([{ sender: 'bot', text: response.data.question }]);
      setInterviewMode(true);
      setConversationId(response.data.conversation_id);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Failed to start interview. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const response = await uploadResume(file);
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: "I've analyzed your resume. Let's discuss your career path!" 
        },
        { 
          sender: 'bot', 
          text: `I found these skills: ${response.data.skills.join(', ')}` 
        }
      ]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Failed to process resume. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
            {!interviewMode && (
              <div className="max-w-3xl mx-auto mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => startInterviewSession('General Career', 'medium')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm whitespace-nowrap"
                  >
                    General Career Interview
                  </button>
                  <button
                    onClick={() => startInterviewSession('Technical Skills', 'hard')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm whitespace-nowrap"
                  >
                    Technical Interview
                  </button>
                  <label className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm whitespace-nowrap cursor-pointer">
                    Upload Resume
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                  </label>
                </div>
              </div>
            )}
            
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