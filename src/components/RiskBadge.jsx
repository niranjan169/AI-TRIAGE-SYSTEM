import './RiskBadge.css';

const RiskBadge = ({ level, score }) => {
    return (
        <div className={`risk-badge risk-${level.toLowerCase()}`}>
            <div className="risk-badge-icon">
                {level === 'High' && '🚨'}
                {level === 'Medium' && '⚠️'}
                {level === 'Low' && '✓'}
            </div>
            <div className="risk-badge-content">
                <div className="risk-badge-level">{level} Risk</div>
                {score && <div className="risk-badge-score">Score: {score}</div>}
            </div>
        </div>
    );
};

export default RiskBadge;
