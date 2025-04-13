
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient">Kairos</h3>
            <p className="text-gray-600 mb-4">
              Guiding your career journey with AI-powered insights and personalized roadmaps.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-kairos-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-kairos-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/signin" className="text-gray-600 hover:text-kairos-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-kairos-600 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <p className="text-gray-600 mb-2">info@kairoscareers.com</p>
            <p className="text-gray-600">1234 Career Avenue</p>
            <p className="text-gray-600">Opportunity City, OP 56789</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Kairos. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
