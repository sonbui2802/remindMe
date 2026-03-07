import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="relative text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/60 transition-all duration-300 group-hover:w-full" />
    </a>
  );
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-transparent">
      <div className="flex items-center gap-10">
        {/* SPA-safe home link */}
        <Link
          to="/"
          className="text-2xl font-serif text-white tracking-wide font-medium flex items-center gap-2"
        >
          <span className="w-4 h-4 rounded-full border-[1.5px] border-white/80"></span>
          Mailora
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#feedback">Feedback</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#blog">Blog</NavLink>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            console.log('NAVIGATE → LOGIN');
            navigate('/login');
          }}
          className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white rounded-full transition-all duration-300 hover:bg-white/10"
        >
          Login
        </button>

        <button
          onClick={() => {
            console.log('NAVIGATE → SIGNUP');
            navigate('/signup');
          }}
          className="px-5 py-2 text-sm font-medium text-white border border-white/40 rounded-full hover:bg-white/20 hover:border-white/70 transition-all duration-300"
        >
          Sign up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;