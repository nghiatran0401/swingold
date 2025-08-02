
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Slide,
} from '@mui/material';
import { dialogStyles } from '../../styles/common';
import Button from './Button';

/**
 * Reusable Dialog component with consistent styling
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.children - Dialog content
 * @param {Array} props.actions - Dialog actions
 * @param {Object} props.sx - Additional styles
 * @param {Object} props.rest - Additional props
 */
const Dialog = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  sx = {},
  ...rest
}) => {
  return (
    <MuiDialog
      PaperProps={{
        sx: {
          ...dialogStyles.paper,
          ...sx,
        },
      }}
      TransitionComponent={Slide}
      fullWidth
      keepMounted
      maxWidth="md"
      onClose={onClose}
      open={open}
      {...rest}
    >
      {title && (
        <DialogTitle sx={dialogStyles.title}>
          <Box alignItems="center" display="flex" justifyContent="center">
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '900',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </Typography>
          </Box>
        </DialogTitle>
      )}

      <DialogContent sx={dialogStyles.content}>
        {children}
      </DialogContent>

      {actions.length > 0 && (
        <DialogActions sx={dialogStyles.actions}>
          {actions.map((action, index) => (
            <Button
              disabled={action.disabled}
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'secondary'}
              {...action.props}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </MuiDialog>
  );
};

export default Dialog;
