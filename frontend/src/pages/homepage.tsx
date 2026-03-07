import React from 'react';
import Navbar from '../components/navbar';

const Homepage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-gradient-to-b from-[#4A93D8] via-[#A0CAEF] to-[#FFFFFF] font-sans overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className="max-w-3xl flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-[4rem] lg:text-[4.5rem] font-serif text-white font-normal leading-[1.1] tracking-tight">
            Never Miss the Email
            <br />
            That Matters
          </h1>

          <p className="mt-6 md:mt-8 text-lg sm:text-xl text-white/90 font-light tracking-wide">
            Quiet follow-ups that keep you on time.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Homepage;