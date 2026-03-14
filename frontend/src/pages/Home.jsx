import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Bell, FileText, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="glass sticky-nav">
        <div className="logo flex-center">
          <Bell className="logo-icon" size={28} />
          <h2>UniNotice</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/login/student')} className="nav-link-btn">Students</button>
          <button onClick={() => navigate('/login/faculty')} className="nav-link-btn">Faculty</button>
        </div>
      </nav>

      <main className="hero-section flex-center">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            <span className="text-gradient">Centralized</span> Notice Board
          </h1>
          <p className="hero-subtitle">
            Stay updated with real-time academic announcements, event schedules, and critical administrative updates.
          </p>
          
          <div className="portal-cards">
            {/* Student Card */}
            <div className="portal-card glass student-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="card-accent student-accent"></div>
              <div className="portal-icon-wrapper student-icon-bg">
                <GraduationCap size={44} className="portal-icon" />
              </div>
              <h3>Student Portal</h3>
              <p>View categorized notices, browse by department, and get real-time institute updates.</p>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/login/student')}>
                Enter Student Portal
              </button>
            </div>

            {/* HOD Card */}
            <div className="portal-card glass hod-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="card-accent hod-accent"></div>
              <div className="portal-icon-wrapper hod-icon-bg">
                <ShieldCheck size={44} className="portal-icon" />
              </div>
              <h3>HOD Portal</h3>
              <p>Review faculty announcements, approve events, and manage department communications.</p>
              <button className="btn btn-hod btn-block" onClick={() => navigate('/login/hod')}>
                Enter HOD Portal
              </button>
            </div>

            {/* Faculty Card */}
            <div className="portal-card glass faculty-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="card-accent faculty-accent"></div>
              <div className="portal-icon-wrapper faculty-icon-bg">
                <Users size={44} className="portal-icon" />
              </div>
              <h3>Faculty Portal</h3>
              <p>Publish important announcements and manage notice boards securely for your students.</p>
              <button className="btn btn-secondary btn-block" onClick={() => navigate('/login/faculty')}>
                Enter Faculty Portal
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Decorative Blob */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
};

export default Home;
