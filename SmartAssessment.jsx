import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Upload, CheckCircle, AlertCircle, Activity, Heart, Shield, Clock, Calendar, TrendingUp, User } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { performAITriage, assignAppointmentSlot } from '../services/aiTriage';
import { saveAssessment, createAppointment, uploadMedicalDocument } from '../services/database';
import './SmartAssessment.css';

const SYMPTOM_OPTIONS = [
    'Chest Pain', 'Difficulty Breathing', 'Severe Bleeding', 'Loss of Consciousness',
    'Stroke Symptoms', 'Severe Allergic Reaction', 'High Fever', 'Persistent Vomiting',
    'Severe Pain', 'Head Injury', 'Abdominal Pain', 'Confusion', 'Dizziness',
    'Headache', 'Cough', 'Sore Throat', 'Fatigue', 'Nausea', 'Back Pain', 'Joint Pain'
];

const SmartAssessment = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // form, processing, results, appointment
    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        gender: '',
        symptoms: [],
        vitals: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            oxygenLevel: ''
        },
        medicalHistory: '',
        document: null
    });
    const [aiResult, setAiResult] = useState(null);
    const [appointmentData, setAppointmentData] = useState({
        preferredDay: '',
        timeRange: 'Morning (8AM - 12PM)'
    });
    const [appointmentDetails, setAppointmentDetails] = useState(null); // Doctor, queue, estimated time
    const [uploading, setUploading] = useState(false);


    const handleSymptomToggle = (symptom) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const handleVitalChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, [field]: value }
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, document: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStep('processing');

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Perform AI Triage
        const result = performAITriage({
            symptoms: formData.symptoms,
            vitals: formData.vitals,
            medicalHistory: formData.medicalHistory
        });


        setAiResult(result);
        setStep('results');
    };

    const handleScheduleAppointment = async () => {
        try {
            setUploading(true);

            // Get logged-in user's email as patient ID
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            const patientId = user?.email || `guest_${Date.now()}`;

            console.log('🔄 Starting appointment scheduling...');
            console.log('Patient ID (Email):', patientId);
            console.log('Patient Name:', user?.name);
            console.log('Form Data:', formData);
            console.log('AI Result:', aiResult);

            // Upload document if exists
            let documentUrl = null;
            if (formData.document) {
                console.log('📤 Uploading document:', formData.document.name);
                try {
                    const uploadResult = await uploadMedicalDocument(formData.document, patientId);
                    documentUrl = uploadResult.url;
                    console.log('✅ Document uploaded:', documentUrl);
                } catch (uploadError) {
                    console.error('❌ Document upload failed:', uploadError);
                    // Continue even if upload fails
                }
            }

            // Save assessment
            console.log('💾 Saving assessment...');
            const assessmentData = {
                patient_id: patientId,
                patient_name: user?.name || formData.patientName,
                age: parseInt(formData.age),
                gender: formData.gender,
                symptoms: formData.symptoms,
                vitals: formData.vitals,
                medical_history: formData.medicalHistory,
                risk_level: aiResult.riskLevel,
                risk_score: aiResult.riskScore,
                department: aiResult.department,
                confidence: aiResult.confidence,
                reasoning: aiResult.reasoning,
                document_url: documentUrl
            };
            console.log('Assessment data:', assessmentData);

            const assessment = await saveAssessment(assessmentData);
            console.log('✅ Assessment saved:', assessment);

            // Assign appointment slot
            const slot = assignAppointmentSlot(
                appointmentData.preferredDay,
                appointmentData.timeRange,
                aiResult.riskLevel
            );
            console.log('🕐 Assigned slot:', slot);

            // 🏥 SMART DOCTOR ASSIGNMENT
            console.log('👨‍⚕️ Assigning doctor...');
            const { assignDoctor, checkAppointmentConflict, rescheduleIfConflict, calculateEstimatedTime } = await import('../services/doctorScheduling');

            const doctorAssignment = await assignDoctor(
                aiResult.department,
                appointmentData.preferredDay,
                aiResult.riskLevel
            );

            if (!doctorAssignment.doctor) {
                throw new Error(doctorAssignment.alert || 'No doctors available');
            }

            console.log('✅ Doctor assigned:', doctorAssignment.doctor.name);

            // Create initial appointment payload
            let appointmentPayload = {
                patient_id: patientId,
                assessment_id: assessment.id,
                patient_name: user?.name || formData.patientName,
                appointment_date: appointmentData.preferredDay,
                appointment_slot: slot,
                time_range: appointmentData.timeRange,
                department: aiResult.department,
                risk_level: aiResult.riskLevel,
                priority_score: aiResult.riskScore,
                status: 'pending',
                doctor_id: doctorAssignment.doctor.id,
                doctor_name: doctorAssignment.doctor.name
            };

            // 🔍 CHECK FOR CONFLICTS
            const hasConflict = await checkAppointmentConflict(
                patientId,
                appointmentData.preferredDay,
                slot
            );

            if (hasConflict) {
                console.log('⚠️ Appointment conflict detected! Rescheduling...');
                appointmentPayload = await rescheduleIfConflict(appointmentPayload);

                if (appointmentPayload.rescheduled) {
                    alert(`⚠️ You already have an appointment at ${appointmentPayload.original_slot}.\nRescheduled to: ${appointmentPayload.appointment_slot}`);
                }
            }

            // 📊 CALCULATE QUEUE POSITION & ESTIMATED TIME
            // Get count of pending appointments for same department on same day
            const { getAppointments } = await import('../services/database');
            const existingAppointments = await getAppointments({
                department: aiResult.department,
                status: 'pending'
            });

            const queuePosition = existingAppointments.filter(apt =>
                apt.appointment_date === appointmentData.preferredDay &&
                apt.priority_score >= aiResult.riskScore
            ).length + 1;

            const estimatedTime = calculateEstimatedTime(queuePosition, aiResult.riskLevel);

            appointmentPayload.queue_position = queuePosition;
            appointmentPayload.estimated_time = estimatedTime;
            appointmentPayload.waiting_time_minutes = parseInt(estimatedTime);

            console.log('📋 Final appointment payload:', appointmentPayload);

            // Show alert if backup doctor was assigned
            if (doctorAssignment.alert) {
                alert(`⚠️ ${doctorAssignment.alert}`);
            }

            // Create appointment
            console.log('📅 Creating appointment...');
            await createAppointment(appointmentPayload);
            console.log('✅ Appointment created successfully!');

            // Store appointment details for display
            setAppointmentDetails({
                doctor: doctorAssignment.doctor,
                queuePosition,
                estimatedTime,
                rescheduled: appointmentPayload.rescheduled,
                originalSlot: appointmentPayload.original_slot
            });

            setStep('appointment');
        } catch (error) {
            console.error('❌ ERROR DETAILS:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            // Show detailed error to user
            let errorMessage = 'Error scheduling appointment. ';

            if (error.message.includes('relation') || error.message.includes('does not exist')) {
                errorMessage += '\n\n⚠️ DATABASE TABLES NOT CREATED!\n\n';
                errorMessage += 'Please follow these steps:\n';
                errorMessage += '1. Open: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql\n';
                errorMessage += '2. Copy all SQL from SETUP_DATABASE.sql file\n';
                errorMessage += '3. Paste and click RUN\n';
                errorMessage += '4. Create storage bucket "medical-documents"\n';
                errorMessage += '5. Try again!';
            } else if (error.message.includes('storage')) {
                errorMessage += '\n\n⚠️ STORAGE BUCKET NOT CREATED!\n\n';
                errorMessage += 'Please create the storage bucket:\n';
                errorMessage += '1. Go to: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/storage/buckets\n';
                errorMessage += '2. Click "New bucket"\n';
                errorMessage += '3. Name: medical-documents\n';
                errorMessage += '4. Make it PUBLIC\n';
                errorMessage += '5. Try again!';
            } else {
                errorMessage += error.message;
            }

            alert(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    if (step === 'processing') {
        return (
            <div className="smart-assessment-page assessment-container">
                <Card variant="gradient" className="processing-card">
                    <Brain size={64} className="processing-icon" />
                    <h2>AI Analysis in Progress</h2>
                    <p>Our advanced AI is analyzing your symptoms and vitals...</p>
                    <LoadingSpinner size="large" message="" />
                </Card>
            </div>
        );
    }

    if (step === 'results') {
        return (
            <div className="smart-assessment-page assessment-container">
                <Card variant="gradient" className="results-card">
                    <div className="results-header">
                        <Brain size={48} className="results-icon" />
                        <h1>MedLink Triage Results</h1>
                    </div>

                    <div className="results-content">
                        <div className="result-item">
                            <label>Risk Assessment</label>
                            <RiskBadge level={aiResult.riskLevel} score={aiResult.riskScore} />
                        </div>

                        <div className="result-item">
                            <label>Recommended Department</label>
                            <div className="department-badge">{aiResult.department}</div>
                        </div>

                        <div className="result-item">
                            <label>Confidence Score</label>
                            <div className="confidence-bar">
                                <div
                                    className="confidence-fill"
                                    style={{ width: `${aiResult.confidence}%` }}
                                >
                                    {aiResult.confidence}%
                                </div>
                            </div>
                        </div>

                        <div className="result-item">
                            <label>AI Reasoning</label>
                            <div className="reasoning-box">
                                <p>{aiResult.reasoning}</p>
                            </div>
                        </div>
                    </div>

                    <div className="auto-decision-panel">
                        <h3>Recommended Action</h3>
                        {aiResult.riskLevel === 'High' && (
                            <div className="decision-high">
                                <AlertCircle size={24} />
                                <div>
                                    <strong>Emergency Attention Required</strong>
                                    <p>You will be placed in priority queue with earliest available slot</p>
                                </div>
                            </div>
                        )}
                        {aiResult.riskLevel === 'Medium' && (
                            <div className="decision-medium">
                                <CheckCircle size={24} />
                                <div>
                                    <strong>Urgent Consultation Recommended</strong>
                                    <p>You will be scheduled for next available appointment</p>
                                </div>
                            </div>
                        )}
                        {aiResult.riskLevel === 'Low' && (
                            <div className="decision-low">
                                <CheckCircle size={24} />
                                <div>
                                    <strong>Routine Appointment Suggested</strong>
                                    <p>You can schedule at your convenience</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="appointment-scheduler">
                        <h3>Schedule Your Appointment</h3>
                        <div className="scheduler-form">
                            <div className="form-group">
                                <label>Preferred Day</label>
                                <input
                                    type="date"
                                    value={appointmentData.preferredDay}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        preferredDay: e.target.value
                                    }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Time Range</label>
                                <select
                                    value={appointmentData.timeRange}
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        timeRange: e.target.value
                                    }))}
                                    className="form-select"
                                >
                                    <option>Morning (8AM - 12PM)</option>
                                    <option>Afternoon (12PM - 4PM)</option>
                                    <option>Evening (4PM - 8PM)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/patient')}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleScheduleAppointment}
                            disabled={!appointmentData.preferredDay || uploading}
                        >
                            {uploading ? 'Scheduling...' : 'Confirm Appointment'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (step === 'appointment') {
        return (
            <div className="smart-assessment-page assessment-container">
                <Card variant="gradient" className="success-card">
                    <CheckCircle size={64} className="success-icon" />
                    <h1>Appointment Confirmed!</h1>
                    <p className="success-message">
                        Your clinical assessment has been processed. A specialist has been assigned to your case.
                    </p>

                    <div className="confirmation-details">
                        <div className="conf-item">
                            <User size={20} />
                            <div>
                                <span>Assigned Specialist</span>
                                <strong>{appointmentDetails?.doctor?.name}</strong>
                            </div>
                        </div>
                        <div className="conf-item">
                            <Clock size={20} />
                            <div>
                                <span>Estimated Wait Time</span>
                                <strong>{appointmentDetails?.estimatedTime}</strong>
                            </div>
                        </div>
                        <div className="conf-item">
                            <TrendingUp size={20} />
                            <div>
                                <span>Queue Position</span>
                                <strong>#{appointmentDetails?.queuePosition}</strong>
                            </div>
                        </div>
                    </div>

                    {appointmentDetails?.rescheduled && (
                        <div className="reschedule-alert">
                            <AlertCircle size={16} />
                            <span>Note: Your appointment was adjusted to {appointmentDetails?.doctor?.name}'s next available slot to avoid conflicts.</span>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="large"
                        onClick={() => navigate('/patient')}
                        className="return-btn"
                    >
                        Return to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }


    return (
        <div className="smart-assessment-page assessment-container">
            <Card variant="gradient" className="assessment-card">
                <div className="assessment-header">
                    <Brain size={48} className="header-icon" />
                    <h1>MedLink AI Smart Assessment</h1>
                    <p>Complete this form for instant clinical-grade triage and priority scheduling</p>
                </div>

                <form onSubmit={handleSubmit} className="assessment-form">
                    {/* Patient Information */}
                    <div className="form-section">
                        <h2 className="section-title">Patient Information</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.patientName}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        patientName: e.target.value
                                    }))}
                                    className="form-input"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Age *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.age}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        age: e.target.value
                                    }))}
                                    className="form-input"
                                    placeholder="Age"
                                    min="0"
                                    max="150"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender *</label>
                                <select
                                    required
                                    value={formData.gender}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        gender: e.target.value
                                    }))}
                                    className="form-select"
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div className="form-section">
                        <h2 className="section-title">Symptoms *</h2>
                        <p className="section-description">Select all symptoms you are experiencing</p>
                        <div className="symptoms-grid">
                            {SYMPTOM_OPTIONS.map(symptom => (
                                <label key={symptom} className="symptom-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.symptoms.includes(symptom)}
                                        onChange={() => handleSymptomToggle(symptom)}
                                    />
                                    <span className="checkbox-label">{symptom}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="form-section">
                        <h2 className="section-title">Vital Signs</h2>
                        <p className="section-description">Optional but recommended for accurate assessment</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Blood Pressure</label>
                                <input
                                    type="text"
                                    value={formData.vitals.bloodPressure}
                                    onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                                    className="form-input"
                                    placeholder="120/80"
                                />
                            </div>
                            <div className="form-group">
                                <label>Heart Rate (bpm)</label>
                                <input
                                    type="number"
                                    value={formData.vitals.heartRate}
                                    onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                                    className="form-input"
                                    placeholder="72"
                                />
                            </div>
                            <div className="form-group">
                                <label>Temperature (°F)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.vitals.temperature}
                                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                                    className="form-input"
                                    placeholder="98.6"
                                />
                            </div>
                            <div className="form-group">
                                <label>Oxygen Level (%)</label>
                                <input
                                    type="number"
                                    value={formData.vitals.oxygenLevel}
                                    onChange={(e) => handleVitalChange('oxygenLevel', e.target.value)}
                                    className="form-input"
                                    placeholder="98"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="form-section">
                        <h2 className="section-title">Medical History</h2>
                        <div className="form-group">
                            <label>Previous Conditions, Medications, Allergies</label>
                            <textarea
                                value={formData.medicalHistory}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    medicalHistory: e.target.value
                                }))}
                                className="form-textarea"
                                placeholder="Describe any relevant medical history..."
                                rows="4"
                            />
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="form-section">
                        <h2 className="section-title">Medical Documents</h2>
                        <label htmlFor="file-upload" className="upload-area">
                            <Upload size={32} />
                            <span className="upload-label">
                                {formData.document ? formData.document.name : 'Click to upload medical documents'}
                            </span>
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileUpload}
                                className="file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </label>
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/patient')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            disabled={formData.symptoms.length === 0}
                        >
                            Submit for AI Analysis
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


export default SmartAssessment;
