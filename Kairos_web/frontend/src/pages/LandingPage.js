import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    React.createElement(
      'div',
      { className: 'min-h-screen flex flex-col' },
      React.createElement(Navbar, null),
      React.createElement(
        'main',
        { className: 'flex-grow' },
        React.createElement(Hero, null),
        React.createElement(AboutSection, null)
      ),
      React.createElement(Footer, null)
    )
  );
};

export default LandingPage;