
import React from 'react';
import { BookOpen, Compass, Clock, BarChart } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Personalized Learning',
    description: 'Tailored education pathways based on your skills, experience, and career goals.'
  },
  {
    icon: Compass,
    title: 'AI-Driven Guidance',
    description: 'Advanced AI that analyzes job market trends and recommends optimal career choices.'
  },
  {
    icon: Clock,
    title: 'Real-Time Adaptation',
    description: 'Roadmaps that evolve as you progress, adapting to changing career landscapes.'
  },
  {
    icon: BarChart,
    title: 'Progress Tracking',
    description: 'Monitor your growth and celebrate milestones as you advance toward your goals.'
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            About <span className="text-gradient">Kairos</span>
          </h2>
          <p className="text-lg text-gray-600">
            At Kairos, we believe in the power of perfect timing in career development. Our name, from the ancient Greek concept of "the opportune moment," reflects our mission to help you seize the right opportunities at the right time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Our Mission</h3>
            <p className="text-gray-600">
              Kairos exists to democratize career guidance through AI-powered insights that were once available only to those with access to premium career coaching. We believe everyone deserves clear guidance on their professional journey.
            </p>
            <p className="text-gray-600">
              Our platform analyzes your unique combination of skills, education, experiences, and aspirations to create personalized pathways that maximize your potential.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Our Vision</h3>
            <p className="text-gray-600">
              We envision a world where career uncertainty is replaced by clarity and confidence. Where professionals at every stage can access intelligent guidance that adapts to the rapidly changing job landscape.
            </p>
            <p className="text-gray-600">
              By combining human wisdom with artificial intelligence, we're building a future where everyone can discover their optimal career path and timing for professional success.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card-gradient p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 text-kairos-600">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
