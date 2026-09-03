import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import loginImg from '../assets/study.svg';
import logoImg from '../assets/image.png';
import axiosClient from "../api/axios";
import { useNavigate } from "react-router-dom";



export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error"
  });

  const navigate = useNavigate();

  const showAlert = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    if (!login.trim() || !password.trim()) {
      setError("Login va parolni to'liq kiriting!");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", {
        phone: login,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("role", res.data.role);

        setError("");
        showAlert("Muvaffaqiyatli kirdingiz! Yo'naltirilmoqda...", "success");

        // 2 sekunddan keyin dashboard ga o'tish
        setTimeout(() => {
          if (res.data.role === "TEACHER") {
            navigate("/dashboard/groups");
          } else if (res.data.role === "STUDENT") {
            navigate("/dashboard/my-groups");
          } else {
            navigate("/dashboard");
          }
        }, 2000);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Kirishda xatolik yuz berdi. Qayta urinib ko'ring.";
      setError(message);
      showAlert(message, "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden" }}>

      {/* ===== SUCCESS / ERROR SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 280, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ===== LEFT PANEL ===== */}
      <Box
        sx={{
          flex: 1,
          background: "#1a2744",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            left: -80,
            width: "50%",
            height: "50%",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -80,
            right: -60,
            width: "45%",
            height: "45%",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          },
        }}
      >
        <img src={loginImg} alt="logo" />
      </Box>

      {/* ===== RIGHT PANEL ===== */}
      <Box
        sx={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, sm: 6, lg: 10 },
          py: 5,
          overflowY: "auto",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 380,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img src={logoImg} alt="NajotEdu CRM" style={{ width: "260px", marginBottom: "40px", objectFit: "contain" }} />

            <TextField
              fullWidth
              label="Login"
              placeholder="Loginni kiriting"
              variant="outlined"
              size="small"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              sx={{ mb: 2.5 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              fullWidth
              label="Parol"
              placeholder="Parolni kiriting"
              variant="outlined"
              size="small"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: "#1a2744",
                color: "#fff",
                py: 1.3,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: 0.5,
                borderRadius: 1,
                textTransform: "none",
                "&:hover": { background: "#253660" },
                "&:active": { background: "#111c35" },
              }}
            >
              Kirish
            </Button>
          </Box>
        </Box>

        <Typography sx={{ color: "#bbb", fontSize: 11, textAlign: "center", mt: 2 }}>
          Copyright &copy; 2026 NajotEdu CRM
        </Typography>
      </Box>
    </Box>
  );
}