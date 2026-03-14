import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Trash2, Calendar, Tag, FileText, GraduationCap, Users, User, ShieldCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const HodDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'General', department: 'All' });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('approval'); // 'approval' or 'history'

  useEffect(() => {
    if (!user || user.role !== 'hod') {
      navigate('/login/hod');
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

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notices/${id}/status`, { status }, config);
      fetchNotices();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/notices/${id}`, config);
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
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
      if (file) data.append('attachment', file);

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
    'All Departments', 'B.Tech - CSE (Core)', 'B.Tech - AI & Machine Learning', 'B.Tech - Data Science',
    'B.Tech - Cyber Security', 'B.Tech - ECE', 'B.Tech - EEE', 'B.Tech - IT', 'B.Tech - Mechanical',
    'B.Tech - Civil', 'B.Tech - Biotech', 'M.Tech - Computer Science', 'M.Tech - VLSI / Embedded',
    'MBA - Business Admin', 'MCA - Computer Apps', 'M.Com - Commerce', 'B.Sc / M.Sc - Sciences',
    'B.A / M.A - Arts', 'Research / Ph.D'
  ];

  const pendingNotices = notices.filter(n => n.status === 'pending');
  const otherNotices = notices.filter(n => n.status !== 'pending');

  return (
    <div className="dashboard-container theme-hod">
      <div className="faculty-bg-blob blob-1" style={{ background: 'radial-gradient(circle, rgba(248, 81, 73, 0.1) 0%, transparent 70%)' }}></div>
      <div className="faculty-bg-blob blob-2" style={{ background: 'radial-gradient(circle, rgba(248, 81, 73, 0.1) 0%, transparent 70%)' }}></div>
      
      <nav className="dashboard-nav glass">
        <div className="nav-brand">
          <ShieldCheck className="brand-icon text-hod" size={28} style={{ color: '#f85149' }} />
          <h2>HOD Command Center</h2>
        </div>
        <div className="nav-profile">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role" style={{ color: '#f85149' }}>Head Of Department</span>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-sidebar glass">
          <div className="faculty-sidebar-header">
            <PlusCircle style={{ color: '#f85149' }} size={24} />
            <h3>Distribute Notice</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="post-form post-form-premium">
            <div className="form-group">
              <label>ANNOUNCEMENT TITLE</label>
              <input type="text" name="title" className="form-input form-input-premium" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>CATEGORY</label>
              <select name="category" className="form-input select-input form-input-premium" value={formData.category} onChange={handleChange} required>
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Event">Event</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>DEPARTMENT</label>
              <select name="department" className="form-input select-input form-input-premium" value={formData.department} onChange={handleChange}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>DESCRIPTION</label>
              <textarea name="content" className="form-input textarea-input form-input-premium" rows="4" value={formData.content} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group">
              <label>ATTACHMENT</label>
              <div className="file-input-wrapper">
                <input type="file" onChange={handleFileChange} className="form-input file-input" id="file-upload" />
                <label htmlFor="file-upload" className="file-input-label">
                  <FileText size={18} /> {file ? file.name : 'Choose File'}
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-hod btn-block" style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #f85149, #ff7b72)', color: 'white', border: 'none', borderRadius: '8px' }}>
              Publish Post (Auto-Approved)
            </button>
          </form>
        </div>

        <div className="dashboard-main">
          <div className="tab-navigation glass" style={{ display: 'flex', gap: '1rem', padding: '0.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <button className={`tab-btn ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'approval' ? 'rgba(248, 81, 73, 0.2)' : 'transparent', color: activeTab === 'approval' ? '#f85149' : 'white', cursor: 'pointer', fontWeight: 600 }}>
              Approval Queue ({pendingNotices.length})
            </button>
            <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'history' ? 'rgba(248, 81, 73, 0.2)' : 'transparent', color: activeTab === 'history' ? '#f85149' : 'white', cursor: 'pointer', fontWeight: 600 }}>
              Live Notices
            </button>
          </div>

          <div className="notices-grid">
            {(activeTab === 'approval' ? pendingNotices : otherNotices).map(notice => (
              <div key={notice._id} className="notice-card glass notice-card-premium">
                <div className="notice-header">
                  <span className={`category-badge category-${notice.category.toLowerCase()}`}>{notice.category}</span>
                  <span className="dept-badge">{notice.department}</span>
                </div>
                <h4 className="notice-title">{notice.title}</h4>
                <p className="notice-content">{notice.content}</p>
                <div className="notice-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div className="notice-meta">
                    <span className="notice-author" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><User size={12} /> {notice.author?.name}</span>
                    <div className={`status-pill ${notice.status}`} style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: notice.status === 'approved' ? '#3fb950' : (notice.status === 'rejected' ? '#f85149' : '#f0883e') }}>
                      {notice.status === 'pending' ? <AlertCircle size={12} /> : (notice.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />)}
                      <span style={{ marginLeft: '4px', textTransform: 'uppercase', fontWeight: 700 }}>{notice.status}</span>
                    </div>
                  </div>
                  <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                    {notice.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(notice._id, 'approved')} className="btn-approve" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950', cursor: 'pointer' }}><CheckCircle size={20} /></button>
                        <button onClick={() => handleStatusUpdate(notice._id, 'rejected')} className="btn-reject" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', cursor: 'pointer' }}><XCircle size={20} /></button>
                      </>
                    )}
                    <button onClick={() => handleDelete(notice._id)} className="btn-delete" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', cursor: 'pointer' }}><Trash2 size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
