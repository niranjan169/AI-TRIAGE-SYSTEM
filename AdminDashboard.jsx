import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useQueue } from '../hooks/useQueue';
import { updateAppointment, completeAppointment, cancelAppointment } from '../services/database';
import './AdminDashboard.css';

const MOCK_DOCTORS = [
    { id: 'doc1', name: 'Dr. Sarah Johnson', specialty: 'Emergency Medicine' },
    { id: 'doc2', name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
    { id: 'doc3', name: 'Dr. Emily Rodriguez', specialty: 'Family Medicine' },
    { id: 'doc4', name: 'Dr. James Wilson', specialty: 'Urgent Care' }
];

const AdminDashboard = () => {
    const { queue, loading, refetch } = useQueue();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [assignedDoctors, setAssignedDoctors] = useState({});
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });

    useEffect(() => {
        // Auto-refresh queue every 30 seconds
        const interval = setInterval(() => {
            refetch();
        }, 30000);
        return () => clearInterval(interval);
    }, [refetch]);

    const assignDoctor = (appointmentId, doctorId) => {
        setAssignedDoctors(prev => ({ ...prev, [appointmentId]: doctorId }));
        updateAppointment(appointmentId, {
            doctor_id: doctorId,
            status: 'in-progress'
        }).then(() => refetch());
    };

    const handleComplete = async (appointmentId) => {
        await completeAppointment(appointmentId);
        refetch();
    };

    const handleCancel = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await cancelAppointment(appointmentId);
            refetch();
        }
    };

    const getAssignedDoctor = (appointmentId) => {
        const doctorId = assignedDoctors[appointmentId];
        return MOCK_DOCTORS.find(d => d.id === doctorId);
    };

    const getLeastLoadedDoctor = () => {
        const loads = MOCK_DOCTORS.map(doctor => ({
            ...doctor,
            load: Object.values(assignedDoctors).filter(id => id === doctor.id).length
        }));
        loads.sort((a, b) => a.load - b.load);
        return loads[0];
    };

    const filteredQueue = queue.filter(item => {
        const itemDate = item.appointment_date || (item.created_at ? item.created_at.split('T')[0] : '');
        return itemDate === selectedDate;
    });

    const highRiskWaiting = filteredQueue.filter(
        item => item.assessments?.risk_level === 'High' && item.waitingMinutes > 15
    );

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">
                        <Users className="title-icon" />
                        Admin Control Center
                    </h1>
                    <p className="dashboard-subtitle">Real-time patient queue management</p>
                </div>
                <div className="stats-bar">
                    <div className="stat-item">
                        <div className="stat-value">{queue.length}</div>
                        <div className="stat-label">In Queue</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            {queue.filter(q => q.assessments?.risk_level === 'High').length}
                        </div>
                        <div className="stat-label">High Risk</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{highRiskWaiting.length}</div>
                        <div className="stat-label">Alerts</div>
                    </div>
                </div>
            </div>

            {highRiskWaiting.length > 0 && (
                <Card variant="solid" className="alert-banner">
                    <AlertTriangle size={24} className="alert-icon" />
                    <div>
                        <strong>Attention Required!</strong>
                        <p>{highRiskWaiting.length} high-risk patient(s) waiting over 15 minutes</p>
                    </div>
                </Card>
            )}

            {loading ? (
                <LoadingSpinner size="large" message="Loading patient queue..." />
            ) : (
                <div className="queue-container">
                    <div className="queue-header">
                        <h2 className="queue-title">
                            <Clock size={24} />
                            Adaptive Priority Queue
                        </h2>
                        <div className="queue-actions-header">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="date-filter-input"
                            />
                            <Button variant="secondary" size="small" onClick={refetch}>
                                Refresh Queue
                            </Button>
                        </div>
                    </div>

                    {filteredQueue.length === 0 ? (
                        <Card variant="glass" className="empty-queue">
                            <CheckCircle2 size={48} />
                            <h3>No Patients in Queue</h3>
                            <p>All appointments have been processed</p>
                        </Card>
                    ) : (
                        <div className="queue-list">
                            {filteredQueue.map((item, index) => {
                                const doctor = getAssignedDoctor(item.id);
                                const isHighRiskDelayed =
                                    item.assessments?.risk_level === 'High' && item.waitingMinutes > 15;

                                return (
                                    <Card
                                        key={item.id}
                                        variant="glass"
                                        className={`queue-item ${isHighRiskDelayed ? 'queue-item-alert' : ''}`}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                            order: item.severityScore
                                        }}
                                    >
                                        <div className="queue-item-header">
                                            <div className="queue-position">#{index + 1}</div>
                                            <RiskBadge
                                                level={item.assessments?.risk_level || 'Low'}
                                                score={item.severityScore}
                                            />
                                            {isHighRiskDelayed && (
                                                <div className="delay-warning">
                                                    <AlertTriangle size={20} />
                                                    Delayed
                                                </div>
                                            )}
                                        </div>

                                        <div className="patient-info">
                                            <h3 className="patient-name">{item.patient_name}</h3>
                                            <div className="patient-details">
                                                <span className="detail-item">
                                                    <Clock size={16} />
                                                    Waiting: {item.waitingMinutes} min
                                                </span>
                                                <span className="detail-item">
                                                    Department: {item.department}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="symptoms-preview">
                                            <strong>Symptoms:</strong>
                                            <p>{item.assessments?.symptoms?.slice(0, 3).join(', ') || 'N/A'}</p>
                                        </div>

                                        <div className="vitals-row">
                                            {item.assessments?.vitals?.bloodPressure && (
                                                <div className="vital-item">
                                                    <span className="vital-label">BP</span>
                                                    <span className="vital-value">
                                                        {item.assessments.vitals.bloodPressure}
                                                    </span>
                                                </div>
                                            )}
                                            {item.assessments?.vitals?.heartRate && (
                                                <div className="vital-item">
                                                    <span className="vital-label">HR</span>
                                                    <span className="vital-value">
                                                        {item.assessments.vitals.heartRate} bpm
                                                    </span>
                                                </div>
                                            )}
                                            {item.assessments?.vitals?.temperature && (
                                                <div className="vital-item">
                                                    <span className="vital-label">Temp</span>
                                                    <span className="vital-value">
                                                        {item.assessments.vitals.temperature}°F
                                                    </span>
                                                </div>
                                            )}
                                            {item.assessments?.vitals?.oxygenLevel && (
                                                <div className="vital-item">
                                                    <span className="vital-label">O2</span>
                                                    <span className="vital-value">
                                                        {item.assessments.vitals.oxygenLevel}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="doctor-assignment">
                                            {doctor ? (
                                                <div className="assigned-doctor">
                                                    <CheckCircle2 size={16} className="check-icon" />
                                                    <span>{doctor.name} - {doctor.specialty}</span>
                                                </div>
                                            ) : (
                                                <div className="assign-doctor-section">
                                                    <select
                                                        className="doctor-select"
                                                        onChange={(e) => assignDoctor(item.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Assign Doctor</option>
                                                        {MOCK_DOCTORS.map(doc => (
                                                            <option key={doc.id} value={doc.id}>
                                                                {doc.name} - {doc.specialty}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        variant="primary"
                                                        size="small"
                                                        onClick={() => {
                                                            const bestDoctor = getLeastLoadedDoctor();
                                                            assignDoctor(item.id, bestDoctor.id);
                                                        }}
                                                    >
                                                        Auto-Assign
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="queue-actions">
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => setSelectedPatient(item)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="small"
                                                onClick={() => handleComplete(item.id)}
                                            >
                                                Complete
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleCancel(item.id)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
                    <Card
                        variant="gradient"
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Patient Details</h2>
                            <button
                                className="close-button"
                                onClick={() => setSelectedPatient(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Name:</strong>
                                <span>{selectedPatient.patient_name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Risk Level:</strong>
                                <RiskBadge level={selectedPatient.assessments?.risk_level || 'Low'} />
                            </div>
                            <div className="detail-row">
                                <strong>Department:</strong>
                                <span>{selectedPatient.department}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Symptoms:</strong>
                                <span>{selectedPatient.assessments?.symptoms?.join(', ') || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Medical History:</strong>
                                <p>{selectedPatient.assessments?.medical_history || 'None provided'}</p>
                            </div>
                            <div className="detail-row">
                                <strong>AI Reasoning:</strong>
                                <p>{selectedPatient.assessments?.reasoning || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
