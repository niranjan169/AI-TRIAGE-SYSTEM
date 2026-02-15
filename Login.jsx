import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, Mail, Stethoscope, Users, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { registerUser, loginUser } from '../services/auth';
import './Login.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'patient' // patient or admin
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegister) {
                // REGISTER MODE - Save account to database
                await registerUser({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    role: formData.role
                });

                // Show success and switch to login
                setSuccess('Account created successfully! Please login.');
                setIsRegister(false);
                setFormData({
                    email: formData.email, // Keep email filled
                    password: '',
                    name: '',
                    role: formData.role // Keep role selected
                });

            } else {
                // LOGIN MODE - Verify credentials from database
                const user = await loginUser(
                    formData.email,
                    formData.password,
                    formData.role
                );

                // Login successful
                const userData = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isAuthenticated: true
                };

                localStorage.setItem('user', JSON.stringify(userData));
                onLogin(userData);

                // Navigate based on role
                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/patient');
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-page login-container">
            <div className="login-background">
                <div className="login-glow login-glow-1"></div>
                <div className="login-glow login-glow-2"></div>
                <div className="login-glow login-glow-3"></div>
            </div>

            <Card variant="gradient" className="login-card">
                <div className="login-header">
                    <Stethoscope size={48} className="login-icon" />
                    <h1>MedLink AI Portal</h1>
                    <p>Advanced Medical Assessment System</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="message success-message">
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="message error-message">
                        <span>{error}</span>
                    </div>
                )}

                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-option ${formData.role === 'patient' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'patient' })}
                    >
                        <UserCircle size={24} />
                        <span>Patient</span>
                    </button>
                    <button
                        type="button"
                        className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                    >
                        <Users size={24} />
                        <span>Admin</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label>
                                <UserCircle size={20} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your full name"
                                className="form-input"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            <Mail size={20} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                setError('');
                                setSuccess('');
                            }}
                            placeholder="Enter your email"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Lock size={20} />
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                setError('');
                                setSuccess('');
                            }}
                            placeholder="Enter your password"
                            className="form-input"
                            minLength="6"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        className="login-button"
                    >
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>

                <div className="login-footer">
                    <button
                        type="button"
                        className="toggle-mode"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                            setSuccess('');
                            setFormData({
                                ...formData,
                                password: '',
                                name: ''
                            });
                        }}
                    >
                        {isRegister ? (
                            <>Already have an account? <strong>Sign In</strong></>
                        ) : (
                            <>Don't have an account? <strong>Register</strong></>
                        )}
                    </button>
                </div>

                {/* Demo hint */}
                <div className="demo-hint">
                    <p>💡 Demo: Register with any email/password, then login with same credentials</p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
