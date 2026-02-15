import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Calendar, FileText, AlertCircle, Clock,
    TrendingUp, User, Heart, ChevronRight, X, Beaker
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppointments } from '../hooks/useAppointments';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskBadge from '../components/RiskBadge';
import { cancelAppointment, rescheduleAppointment } from '../services/appointmentManagement';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, history, profile
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('Morning (8AM - 12PM)');
    const [processing, setProcessing] = useState(false);
    const [pastAssessments, setPastAssessments] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        // Get logged-in user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);

            // IMPORTANT: Set patient ID based on user email (unique identifier)
            // This ensures appointments are filtered by this user only
            localStorage.setItem('patientId', userData.email);

            console.log('👤 Logged-in user:', userData.name);
            console.log('📧 Patient ID set to:', userData.email);
            fetchHistory(userData.email);
        }
    }, []);

    const fetchHistory = async (email) => {
        try {
            setLoadingHistory(true);
            const { getPatientAssessments } = await import('../services/database');
            const assessments = await getPatientAssessments(email);
            setPastAssessments(assessments || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Fetch appointments for THIS user only
    // CRITICAL: This filters appointments by patient_id = user.email
    const { appointments, loading } = useAppointments({
        patientId: user?.email
    });

    console.log('📊 Fetching appointments for patient:', user?.email);
    console.log('📋 Total appointments found:', appointments?.length);
    console.log('🔍 Appointments data:', appointments);

    const upcomingAppointments = appointments?.filter(apt =>
        apt.status === 'pending' || apt.status === 'in-progress'
    ) || [];

    const pastAppointments = appointments?.filter(apt =>
        apt.status === 'completed'
    ) || [];

    console.log('⏰ Upcoming appointments:', upcomingAppointments.length);
    console.log('✅ Past appointments:', pastAppointments.length);

    // Handle cancel appointment
    const handleCancelAppointment = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        setProcessing(true);
        try {
            await cancelAppointment(appointmentId);
            alert('✅ Appointment cancelled successfully!');
            window.location.reload(); // Refresh to show updated data
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('❌ Error cancelling appointment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle reschedule appointment
    const handleRescheduleClick = (appointment) => {
        console.log('📅 Opening reschedule modal for:', appointment);
        setSelectedAppointment(appointment);
        setNewDate(appointment.appointment_date);
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        console.log('📅 Submitting reschedule:', {
            appointmentId: selectedAppointment?.id,
            newDate,
            newTime
        });

        if (!newDate) {
            alert('Please select a new date');
            return;
        }

        if (!selectedAppointment) {
            alert('No appointment selected');
            return;
        }

        setProcessing(true);
        try {
            // Generate new time slot based on time range
            const timeSlots = {
                'Morning (8AM - 12PM)': '9:00 AM',
                'Afternoon (12PM - 4PM)': '2:00 PM',
                'Evening (4PM - 8PM)': '6:00 PM'
            };
            const newSlot = timeSlots[newTime] || '9:00 AM';

            console.log('📅 Calling rescheduleAppointment with:', {
                id: selectedAppointment.id,
                newDate,
                newSlot
            });

            await rescheduleAppointment(selectedAppointment.id, newDate, newSlot);

            console.log('✅ Reschedule successful!');
            alert('✅ Appointment rescheduled successfully!');
            setShowRescheduleModal(false);
            window.location.reload(); // Refresh to show updated data
        } catch (error) {
            console.error('❌ Error rescheduling appointment:', error);
            console.error('Error details:', error.message, error.stack);
            alert(`❌ Error rescheduling appointment: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };



    const renderOverview = () => (
        <>
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1 className="welcome-title">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="welcome-subtitle">
                        Your personalized healthcare dashboard
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <Card variant="glass" className="stat-card">
                    <div className="stat-icon upcoming">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Upcoming</p>
                        <h3 className="stat-value">{upcomingAppointments.length}</h3>
                    </div>
                </Card>

                <Card variant="glass" className="stat-card">
                    <div className="stat-icon completed">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Assessments</p>
                        <h3 className="stat-value">{pastAssessments.length}</h3>
                    </div>
                </Card>

                <Card variant="glass" className="stat-card">
                    <div className="stat-icon health">
                        <Heart size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Health Score</p>
                        <h3 className="stat-value">Good</h3>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    <Card variant="gradient" hover className="action-card-new">
                        <div className="action-icon primary">
                            <Activity size={32} />
                        </div>
                        <div className="action-content">
                            <h3>New Assessment</h3>
                            <p>Start AI-powered symptom analysis</p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/assessment')}
                            className="action-button"
                        >
                            Start Now <ChevronRight size={16} />
                        </Button>
                    </Card>

                    <Card variant="glass" hover className="action-card-new">
                        <div className="action-icon secondary">
                            <Calendar size={32} />
                        </div>
                        <div className="action-content">
                            <h3>My Appointments</h3>
                            <p>View and manage appointments</p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveTab('appointments')}
                            className="action-button"
                        >
                            View All <ChevronRight size={16} />
                        </Button>
                    </Card>

                    <Card variant="glass" hover className="action-card-new">
                        <div className="action-icon tertiary">
                            <FileText size={32} />
                        </div>
                        <div className="action-content">
                            <h3>Medical History</h3>
                            <p>Review past assessments</p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveTab('history')}
                            className="action-button"
                        >
                            View History <ChevronRight size={16} />
                        </Button>
                    </Card>

                    <Card variant="glass" hover className="action-card-new">
                        <div className="action-icon quaternary">
                            <Beaker size={32} />
                        </div>
                        <div className="action-content">
                            <h3>Diagnostic Lab</h3>
                            <p>Instant AI infection testing</p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/ailab')}
                            className="action-button"
                        >
                            Open Lab <ChevronRight size={16} />
                        </Button>
                    </Card>
                </div>
            </div>


            {/* Recent Activity */}
            {
                upcomingAppointments.length > 0 && (
                    <div className="recent-activity">
                        <h2 className="section-title">Next Appointment</h2>
                        <Card variant="glass" className="next-appointment">
                            <div className="appointment-main">
                                <div className="appointment-left">
                                    <RiskBadge level={upcomingAppointments[0].risk_level} />
                                    <div className="appointment-info">
                                        <h3>{upcomingAppointments[0].department}</h3>
                                        <p className="appointment-meta">
                                            <Calendar size={16} />
                                            {new Date(upcomingAppointments[0].appointment_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="appointment-meta">
                                            <Clock size={16} />
                                            {upcomingAppointments[0].appointment_slot}
                                        </p>
                                    </div>
                                </div>
                                <div className="appointment-actions-new">
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleRescheduleClick(upcomingAppointments[0])}
                                        disabled={processing}
                                    >
                                        Reschedule
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={() => handleCancelAppointment(upcomingAppointments[0].id)}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            }
        </>
    );

    const renderAppointments = () => (
        <div className="appointments-page">
            <h2 className="page-title">My Appointments</h2>

            {loading ? (
                <LoadingSpinner message="Loading appointments..." />
            ) : upcomingAppointments.length === 0 ? (
                <Card variant="glass" className="empty-state">
                    <Calendar size={48} />
                    <h3>No Upcoming Appointments</h3>
                    <p>Start a new assessment to schedule an appointment</p>
                    <Button variant="primary" onClick={() => navigate('/assessment')}>
                        New Assessment
                    </Button>
                </Card>
            ) : (
                <div className="appointments-list-new">
                    {upcomingAppointments.map(apt => (
                        <Card key={apt.id} variant="glass" className="appointment-card-full">
                            <div className="appointment-header-full">
                                <RiskBadge level={apt.risk_level} />
                                <span className="appointment-status pending">Pending</span>
                            </div>
                            <div className="appointment-body">
                                <h3>{apt.department}</h3>
                                <div className="appointment-details-grid">
                                    <div className="detail-item">
                                        <Calendar size={16} />
                                        <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Clock size={16} />
                                        <span>{apt.appointment_slot}</span>
                                    </div>
                                    <div className="detail-item">
                                        <TrendingUp size={16} />
                                        <span>Priority: {apt.priority_score}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="appointment-footer">
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => handleRescheduleClick(apt)}
                                    disabled={processing}
                                >
                                    Reschedule
                                </Button>
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="history-page">
            <h2 className="page-title">Medical History</h2>

            {loadingHistory ? (
                <LoadingSpinner message="Loading history..." />
            ) : pastAssessments.length === 0 ? (
                <Card variant="glass" className="empty-state">
                    <FileText size={48} />
                    <h3>No Medical History Found</h3>
                    <p>Your past AI assessments and results will appear here</p>
                    <Button variant="primary" onClick={() => navigate('/assessment')}>
                        Start First Assessment
                    </Button>
                </Card>
            ) : (
                <div className="history-list-new">
                    {pastAssessments.map(item => (
                        <Card key={item.id} variant="glass" className="history-card-full">
                            <div className="history-header-full">
                                <span className="history-status-badge">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <RiskBadge level={item.risk_level} />
                            </div>
                            <div className="history-main">
                                <h3>{item.department || 'General Assessment'}</h3>
                                <p className="history-reasoning">{item.reasoning?.substring(0, 100)}...</p>
                            </div>
                            <div className="history-footer">
                                <span className="conf-score">AI Confidence: {item.confidence}%</span>
                                <Button variant="secondary" size="small" className="view-detail-btn">
                                    View Full Report
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="profile-page">
            <h2 className="page-title">My Profile</h2>
            <Card variant="glass" className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>
                    <div className="profile-info">
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                        <span className="profile-role">{user?.role}</span>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="profile-stat">
                        <span className="profile-stat-label">Total Appointments</span>
                        <span className="profile-stat-value">{appointments?.length || 0}</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-label">Upcoming</span>
                        <span className="profile-stat-value">{upcomingAppointments.length}</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-label">Completed</span>
                        <span className="profile-stat-value">{pastAppointments.length}</span>
                    </div>
                </div>
            </Card>
        </div>
    );

    if (!user) {
        return <LoadingSpinner message="Loading dashboard..." />;
    }

    return (
        <div className="patient-dashboard-new">
            {/* Emergency Button - Top Banner */}
            <Card variant="solid" className="emergency-banner-top">
                <div className="emergency-banner-inner">
                    <AlertCircle size={28} className="emergency-icon-glow" />
                    <div className="emergency-content">
                        <h4>Need Urgent Help?</h4>
                        <p>If you're in a life-threatening situation, please call 911 immediately. Your safety is our priority.</p>
                    </div>
                    <Button variant="danger" className="emergency-call-btn">
                        Call 911 Now
                    </Button>
                </div>
            </Card>

            {/* Tab Navigation */}
            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Activity size={20} />
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    <Calendar size={20} />
                    Appointments
                </button>
                <button
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FileText size={20} />
                    History
                </button>
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={20} />
                    Profile
                </button>
            </div>

            {/* Tab Content */}
            <div className="dashboard-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'appointments' && renderAppointments()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'profile' && renderProfile()}
            </div>
            {/* Reschedule Modal */}

            {showRescheduleModal && (
                <div className="modal-overlay">
                    <Card
                        variant="glass"
                        className="reschedule-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Reschedule Appointment</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowRescheduleModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>New Date</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Time Range</label>
                                <select
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="form-input"
                                >
                                    <option>Morning (8AM - 12PM)</option>
                                    <option>Afternoon (12PM - 4PM)</option>
                                    <option>Evening (4PM - 8PM)</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                variant="secondary"
                                onClick={() => setShowRescheduleModal(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleRescheduleSubmit}
                                disabled={processing}
                            >
                                {processing ? 'Rescheduling...' : 'Confirm Reschedule'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )
            }
        </div >
    );
};

export default PatientDashboard;
