import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, UserCircle, LogOut } from 'lucide-react';
import './Navigation.css';

const Navigation = ({ user, onLogout }) => {
    const location = useLocation();

    return (
        <nav className="navigation">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    <Stethoscope size={28} />
                    <span>MedLink AI Portal</span>
                </Link>

                <div className="nav-links">
                    {user.role === 'patient' && (
                        <>
                            <Link
                                to="/patient"
                                className={location.pathname === '/patient' ? 'active' : ''}
                            >
                                Patient Dashboard
                            </Link>
                            <Link
                                to="/assessment"
                                className={location.pathname === '/assessment' ? 'active' : ''}
                            >
                                New Assessment
                            </Link>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <Link
                                to="/admin"
                                className={location.pathname === '/admin' ? 'active' : ''}
                            >
                                Admin Dashboard
                            </Link>
                            <Link
                                to="/doctors"
                                className={location.pathname === '/doctors' ? 'active' : ''}
                            >
                                Doctors
                            </Link>
                        </>
                    )}
                </div>

                <div className="nav-user">
                    <div className="user-info">
                        <UserCircle size={20} />
                        <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="logout-button" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
