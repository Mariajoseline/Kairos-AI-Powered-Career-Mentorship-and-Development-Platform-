
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isHomePage = location.pathname === '/';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || !isHomePage ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">Kairos</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isHomePage && (
              <a 
                href="#about" 
                className="text-gray-700 hover:text-kairos-600 transition-colors"
              >
                About Us
              </a>
            )}
            <Link 
              to="/signin" 
              className="text-gray-700 hover:text-kairos-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-kairos-600 hover:bg-kairos-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-kairos-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isHomePage && (
              <a
                href="#about"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-gray-700 hover:text-kairos-600 hover:bg-gray-50"
              >
                About Us
              </a>
            )}
            <Link
              to="/signin"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-kairos-600 hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-kairos-600 hover:text-kairos-700 hover:bg-gray-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
