import { useState, useEffect } from 'react';
import { getAllDoctors } from '../services/doctorScheduling';
import Card from '../components/Card';
import './DoctorTest.css';

const DoctorTest = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const data = await getAllDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupByDepartment = () => {
        const grouped = {};
        doctors.forEach(doc => {
            if (!grouped[doc.department]) {
                grouped[doc.department] = [];
            }
            grouped[doc.department].push(doc);
        });
        return grouped;
    };

    if (loading) return <div>Loading...</div>;

    const grouped = groupByDepartment();

    return (
        <div className="doctor-test-container">
            <h1>🏥 Doctor Management System</h1>
            <p>Total Doctors: {doctors.length}</p>

            {Object.entries(grouped).map(([department, deptDoctors]) => (
                <Card key={department} className="department-card">
                    <h2>{department}</h2>
                    <p>Total: {deptDoctors.length} doctors</p>
                    <p>Capacity: {deptDoctors.reduce((sum, d) => sum + d.max_appointments_per_day, 0)} appointments/day</p>

                    <div className="doctors-grid">
                        {deptDoctors.map(doctor => (
                            <div
                                key={doctor.id}
                                className={`doctor-card ${doctor.is_backup ? 'backup' : 'regular'}`}
                            >
                                <h3>{doctor.name}</h3>
                                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                <p><strong>Status:</strong>
                                    <span className={`status-badge ${doctor.status.toLowerCase()}`}>
                                        {doctor.status}
                                    </span>
                                </p>
                                <p><strong>Type:</strong> {doctor.is_backup ? '🔄 Backup' : '👨‍⚕️ Regular'}</p>
                                <p><strong>Appointments Today:</strong> {doctor.current_appointments_today} / {doctor.max_appointments_per_day}</p>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${(doctor.current_appointments_today / doctor.max_appointments_per_day) * 100}%`,
                                            backgroundColor: doctor.current_appointments_today >= doctor.max_appointments_per_day ? '#ef4444' : '#10b981'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DoctorTest;
