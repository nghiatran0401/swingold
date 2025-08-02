
import { Paper, Box } from '@mui/material';
import { cardStyles } from '../../styles/common';

/**
 * Reusable Card component with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {Object} props.sx - Additional styles
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.elevation - Paper elevation
 * @param {Object} props.rest - Additional props
 */
const Card = ({
  children,
  sx = {},
  onClick,
  elevation = 0,
  ...rest
}) => {
  return (
    <Paper
      elevation={elevation}
      onClick={onClick}
      sx={{
        ...cardStyles.root,
        ...(onClick && { cursor: 'pointer' }),
        ...sx,
      }}
      {...rest}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default Card;
