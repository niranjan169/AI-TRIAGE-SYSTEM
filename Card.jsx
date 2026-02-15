import './Card.css';

const Card = ({ children, className = '', variant = 'default', hover = false }) => {
    return (
        <div className={`card card-${variant} ${hover ? 'card-hover' : ''} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
