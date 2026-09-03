import { useState, useEffect } from "react";
import { getFileUrl } from "../utils/fileUrl";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  GroupWork,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const role = localStorage.getItem("role");
        let endpoint = "/auth/me";
        if (role === "TEACHER") endpoint = "/teachers/my/profile";
        else if (role === "STUDENT") endpoint = "/students/my/profile";

        const res = await axiosClient.get(endpoint);
        if (res?.data?.success) {
          setProfile(res.data.data);
        } else {
          setError("Profil ma'lumotlarini yuklab bo'lmadi.");
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Server bilan bog'lanishda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3.5 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3.5 }}>
        <Alert severity="warning">Profil topilmadi.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      {/* Page Title */}
      <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#111827", mb: 3 }}>
        Profil
      </Typography>

      <Grid container spacing={3}>
        {/* Left column: Avatar and Name */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: 120,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            />
            <CardContent sx={{ pt: 0, textAlign: "center", pb: 4 }}>
              <Avatar
                src={getFileUrl(profile.photo)}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  margin: "-50px auto 16px auto",
                  bgcolor: "#d1fae5",
                  color: "#059669",
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {profile.full_name?.charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                {profile.full_name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
                {profile.role === 'ADMIN' ? "Administrator" : profile.role === 'TEACHER' ? "O'qituvchi" : "Talaba"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Detailed info and Groups */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
              p: 1,
            }}
          >
            <CardContent>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", mb: 2.5 }}>
                Shaxsiy ma'lumotlar
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Email sx={{ color: "#10b981", fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                        Email
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                        {profile.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Phone sx={{ color: "#10b981", fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                        Telefon raqam
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                        {profile.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LocationOn sx={{ color: "#10b981", fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                        Manzil
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                        {profile.address || "Kiritilmagan"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CalendarToday sx={{ color: "#10b981", fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                        Ro'yxatdan o'tgan sana
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString("ru-RU")
                          : "-"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3.5 }} />

              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", mb: 2 }}>
                Guruhlar
              </Typography>

              {profile.groups && profile.groups.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {profile.groups.map((groupName, idx) => (
                    <Chip
                      key={idx}
                      icon={<GroupWork sx={{ fontSize: "16px !important", color: "#059669 !important" }} />}
                      label={groupName}
                      sx={{
                        bgcolor: "#e2f6ec",
                        color: "#059669",
                        fontWeight: 600,
                        fontSize: 13,
                        py: 1.8,
                        px: 0.5,
                        borderRadius: 2,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                  Hozircha guruhlar yo'q.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
