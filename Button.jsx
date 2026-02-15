import './Button.css';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    fullWidth = false,
    type = 'button'
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
        >
            {children}
        </button>
    );
};

export default Button;
