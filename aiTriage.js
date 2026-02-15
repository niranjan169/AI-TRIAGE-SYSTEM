// AI Triage Service - Intelligent medical triage analysis

export const performAITriage = (assessmentData) => {
    const { symptoms, vitals, medicalHistory } = assessmentData;

    // Calculate risk score based on symptoms and vitals
    let riskScore = 0;
    let reasoning = [];
    let detectedIssues = [];

    // Normalize symptoms for comparison (lowercase, trim)
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

    // Critical/High-risk symptoms (60+ points)
    const criticalSymptoms = {
        'chest pain': 70,
        'difficulty breathing': 65,
        'severe bleeding': 75,
        'loss of consciousness': 80,
        'stroke symptoms': 85,
        'severe allergic reaction': 70
    };

    // Urgent/Medium-risk symptoms (30-50 points)
    const urgentSymptoms = {
        'high fever': 35,
        'persistent vomiting': 30,
        'severe pain': 40,
        'head injury': 45,
        'abdominal pain': 35,
        'confusion': 40
    };

    // Moderate symptoms (10-25 points)
    const moderateSymptoms = {
        'dizziness': 15,
        'headache': 12,
        'cough': 10,
        'sore throat': 10,
        'fatigue': 12,
        'nausea': 15,
        'back pain': 18,
        'joint pain': 15
    };

    // Analyze symptoms
    let symptomScore = 0;
    let highestSymptomScore = 0;
    let criticalFound = false;
    let urgentFound = false;

    normalizedSymptoms.forEach(symptom => {
        // Check critical symptoms
        Object.entries(criticalSymptoms).forEach(([key, score]) => {
            if (symptom.includes(key) || key.includes(symptom)) {
                symptomScore = Math.max(symptomScore, score);
                highestSymptomScore = Math.max(highestSymptomScore, score);
                detectedIssues.push(`Critical symptom: ${symptoms.find(s => s.toLowerCase().includes(key))}`);
                criticalFound = true;
            }
        });

        // Check urgent symptoms
        Object.entries(urgentSymptoms).forEach(([key, score]) => {
            if (symptom.includes(key) || key.includes(symptom)) {
                symptomScore = Math.max(symptomScore, score);
                highestSymptomScore = Math.max(highestSymptomScore, score);
                detectedIssues.push(`Urgent symptom: ${symptoms.find(s => s.toLowerCase().includes(key))}`);
                urgentFound = true;
            }
        });

        // Check moderate symptoms
        Object.entries(moderateSymptoms).forEach(([key, score]) => {
            if (symptom.includes(key) || key.includes(symptom)) {
                if (!criticalFound && !urgentFound) {
                    symptomScore = Math.max(symptomScore, score);
                    highestSymptomScore = Math.max(highestSymptomScore, score);
                }
            }
        });
    });

    riskScore += symptomScore;

    // Add reasoning based on symptoms
    if (criticalFound) {
        reasoning.push('Critical symptoms detected requiring immediate medical attention');
    } else if (urgentFound) {
        reasoning.push('Urgent symptoms requiring prompt evaluation');
    } else if (highestSymptomScore > 0) {
        reasoning.push('Symptoms suggest medical consultation is recommended');
    } else {
        reasoning.push('General symptoms noted');
    }

    // Evaluate vital signs
    let vitalIssues = 0;

    if (vitals.bloodPressure) {
        const bpMatch = vitals.bloodPressure.match(/(\d+)\s*\/\s*(\d+)/);
        if (bpMatch) {
            const systolic = parseInt(bpMatch[1]);
            const diastolic = parseInt(bpMatch[2]);

            if (systolic >= 180 || diastolic >= 120) {
                riskScore += 30;
                vitalIssues++;
                reasoning.push('Hypertensive crisis detected');
                detectedIssues.push(`Blood pressure critically high: ${vitals.bloodPressure}`);
            } else if (systolic < 90 || diastolic < 60) {
                riskScore += 25;
                vitalIssues++;
                reasoning.push('Hypotension detected');
                detectedIssues.push(`Blood pressure critically low: ${vitals.bloodPressure}`);
            } else if (systolic >= 140 || diastolic >= 90) {
                riskScore += 10;
                reasoning.push('Elevated blood pressure noted');
            }
        }
    }

    if (vitals.heartRate) {
        const hr = parseInt(vitals.heartRate);
        if (!isNaN(hr)) {
            if (hr > 120) {
                riskScore += 20;
                vitalIssues++;
                reasoning.push('Tachycardia detected');
                detectedIssues.push(`Heart rate elevated: ${hr} bpm`);
            } else if (hr < 50) {
                riskScore += 20;
                vitalIssues++;
                reasoning.push('Bradycardia detected');
                detectedIssues.push(`Heart rate low: ${hr} bpm`);
            } else if (hr > 100 || hr < 60) {
                riskScore += 8;
                reasoning.push('Heart rate slightly abnormal');
            }
        }
    }

    if (vitals.temperature) {
        const temp = parseFloat(vitals.temperature);
        if (!isNaN(temp)) {
            if (temp >= 104) {
                riskScore += 25;
                vitalIssues++;
                reasoning.push('Temperature critically high');
                detectedIssues.push(`Fever: ${temp}°F`);
            } else if (temp < 95) {
                riskScore += 25;
                vitalIssues++;
                reasoning.push('Temperature critically low');
                detectedIssues.push(`Hypothermia risk: ${temp}°F`);
            } else if (temp >= 100.4) {
                riskScore += 12;
                reasoning.push('Fever detected');
            }
        }
    }

    if (vitals.oxygenLevel) {
        const o2 = parseInt(vitals.oxygenLevel);
        if (!isNaN(o2)) {
            if (o2 < 90) {
                riskScore += 35;
                vitalIssues++;
                reasoning.push('Dangerously low oxygen saturation');
                detectedIssues.push(`Oxygen level critical: ${o2}%`);
            } else if (o2 < 95) {
                riskScore += 15;
                reasoning.push('Below normal oxygen saturation');
            }
        }
    }

    // Medical history consideration
    if (medicalHistory && medicalHistory.trim().length > 50) {
        riskScore += 5;
        reasoning.push('Complex medical history noted');
    }

    // Multiple symptoms increase risk
    if (normalizedSymptoms.length >= 4) {
        riskScore += 10;
        reasoning.push('Multiple concurrent symptoms');
    }

    // Determine final risk level and department
    let riskLevel, department, confidence;

    if (riskScore >= 70) {
        riskLevel = 'High';
        department = 'Emergency Department';
        confidence = Math.min(95, 80 + Math.floor((riskScore - 70) / 3));
    } else if (riskScore >= 35) {
        riskLevel = 'Medium';
        department = 'Urgent Care';
        confidence = Math.min(90, 75 + Math.floor((riskScore - 35) / 2));
    } else {
        riskLevel = 'Low';
        department = 'General Practice';
        confidence = Math.min(85, 70 + Math.floor(riskScore / 2));
    }

    // Build detailed reasoning
    let finalReasoning = reasoning[0];
    if (detectedIssues.length > 0) {
        finalReasoning += '. ' + detectedIssues.slice(0, 3).join('. ');
    }
    if (reasoning.length > 1) {
        finalReasoning += '. ' + reasoning.slice(1).join('. ');
    }

    return {
        riskLevel,
        riskScore: Math.min(100, Math.round(riskScore)),
        department,
        confidence: Math.round(confidence),
        reasoning: finalReasoning + '.',
        timestamp: new Date().toISOString()
    };
};

// Smart appointment slot assignment
export const assignAppointmentSlot = (preferredDay, timeRange, riskLevel, existingAppointments = []) => {
    const slots = generateTimeSlots(timeRange);
    const availableSlots = slots.filter(slot =>
        !existingAppointments.some(apt => apt.slot === slot)
    );

    if (availableSlots.length === 0) {
        return slots[0]; // Return first slot if all taken
    }

    // Priority logic
    if (riskLevel === 'High') {
        return availableSlots[0]; // Earliest available
    } else if (riskLevel === 'Medium') {
        const index = Math.min(1, availableSlots.length - 1);
        return availableSlots[index]; // Second earliest
    } else {
        const index = Math.floor(availableSlots.length / 2);
        return availableSlots[index]; // Middle slot
    }
};

const generateTimeSlots = (timeRange) => {
    const ranges = {
        'Morning (8AM - 12PM)': ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
        'Afternoon (12PM - 4PM)': ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'],
        'Evening (4PM - 8PM)': ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']
    };
    return ranges[timeRange] || ranges['Morning (8AM - 12PM)'];
};

// Calculate severity score for queue sorting
export const calculateSeverityScore = (assessment, waitingMinutes) => {
    const riskMultiplier = {
        'High': 100,
        'Medium': 50,
        'Low': 20
    };

    const baseScore = riskMultiplier[assessment.risk_level || assessment.riskLevel] || 20;
    const timeBonus = Math.floor(waitingMinutes / 5); // +1 point per 5 minutes

    return baseScore + timeBonus;
};

// Auto-assign doctor based on least load
export const assignDoctor = (doctors, currentAssignments) => {
    const doctorLoads = doctors.map(doctor => ({
        ...doctor,
        currentLoad: currentAssignments.filter(a => a.doctorId === doctor.id).length
    }));

    doctorLoads.sort((a, b) => a.currentLoad - b.currentLoad);
    return doctorLoads[0];
};
