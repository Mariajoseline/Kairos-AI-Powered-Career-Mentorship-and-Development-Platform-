
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-kairos-50 to-white z-0"></div>
      
      {/* Hero content */}
      <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Navigate</span> Your Career Path with Confidence
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Kairos uses AI to analyze your skills, education, and goals to create personalized career roadmaps and provide real-time guidance for your professional journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup" 
                className="bg-kairos-600 hover:bg-kairos-700 text-white py-3 px-6 rounded-md transition-colors inline-flex items-center justify-center text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a 
                href="#about" 
                className="bg-white hover:bg-gray-50 text-kairos-600 border border-kairos-200 py-3 px-6 rounded-md transition-colors inline-flex items-center justify-center text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1">
                  <div className="hero-gradient h-32 rounded-t-xl flex items-end p-4">
                    <div className="text-white text-xl font-semibold">Career Roadmap</div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-100 h-4 rounded-full w-3/4"></div>
                    <div className="bg-gray-100 h-4 rounded-full w-1/2"></div>
                    <div className="flex space-x-2 mt-6">
                      <div className="bg-kairos-100 h-12 rounded-lg w-1/3 flex items-center justify-center">
                        <div className="bg-kairos-500 h-3 w-3 rounded-full animate-pulse-slow"></div>
                      </div>
                      <div className="bg-gray-100 h-12 rounded-lg w-1/3"></div>
                      <div className="bg-gray-100 h-12 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-teal-500 rounded-full opacity-20 blur-2xl z-0"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="relative">
        <svg className="w-full h-auto" viewBox="0 0 1440 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,128L60,117.3C120,107,240,85,360,90.7C480,96,600,128,720,128C840,128,960,96,1080,80C1200,64,1320,64,1380,64L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="#ffffff"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
