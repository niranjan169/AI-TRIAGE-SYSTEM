import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload, X, Zap, Sparkles, CheckCircle, AlertCircle,
    ArrowLeft, Shield, Brain, Activity, Beaker
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './AILab.css';

const AILab = () => {
    const navigate = useNavigate();
    const [labImage, setLabImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [labResult, setLabResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleLabFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setLabImage(event.target.result);
            setLabResult(null);
            runLabAnalysis();
        };
        reader.readAsDataURL(file);
    };

    const runLabAnalysis = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            const isNormal = Math.random() > 0.5;
            setLabResult({
                status: isNormal ? 'Normal Diagnostic' : 'Abnormality Detected',
                isNormal: isNormal,
                confidence: (85 + Math.random() * 10).toFixed(1),
                recommendation: isNormal
                    ? "Our AI scan shows clear tissue patterns. No infection detected at this time. Maintain standard hygiene and monitor for any changes."
                    : "The AI has flagged potential infection or inflammatory markers in this sample. We highly recommend a professional clinical assessment immediately."
            });
            setIsAnalyzing(false);
        }, 3500);
    };

    return (
        <div className="ai-lab-page">
            <div className="lab-header">
                <button className="back-btn" onClick={() => navigate('/patient')}>
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="header-info">
                    <div className="lab-badge">
                        <Beaker size={16} />
                        Clinical AI Diagnostics
                    </div>
                </div>
            </div>

            <div className="lab-main-hero">
                <h1>MedLink AI Diagnostics Lab.🦾</h1>
                <p>Advanced neural-link image analysis for instantaneous clinical insights.</p>
            </div>

            <div className="lab-content-grid">
                {/* Left: Interactive Upload Section */}
                <Card variant="solid" className="lab-module-card main-upload">
                    <div className="module-title">
                        <Upload size={20} />
                        Data Input Source
                    </div>

                    <div className="premium-upload-area">
                        {!labImage ? (
                            <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                                <div className="radar-circle">
                                    <div className="radar-line"></div>
                                    <ImageIcon size={40} className="radar-icon" />
                                </div>
                                <h3>Upload Clinical Sample</h3>
                                <p>Drag and drop or click to browse (JPG, PNG)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleLabFileUpload}
                                />
                                <Button variant="primary" className="glow-btn">
                                    Select Image
                                </Button>
                            </div>
                        ) : (
                            <div className="active-preview">
                                <img src={labImage} alt="Analysis" className="preview-media" />
                                <div className="preview-overlay">
                                    <button className="change-btn" onClick={() => { setLabImage(null); setLabResult(null); }}>
                                        <X size={20} />
                                        <span>Discard Sample</span>
                                    </button>
                                </div>
                                {isAnalyzing && <div className="scanning-line"></div>}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right: Analysis & Results Section */}
                <Card variant="glass" className="lab-module-card results-module">
                    <div className="module-title">
                        <Activity size={20} />
                        Diagnostic Output
                    </div>

                    <div className="results-wrapper">
                        {!labImage ? (
                            <div className="waiting-state">
                                <Brain size={60} className="pulse-brain" />
                                <h3>Ready for Analysis</h3>
                                <p>System idle. Please provide a clinical image sample on the left to begin the neural scan.</p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="analyzing-state">
                                <div className="dna-loader">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <h3>Analyzing Tissue Layers...</h3>
                                <div className="processing-steps">
                                    <div className="step done"><CheckCircle size={14} /> Noise Reduction</div>
                                    <div className="step processing"><div className="spin-dot"></div> Pattern Matching</div>
                                    <div className="step"><div className="dot"></div> Pathogen Detection</div>
                                </div>
                            </div>
                        ) : labResult ? (
                            <div className={`final-report ${labResult.isNormal ? 'status-safe' : 'status-alert'}`}>
                                <div className="report-header">
                                    <div className="status-icon">
                                        {labResult.isNormal ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                                    </div>
                                    <div className="status-text">
                                        <div className="status-pill">{labResult.status}</div>
                                        <h2>AI Confidence: {labResult.confidence}%</h2>
                                    </div>
                                </div>

                                <div className="report-body">
                                    <div className="recommendation-card">
                                        <h4>Clinical Recommendation:</h4>
                                        <p>{labResult.recommendation}</p>
                                    </div>

                                    {!labResult.isNormal ? (
                                        <div className="action-required">
                                            <p>Urgent triage is recommended based on the detected anomalies.</p>
                                            <Button
                                                variant="danger"
                                                onClick={() => navigate('/assessment')}
                                                className="lab-action-btn"
                                            >
                                                Start Priority Triage
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            onClick={() => { setLabImage(null); setLabResult(null); }}
                                            className="lab-action-btn"
                                        >
                                            New Analysis
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </Card>
            </div>

            {/* Bottom: Technical Details */}
            <div className="lab-footer-stats">
                <div className="tech-chip"><span>Protocol</span> AI-LENS v2.4</div>
                <div className="tech-chip"><span>Processing</span> Neural GPU Core</div>
                <div className="tech-chip"><span>Security</span> HIPAA Compliant</div>
            </div>
        </div>
    );
};

const ImageIcon = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

export default AILab;
