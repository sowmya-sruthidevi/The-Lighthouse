import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, Tag, FileText, Search, Filter, GraduationCap, User, Bell, X } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastChecked, setLastChecked] = useState(localStorage.getItem('lastChecked') || new Date().toISOString());

  const departments = [
    'All Departments', 
    'B.Tech - CSE (Core)', 
    'B.Tech - AI & Machine Learning',
    'B.Tech - Data Science',
    'B.Tech - Cyber Security',
    'B.Tech - ECE', 
    'B.Tech - EEE', 
    'B.Tech - IT', 
    'B.Tech - Mechanical', 
    'B.Tech - Civil',
    'B.Tech - Biotech',
    'M.Tech - Computer Science',
    'M.Tech - VLSI / Embedded',
    'MBA - Business Admin',
    'MCA - Computer Apps',
    'M.Com - Commerce',
    'B.Sc / M.Sc - Sciences',
    'B.A / M.A - Arts',
    'Research / Ph.D'
  ];

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login/student');
      return;
    }
    fetchNotices();
  }, [user, navigate]);

  const fetchNotices = async (isPoll = false) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/notices', config);
      
      if (isPoll) {
        // Detect new notices that were approved (updated) since we last saw them
        const newlyApproved = res.data.filter(n => {
          const isKnown = notices.find(existing => existing._id === n._id);
          const isNewer = new Date(n.updatedAt) > new Date(lastChecked);
          return !isKnown && isNewer;
        });
        
        newlyApproved.forEach(notice => {
          showToast(notice);
        });
      }
      
      setNotices(res.data);
      
      // Calculate unread (new approvals since last checked)
      const count = res.data.filter(n => new Date(n.updatedAt) > new Date(lastChecked)).length;
      setUnreadCount(count);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (notice) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title: notice.title, content: notice.content }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);
    const now = new Date().toISOString();
    setLastChecked(now);
    localStorage.setItem('lastChecked', now);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotices(true);
    }, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [notices, lastChecked]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || notice.category === selectedCategory;
    
    const matchesDept = selectedDept === 'All Departments' || 
                        notice.department === selectedDept || 
                        notice.department === 'All Departments';
    
    return matchesSearch && matchesCategory && matchesDept;
  });

  return (
    <div className="dashboard-container">
      {/* Dynamic Background Blobs */}
      <div className="student-bg-blob blob-1"></div>
      <div className="student-bg-blob blob-2"></div>

      <nav className="dashboard-nav glass">
        <div className="nav-brand">
          <GraduationCap className="brand-icon-student" size={28} />
          <h2>Student Portal</h2>
        </div>
        <div className="nav-profile">
          <div className="notification-wrapper">
            <button className="notif-bell" onClick={handleBellClick} title="Notifications">
              <Bell size={22} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role-student">Active Learner</span>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="student-dashboard-content animate-fade-in">
        <div className="filters-bar glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="filter-group">
            <label><Search size={16} /> Search</label>
            <input 
              type="text" 
              className="form-input search-input" 
              placeholder="Filter by title or content..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label><Tag size={16} /> Category</label>
            <select 
              className="form-input select-input" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Exam">Exam Schedule</option>
              <option value="Event">Event</option>
              <option value="Admin">Administrative</option>
              <option value="Internship">Internship/Placement</option>
            </select>
          </div>

          <div className="filter-group">
            <label><GraduationCap size={16} /> Department</label>
            <select 
              className="form-input select-input" 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashboard-main full-width">
          <div className="student-stat-ribbon animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-pill glass">
              <Bell size={16} className="text-primary" />
              <span>{filteredNotices.length} Important Notices Relevant to you</span>
            </div>
            <div className="stat-pill glass">
              <GraduationCap size={16} className="text-primary" />
              <span>{selectedDept}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
                <div className="loader"></div>
                <span>Syncing Board...</span>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="empty-state glass">
                <Search size={48} className="text-muted" />
                <h3>No announcements found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="notices-grid grid-3">
              {filteredNotices.map((notice, index) => (
                <div key={notice._id} className="notice-card glass pulse-hover animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                  <div className="notice-header">
                    <div className="badge-group">
                      <span className={`category-badge category-${notice.category.toLowerCase()}`}>
                        {notice.category}
                      </span>
                      <span className="dept-badge">
                        {notice.department}
                      </span>
                    </div>
                    <span className="notice-date">
                      <Calendar size={14} /> 
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="notice-title">
                    {notice.title}
                    {new Date(notice.updatedAt) > new Date(lastChecked) && (
                      <span className="new-badge">New</span>
                    )}
                  </h4>
                  <p className="notice-content">{notice.content}</p>
                  
                  {notice.attachment && (
                    <div className="notice-attachment">
                      <a href={`http://localhost:5000${notice.attachment}`} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        <FileText size={16} /> View Attached Material
                      </a>
                    </div>
                  )}

                  <div className="notice-footer">
                    <span className="notice-author">
                      <User size={14} /> {notice.author?.name} (Faculty)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <div className="toast-icon">
              <Bell size={20} />
            </div>
            <div className="toast-content">
              <h5>New Announcement</h5>
              <p>{toast.title}</p>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
