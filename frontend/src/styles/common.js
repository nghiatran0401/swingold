import { COLORS, ANIMATION } from "../constants";

// Common button styles
export const buttonStyles = {
  primary: {
    background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: COLORS.white,
    borderRadius: "12px",
    textTransform: "none",
    fontFamily: "Poppins",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
    transition: `all ${ANIMATION.NORMAL}ms ease`,
    "&:hover": {
      background: `linear-gradient(45deg, ${COLORS.primaryDark}, ${COLORS.primaryLight})`,
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(255, 0, 30, 0.4)",
    },
  },
  secondary: {
    fontFamily: "Poppins",
    textTransform: "none",
    borderRadius: "12px",
    border: `2px solid ${COLORS.gray[300]}`,
    color: COLORS.gray[600],
    "&:hover": {
      borderColor: COLORS.primary,
      color: COLORS.primary,
    },
  },
  success: {
    background: `linear-gradient(45deg, ${COLORS.success}, #66bb6a)`,
    color: COLORS.white,
    borderRadius: "12px",
    textTransform: "none",
    fontFamily: "Poppins",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
    "&:hover": {
      background: `linear-gradient(45deg, #45a049, ${COLORS.success})`,
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
    },
  },
};

// Common text field styles
export const textFieldStyles = {
  root: {
    fontFamily: "Poppins",
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      fontFamily: "Poppins",
      "& fieldset": {
        borderColor: "rgba(0,0,0,0.2)",
        borderWidth: "2px",
      },
      "&:hover fieldset": {
        borderColor: COLORS.primary,
      },
      "&.Mui-focused fieldset": {
        borderColor: COLORS.primary,
      },
    },
  },
};

// Common dialog styles
export const dialogStyles = {
  paper: {
    borderRadius: "40px",
    backgroundColor: COLORS.white,
    boxShadow: "0 60px 160px rgba(0,0,0,0.25), 0 0 100px rgba(255, 0, 30, 0.2)",
    border: "1px solid rgba(255,255,255,0.4)",
    overflow: "hidden",
    position: "relative",
    maxHeight: "90vh",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,249,255,0.1) 100%)",
      pointerEvents: "none",
      zIndex: 0,
    },
  },
  title: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: COLORS.white,
    fontFamily: "Poppins",
    fontWeight: "900",
    fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
    textAlign: "center",
    py: { xs: 3, sm: 4, md: 5 },
    px: { xs: 4, sm: 5, md: 6 },
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
      opacity: 0.4,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "60px",
      height: "4px",
      background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
      borderRadius: "2px",
    },
  },
  content: {
    py: { xs: 4, sm: 5, md: 6 },
    px: { xs: 3, sm: 4, md: 5 },
    maxHeight: "60vh",
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(0,0,0,0.1)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255, 0, 30, 0.3)",
      borderRadius: "4px",
      "&:hover": {
        background: "rgba(255, 0, 30, 0.5)",
      },
    },
  },
  actions: {
    justifyContent: "center",
    pb: { xs: 4, sm: 5, md: 6 },
    pt: { xs: 2, sm: 3, md: 4 },
    px: { xs: 3, sm: 4, md: 5 },
    gap: { xs: 2, sm: 3 },
  },
};

// Common card styles
export const cardStyles = {
  root: {
    borderRadius: "24px",
    backgroundColor: COLORS.white,
    border: "1px solid #f0f0f0",
    transition: `all ${ANIMATION.NORMAL}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "&:hover": {
      transform: "translateY(-8px) scale(1.02)",
      boxShadow: "0 20px 40px rgba(255, 0, 30, 0.1)",
      borderColor: COLORS.primary,
      "&::before": {
        opacity: 1,
      },
    },
  },
};

// Common hero section styles
export const heroStyles = {
  root: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    height: { xs: "300px", sm: "350px", md: "400px" },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
      opacity: 0.3,
      animation: "float 6s ease-in-out infinite",
      "@keyframes float": {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-10px)" },
      },
    },
  },
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    width: "100%",
    maxWidth: "900px",
    px: { xs: 3, sm: 4, md: 5, lg: 6 },
  },
  title: {
    fontFamily: "Poppins",
    fontWeight: "900",
    color: COLORS.white,
    mb: { xs: 1.5, sm: 2, md: 2.5 },
    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
    textShadow: "0 4px 8px rgba(0,0,0,0.2)",
    letterSpacing: "-0.02em",
    animation: "fadeInUp 0.8s ease-out",
    lineHeight: 1.1,
    "@keyframes fadeInUp": {
      "0%": {
        opacity: 0,
        transform: "translateY(30px)",
      },
      "100%": {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },
  subtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    color: "rgba(255,255,255,0.95)",
    mb: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
    maxWidth: "700px",
    mx: "auto",
    lineHeight: 1.5,
    px: { xs: 2, sm: 3 },
  },
};

// Common floating section styles
export const floatingSectionStyles = {
  root: {
    position: "relative",
    zIndex: 2,
    mt: -8,
    mb: 8,
  },
  paper: {
    backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    p: 4,
    boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(255, 0, 30, 0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    maxWidth: "1200px",
    mx: "auto",
    transition: `all ${ANIMATION.NORMAL}ms ease`,
    "&:hover": {
      boxShadow: "0 25px 80px rgba(0,0,0,0.15), 0 0 60px rgba(255, 0, 30, 0.15)",
    },
  },
};

// Common typography styles
export const typographyStyles = {
  title: {
    fontFamily: "Poppins",
    fontWeight: "700",
    color: COLORS.secondary,
    fontSize: "1.3rem",
    lineHeight: 1.3,
  },
  subtitle: {
    fontFamily: "Poppins",
    color: COLORS.gray[600],
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  body: {
    fontFamily: "Poppins",
    color: COLORS.gray[700],
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
};
