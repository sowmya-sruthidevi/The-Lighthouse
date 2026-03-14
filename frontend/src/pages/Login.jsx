import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, ShieldCheck, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const Login = ({ role }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', accessCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const isFaculty = role === 'faculty';
  const isHod = role === 'hod';
  const requiresCode = isFaculty || isHod;
  
  let Icon = GraduationCap;
  if (isFaculty) Icon = Users;
  if (isHod) Icon = ShieldCheck;
  
  const portalName = isHod ? 'HOD Portal' : (isFaculty ? 'Faculty Portal' : 'Student Portal');
  const themeClass = isHod ? 'theme-hod' : (isFaculty ? 'theme-faculty' : 'theme-student');
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Email must be a @gmail.com address');
      setLoading(false);
      return;
    }

    if (requiresCode && !formData.accessCode) {
        setError('Secure Access Code is required');
        setLoading(false);
        return;
    }
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, role, accessCode: formData.accessCode }
        : { ...formData, role };
        
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      login(res.data);
      if (res.data.role === 'hod') {
        navigate('/hod/dashboard');
      } else if (res.data.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`login-page ${themeClass}`}>
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Back to Home
      </button>
      
      <div className="login-container glass animate-fade-in">
        <div className="card-accent"></div>
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Icon size={44} className="login-icon" />
          </div>
          <h2>{portalName}</h2>
          <p className="header-subtitle">{isLogin ? 'Welcome back! Please enter your details.' : 'Join the community and stay updated.'}</p>
        </div>
        
        {error && <div className="error-message animate-shake">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <UserIcon className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email" 
                className="form-input" 
                placeholder="you@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                name="password" 
                className="form-input" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          {requiresCode && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Secure Access Code</label>
              <div className="input-with-icon">
                <ShieldCheck className="input-icon" size={20} />
                <input 
                  type="password" 
                  name="accessCode" 
                  className="form-input" 
                  placeholder="Enter Secret Code"
                  value={formData.accessCode}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          )}
          
          <button type="submit" className={`btn ${isHod ? 'btn-hod' : (isFaculty ? 'btn-secondary' : 'btn-primary')} btn-block btn-glow`}>
            {loading ? (
              <span className="loader"></span>
            ) : (isLogin ? 'Sign In to Portal' : 'Register Now')}
          </button>
        </form>
        
        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-footer">
          <p>{isLogin ? "New to UniNotice?" : "Already have an account?"}</p>
          <button 
            type="button" 
            className="btn btn-outline btn-block create-account-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Create a New Account' : 'Back to Login'}
          </button>
        </div>
      </div>
      
      <div className="blob blob-bg"></div>
    </div>
  );
};

export default Login;
