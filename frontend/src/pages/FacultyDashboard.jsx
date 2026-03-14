import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Trash2, Calendar, Tag, FileText, Search, Filter, GraduationCap, Users, User, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'General', department: 'All' });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'faculty') {
      navigate('/login/faculty');
      return;
    }
    fetchNotices();
  }, [user, navigate]);

  const fetchNotices = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/notices', config);
      setNotices(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/notices/${id}`, config);
      fetchNotices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting notice:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete notice';
      alert(errorMsg);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('department', formData.department);
      if (file) {
        data.append('attachment', file);
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      };

      await axios.post('http://localhost:5000/api/notices', data, config);
      setFormData({ title: '', content: '', category: 'General', department: 'All' });
      setFile(null);
      setUploadProgress(0);
      fetchNotices();
    } catch (error) {
      console.error(error);
      setUploadProgress(0);
    }
  };

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

  return (
    <div className="dashboard-container">
      {/* Dynamic Background Blobs */}
      <div className="faculty-bg-blob blob-1"></div>
      <div className="faculty-bg-blob blob-2"></div>
      
      <nav className="dashboard-nav glass">
        <div className="nav-brand">
          <GraduationCap className="brand-icon" size={28} />
          <h2>Faculty Control Center</h2>
        </div>
        <div className="nav-profile">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Authorized Personnel</span>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-sidebar glass animate-fade-in">
          <div className="faculty-sidebar-header">
            <PlusCircle className="text-secondary" size={24} />
            <h3>Distribute Notice</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="post-form post-form-premium">
            <div className="form-group">
              <label>ANNOUNCEMENT TITLE</label>
              <input 
                type="text" 
                name="title" 
                className="form-input form-input-premium" 
                placeholder="e.g. End Semester Results Published"
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>CATEGORY</label>
              <select name="category" className="form-input select-input form-input-premium" value={formData.category} onChange={handleChange} required>
                <option value="General">General Announcement</option>
                <option value="Exam">Exam Schedule</option>
                <option value="Event">Campus Event</option>
                <option value="Admin">Academic Office</option>
                <option value="Internship">Internship & Placement</option>
              </select>
            </div>

            <div className="form-group">
              <label>TARGET DEPARTMENT</label>
              <select name="department" className="form-input select-input form-input-premium" value={formData.department} onChange={handleChange} required>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>DESCRIPTION</label>
              <textarea 
                name="content" 
                className="form-input textarea-input form-input-premium" 
                rows="5" 
                placeholder="Write the details of the announcement here..."
                value={formData.content} 
                onChange={handleChange} 
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>FILE ATTACHMENT</label>
              <div className="file-input-wrapper">
                <input type="file" onChange={handleFileChange} className="form-input file-input" id="file-upload" />
                <label htmlFor="file-upload" className="file-input-label">
                  <FileText size={18} /> {file ? file.name : 'Upload PDF or Image'}
                </label>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            
            <button type="submit" className="btn btn-secondary btn-block publish-btn">
              {loading ? <span className="loader"></span> : <><PlusCircle size={20} /> Publish Announcement</>}
            </button>
          </form>
        </div>

        <div className="dashboard-main animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="faculty-stat-cards">
            <div className="stat-card glass">
              <div className="stat-icon"><FileText size={24} /></div>
              <div className="stat-info">
                <h4>Your Posts</h4>
                <p>{notices.length}</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-info">
                <h4>Targeted</h4>
                <p>{formData.department}</p>
              </div>
            </div>
          </div>

          <div className="main-header">
            <h3>Announcement History</h3>
            <p className="text-muted">Manage and track your published notices</p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="loader"></div>
              <span>Fetching notices...</span>
            </div>
          ) : notices.length === 0 ? (
            <div className="empty-state glass">
              <FileText size={48} className="text-muted" />
              <h3>No announcements yet</h3>
              <p>Start by filling out the form on the left.</p>
            </div>
          ) : (
            <div className="notices-grid">
              {notices.map((notice) => (
                <div key={notice._id} className="notice-card glass notice-card-faculty">
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
                  <h4 className="notice-title">{notice.title}</h4>
                  <p className="notice-content">{notice.content}</p>
                  
                  {notice.attachment && (
                    <div className="notice-attachment">
                      <a href={`http://localhost:5000${notice.attachment}`} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        <FileText size={16} /> View Attached Resource
                      </a>
                    </div>
                  )}

                  <div className="notice-footer">
                    <div className="status-indicator">
                      {notice.status === 'pending' ? (
                        <span className="status-pill pending">
                          <AlertCircle size={14} /> Waiting for HOD Approval
                        </span>
                      ) : (
                        <span className="status-pill approved">
                          <CheckCircle size={14} /> HOD Approved
                        </span>
                      )}
                    </div>
                    
                    <div className="notice-info-footer">
                      <span className="notice-author">
                        <User size={14} /> You (Faculty)
                      </span>
                      <span className="notice-time">
                        {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button 
                      className="delete-notice-btn" 
                      onClick={() => handleDelete(notice._id)} 
                      title="Remove Announcement"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
