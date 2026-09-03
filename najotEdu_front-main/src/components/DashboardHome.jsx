import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  School,
  Group,
  CreditCard,
  Warning,
  AcUnit,
  Archive,
  ExpandMore,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 3,
        mb: 1.5,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 2px 12px rgba(124,58,237,0.08)" },
      }}
    >
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "#f9fafb" },
          transition: "background 0.15s",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{title}</Typography>
        <IconButton
          size="small"
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            color: "#6b7280",
          }}
        >
          <ExpandMore />
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2.5, color: "#6b7280", fontSize: 14 }}>
          {children}
        </Box>
      </Collapse>
    </Card>
  );
}

export default function DashboardHome() {
  // Ilgari bu sahifada hammasi (ism, raqamlar) qattiq yozilgan edi va hech qanday
  // API chaqiruvi qilinmasdi — backend ulansa ham bu yerda hech narsa o'zgarmasdi.
  // Endi haqiqiy foydalanuvchi ismi va statistikalar backend'dan olinadi.
  const [fullName, setFullName] = useState("");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setFullName(payload.full_name || "");
      } catch {
        setFullName("");
      }
    }

    async function fetchStats() {
      const role = localStorage.getItem("role");
      // /dashboard/stats faqat ADMIN uchun ochiq (backendda requireRole("ADMIN")).
      // TEACHER/STUDENT shu sahifaga kirsa (masalan Sidebar orqali), 403 olib
      // qolmasligi uchun ularga statistika so'ralmaydi — faqat salomlashuv ko'rsatiladi.
      if (role !== "ADMIN") {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosClient.get("/dashboard/stats");
        if (res.data?.success) {
          setStatsData(res.data.data);
        }
      } catch (err) {
        console.error("Statistikani yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { label: "Faol talabalar", value: statsData?.activeStudents ?? 0, icon: <School />, color: "#7c3aed" },
    { label: "Guruhlar", value: statsData?.groups ?? 0, icon: <Group />, color: "#7c3aed" },
    { label: "Joriy oy to'lovlar", value: statsData?.monthlyPayments ?? 0, icon: <CreditCard />, color: "#7c3aed" },
    { label: "Qarzdorlar", value: statsData?.debtors ?? 0, icon: <Warning />, color: "#7c3aed" },
    { label: "Muzlatilganlar", value: statsData?.frozen ?? 0, icon: <AcUnit />, color: "#7c3aed" },
    { label: "Arxivdagilar", value: statsData?.archived ?? 0, icon: <Archive />, color: "#7c3aed" },
  ];

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Salom{fullName ? `, ${fullName}` : ""}!
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        NajotEdu platformasiga xush kelibsiz!
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Box sx={{ display: "flex", gap: 1.8, mb: 3, width: "100%" }}>
            {stats.map((stat) => (
              <Card
                key={stat.label}
                elevation={0}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(124,58,237,0.12)",
                    transform: "translateY(-2px)",
                  },
                  cursor: "default",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.8,
                    py: "18px !important",
                    px: 2,
                  }}
                >
                  <Box sx={{ color: stat.color, fontSize: 22 }}>{stat.icon}</Box>
                  <Typography
                    sx={{ fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.3 }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Accordion Sections */}
          <AccordionSection title="Joriy oy uchun to'lovlar">
            <Typography>To'lovlar moduli hali ishlab chiqilmagan.</Typography>
          </AccordionSection>

          <AccordionSection title="Yillik Foyda">
            <Typography>Yillik foyda ma'lumotlari hali mavjud emas.</Typography>
          </AccordionSection>

          <AccordionSection title="Dars jadvali">
            <Typography>Dars jadvali hali to'ldirilmagan.</Typography>
          </AccordionSection>
        </>
      )}
    </Box>
  );
}
