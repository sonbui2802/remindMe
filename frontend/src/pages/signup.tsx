import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../assets/background.jpg';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signup(
        username.trim(),
        gmail.trim(),
        password
      );
      console.log('SIGNUP SUCCESS');
      // ✅ correct redirect after signup
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-slate-100 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-[420px] mx-4 p-8 sm:p-12 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60">

        <h1 className="text-2xl font-semibold text-center text-slate-900 mb-8 tracking-tight">
          Create an account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3.5 rounded-xl border bg-slate-50"
          />

          <input
            type="email"
            placeholder="Gmail"
            required
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            className="px-4 py-3.5 rounded-xl border bg-slate-50"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3.5 rounded-xl border bg-slate-50"
          />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white py-3.5 rounded-xl disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;