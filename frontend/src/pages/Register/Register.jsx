import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

 

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 5) {
      setError('Password must be at least 5 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register(name, email, password);
      if (res.success) {
        setSuccess(true);
        // Automatically log in the user after successful registration
        const loginRes = await login(email, password);
        if (loginRes.success) {
          navigate('/dashboard');
        } else {
          // If login fails for some reason, navigate to login page
          navigate('/login');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative font-body-md antialiased overflow-hidden bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNjAsIDc0LCA2NiwgMC4xKSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />

      {/* Main Container: Split Screen Layout */}
      <div className="w-full h-screen flex relative z-10">
        
        {/* Left Side: Brand Area (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSchqjIsaL2fblc_pciOtvDrT8shK5ODy-YIR0b0QrTXt7MDGeLnq4Ul4sjXQqFItsVyfDOrV6q8nxZpkLFEUTWIZj93EJEpKpmtQGpY5w4GRzo8o9ehIJwVzDpOLZV81vF4tuI9dYUf1KW03Ox3doQFPuqHKP6vQYe7tRD_8Ld6_DKsuhGmAAYmPjmEJ7I424ozuEFDyzBNDcxv31hokZ4wH4duhxR3TuovMjkgypp7crfgI9mVXFOsiSap7G44SpyRw1-xgxHmWz" 
              alt="TaskFlow Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Glass Overlay for Image */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/80 to-transparent" />

          <div className="relative z-20 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              workspaces
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              TaskFlow
            </span>
          </div>

          <div className="relative z-20 max-w-md mt-auto">
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6">
              Create your <br />
              <span className="gradient-text">workspace.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              High-velocity task management designed for technical teams who value precision and momentum.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="w-12 h-1 rounded-full bg-primary/20 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              workspaces
            </span>
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              TaskFlow
            </span>
          </div>

          <div className="w-full max-w-[420px] glass-panel rounded-xl p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative subtle glow behind form */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Get Started</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">Create a new account to join TaskFlow.</p>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs font-label-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-primary/20 text-primary text-xs font-label-md">
                  Account registered successfully! Logging in...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface block" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline-variant text-[20px]">
                        
                      </span>
                    </div>
                    <input 
                      className="input-glass w-full pl-10 pr-4 py-3 rounded-lg text-on-surface font-body-md placeholder-outline-variant focus:ring-0" 
                      id="name" 
                      name="name" 
                      placeholder="Khushi " 
                      required 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface block" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline-variant text-[20px]">
                        
                      </span>
                    </div>
                    <input 
                      className="input-glass w-full pl-10 pr-4 py-3 rounded-lg text-on-surface font-body-md placeholder-outline-variant focus:ring-0" 
                      id="email" 
                      name="email" 
                      placeholder="you@mail.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface block" htmlFor="password">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline-variant text-[20px]">
                        
                      </span>
                    </div>
                    <input 
                      className="input-glass w-full pl-10 pr-10 py-3 rounded-lg text-on-surface font-body-md placeholder-outline-variant focus:ring-0" 
                      id="password" 
                      name="password" 
                      placeholder="At least 5 characters" 
                      required 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-on-surface transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {showPassword ? "" : "show"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button 
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg btn-primary font-label-md text-label-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50" 
                    type="submit"
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                    <span className="material-symbols-outlined text-[18px]">
                      
                    </span>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-8 relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface-container-low text-on-surface-variant font-label-md text-label-md">Or continue with</span>
                </div>
              </div>

              {/* SSO Options */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-[#0e1a10] text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors group" type="button">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                    
                  </span>
                  GitHub
                </button>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-[#0e1a10] text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors group" type="button">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Google
                  </span>
                
                </button>
              </div>

              <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
                Already have an account? 
                <Link className="font-label-md text-label-md text-primary hover:underline hover:text-primary-fixed ml-1 font-semibold" to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
