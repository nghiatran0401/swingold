
import { Button as MuiButton } from '@mui/material';
import { buttonStyles } from '../../styles/common';

/**
 * Reusable Button component with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, success)
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} props.sx - Additional styles
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type
 * @param {Object} props.rest - Additional props
 */
const Button = ({
  variant = 'primary',
  children,
  sx = {},
  disabled = false,
  onClick,
  type = 'button',
  ...rest
}) => {
  const getButtonStyles = () => {
    const baseStyles = buttonStyles[variant] || buttonStyles.primary;
    return {
      ...baseStyles,
      ...sx,
      ...(disabled && {
        background: '#ccc',
        transform: 'none',
        boxShadow: 'none',
        '&:hover': {
          background: '#ccc',
          transform: 'none',
          boxShadow: 'none',
        },
      }),
    };
  };

  return (
    <MuiButton
      disabled={disabled}
      onClick={onClick}
      sx={getButtonStyles()}
      type={type}
      variant={variant === 'primary' || variant === 'success' ? 'contained' : 'outlined'}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
