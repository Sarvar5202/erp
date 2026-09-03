import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getFileUrl } from "../utils/fileUrl";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Paper,
  Divider,
  Collapse,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  BarChart,
  Close,
  Add,
  KeyboardArrowRight,
} from "@mui/icons-material";
import axiosClient from "../api/axios";
import GroupCoursework from "./GroupCoursework";

export default function GroupInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [oneGroup, setOneGroup] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [tabValue, setTabValue] = useState(Number(searchParams.get("tab")) || 0);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [openMentors, setOpenMentors] = useState(true);
  const [openAcademics, setOpenAcademics] = useState(false);
  const [openParams, setOpenParams] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const durationMonth = Object.keys(schedules).length || oneGroup?.course?.duration_month || 0;
 
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => Math.min(durationMonth - 1, prev + 1));
  };

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await axiosClient.get(`/groups/${id}`);
        setOneGroup(res?.data?.data);
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    }
    async function fetchSchedules() {
      try {
        const res = await axiosClient.get(`/groups/${id}/schedules`);
        const rawData = res?.data?.[0] || {};
        setSchedules(rawData);
        // Active oyga o'tish
        const activeMonthKey = Object.keys(rawData).find(k => rawData[k]?.isActive);
        if (activeMonthKey) {
          setCurrentMonthIndex(Number(activeMonthKey) - 1);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    }
    fetchGroup();
    fetchSchedules();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchParams({ tab: newValue });
  };

  // Joriy oy kunlari - API dan (currentMonthIndex + 1 kalit)
  const currentMonthKey = String(currentMonthIndex + 1);
  const currentMonthData = schedules[currentMonthKey] || { isActive: false, days: [] };
  const currentMonthDays = currentMonthData.days || [];

  // Kun o'tganmi yoki yo'qligini tekshirish
  const monthNameToIndex = {
    "January": 0, "February": 1, "March": 2, "April": 3,
    "May": 4, "June": 5, "July": 6, "August": 7,
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  const isPastDay = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lessonDate = new Date(today.getFullYear(), monthNameToIndex[d.month] ?? 0, d.day);
    // Agar oy indeksi bugungi oydan kichik bo'lsa, o'tgan yil emas bu yil hisoblaymiz
    return lessonDate < today;
  };

  // Kunga qarab rang aniqlash
  const getDayStyle = (d) => {
    if (d.isCompleted) return { bgcolor: "#dcfce7", border: "1px solid #86efac", color: "#15803d" };
    if (isPastDay(d)) return { bgcolor: "#e2e8f0", border: "none", color: "#94a3b8" };
    return { bgcolor: "white", border: "1px solid #e5e7eb", color: "#6b7280" };
  };

  const getHoverStyle = (d) => {
    if (d.isCompleted) return { bgcolor: "#bbf7d0", borderColor: "#4ade80" };
    if (isPastDay(d)) return { bgcolor: "#cbd5e1", borderColor: "transparent" };
    return { bgcolor: "#f8fafc", borderColor: "#d1d5db" };
  };

  // To'liq sana hosil qilish (navigate uchun)
  const getFullDate = (d) => {
    const year = new Date().getFullYear();
    const monthIdx = monthNameToIndex[d.month] ?? 0;
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  };

  const renderParameters = () => {
    const params = [
      { label: "Kurs:", value: oneGroup?.course?.name || "Yuklanmoqda..." },
      { label: "O'rta yosh:", value: oneGroup?.averageAge || "0" },
      { label: "O'quvchilar sig'imi:", value: oneGroup?.room_capacity || "0" },
      { label: "Mavjud o'quvchilar:", value: oneGroup?.student_count || "0" },
      { label: "O'quv oyidagi darslar soni:", value: "20" },
      { label: "Kurs davomiyligi (oy):", value: `${oneGroup?.course?.duration_month || 0}.0` },
      { label: "Jami darslar soni:", value: 20 },
    ];
 
    return params.map((param, index) => (
      <Box key={index} sx={{ display: "flex", justifyContent: "space-between", py: 1.2 }}>
        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>{param.label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: param.link ? "#3b82f6" : "#111827", cursor: param.link ? "pointer" : "default" }}>
          {param.value}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ p: { xs: 2, lg: 3 }, pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate("/dashboard/groups")} size="small">
            <KeyboardArrowLeft sx={{ fontSize: 24, color: "#4b5563" }} />
          </IconButton>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
            {oneGroup?.name || "Guruh"}
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.3,
              bgcolor: oneGroup?.status === "planned" ? "#fef3c7" : "#dcfce7",
              color: oneGroup?.status === "planned" ? "#d97706" : "#16a34a",
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
              ml: 1,
              border: `1px solid ${oneGroup?.status === "planned" ? "#fde68a" : "#bbf7d0"}`,
            }}
          >
            {oneGroup?.status === "planned" ? "Kutilmoqda" : "Aktiv"}
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BarChart sx={{ fontSize: 18 }} />}
          sx={{
            borderColor: "#e5e7eb",
            color: "#4b5563",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            bgcolor: "white",
            "&:hover": { bgcolor: "#f3f4f6", borderColor: "#d1d5db" },
          }}
        >
          Statistika
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, px: { xs: 2, lg: 3 } }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
              minHeight: 40,
              px: 2,
            },
            "& .Mui-selected": {
              color: "#7c3aed !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#7c3aed",
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
          }}
        >
          <Tab label="Ma'lumotlar" />
          <Tab label="Guruh darsliklari" />
          <Tab label="Akademik davomati" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ px: 0 }}>
          <Grid container spacing={0}>
            {/* Left Column */}
            <Grid item xs={6} sx={{width: "50%"}}>
            {/* Mentors Card */}
          <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Box sx={{ bgcolor: "#3b82f6", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpenMentors(!openMentors)}>
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>Guruh mentorlari</Typography>
              <IconButton size="small" sx={{ color: "white", p: 0 }}>
                <Close sx={{ fontSize: 18, transform: openMentors ? "rotate(0deg)" : "rotate(45deg)", transition: "0.3s" }} />
              </IconButton>
            </Box>
            <Collapse in={openMentors}>
              <Box sx={{ p: 3, display: "flex", gap: 4, flexWrap: "wrap", bgcolor: "white" }}>
                {/* Main Teacher */}
                {oneGroup?.teachers?.map((teacher, index) => (
                  <Box key={teacher.id || index} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar 
                      src={getFileUrl(teacher.photo) || ""} 
                      sx={{ width: 56, height: 56, bgcolor: "#f0fdf4", color: "#22c55e", mb: 1, border: "2px solid #e5e7eb" }}
                    >
                      {teacher.full_name?.charAt(0)}
                    </Avatar>
                    <Typography sx={{ fontSize: 12, color: "#10b981", fontWeight: 700, mb: 0.5 }}>
                      {"Teacher"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                      {teacher.full_name}
                    </Typography>
                  </Box>
                ))}
                
              </Box>
            </Collapse>
          </Paper>
            </Grid>

        {/* Right Column */}
         <Grid item xs={6} sx={{width: "50%"}}>
          {/* Params Card */} 
          <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Box sx={{ bgcolor: "#3b82f6", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpenParams(!openParams)}>
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>Parametrlar</Typography>
              <IconButton size="small" sx={{ color: "white", p: 0 }}>
                <Close sx={{ fontSize: 18, transform: openParams ? "rotate(0deg)" : "rotate(45deg)", transition: "0.3s" }} />
              </IconButton>
            </Box>
            <Collapse in={openParams}>
              <Box sx={{ p: 2.5, bgcolor: "white" }}>
                {renderParameters()}
              </Box>
            </Collapse>
          </Paper>
         </Grid>
      </Grid> 

      {/* Schedule Section */}
      <Box sx={{ mt: 4, bgcolor: "white", p: 3, borderRadius: 3, border: "1px solid #e5e7eb", mx: { xs: 2, lg: 3 } }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: "#111827" }}>
              Dars jadvali
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              {(oneGroup?.teachers || []).map((teacher, tIdx) => (
                <Box
                  key={teacher.id || tIdx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", width: "25%" }}>
                    {teacher.full_name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                    {Array.isArray(oneGroup?.week_day) ? oneGroup.week_day.map(d => d.slice(0, 2)).join("/") : "Du/Chor/Ju"}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                    {oneGroup?.start_time || "09:00"} dan
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                    {oneGroup?.start_date ? new Date(oneGroup.start_date).toLocaleDateString("uz-UZ") : "15 Yan, 2026"}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#4b5563", width: "15%", textAlign: "right" }}>
                    {oneGroup?.room?.name || "101-xona"}
                  </Typography>
                </Box>
              ))}
              {(!oneGroup?.teachers || oneGroup.teachers.length === 0) && (
                <Box sx={{ p: 2, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                  Jadval ma'lumotlari kiritilmagan
                </Box>
              )}
            </Box>

            {/* Pagination / Months */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <IconButton size="small" sx={{ border: "1px solid #e5e7eb", opacity: currentMonthIndex === 0 ? 0.5 : 1 }} onClick={handlePrevMonth} disabled={currentMonthIndex === 0}>
                <KeyboardArrowLeft fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{currentMonthIndex + 1}-o'quv oyi</Typography>
              <IconButton size="small" sx={{ border: "1px solid #e5e7eb", opacity: currentMonthIndex >= durationMonth - 1 ? 0.5 : 1 }} onClick={handleNextMonth} disabled={currentMonthIndex >= durationMonth - 1}>
                <KeyboardArrowRight fontSize="small" />
              </IconButton>
            </Box>

            {/* Days Timeline */}
            {!showAllMonths ? (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
                  {currentMonthDays.length === 0 && (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Yuklanmoqda...</Typography>
                  )}
                  {currentMonthDays.map((d, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(`/dashboard/groups/${id}/lesson/${getFullDate(d)}`)}
                      sx={{
                        width: 50,
                        py: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "0.2s",
                        ...getDayStyle(d),
                        "&:hover": getHoverStyle(d)
                      }}
                    >
                      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{d.month?.slice(0, 3)}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{d.day}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllMonths(true)}
                    sx={{ borderColor: "#e5e7eb", color: "#4b5563", textTransform: "none", fontSize: 13, borderRadius: 2 }}
                  >
                    Barchasini ko'rish
                  </Button>
                </Box>
              </>
            ) : (
              <Box>
                {Object.entries(schedules).map(([key, monthData]) => (
                  <Box key={key} sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{key}-o'quv oyi</Typography>
                      {monthData.isActive && (
                        <Box sx={{ px: 1, py: 0.2, bgcolor: "#dcfce7", color: "#15803d", borderRadius: 1, fontSize: 11, fontWeight: 700, border: "1px solid #86efac" }}>
                          Joriy oy
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(monthData.days || []).map((d, i) => (
                        <Box
                          key={i}
                          onClick={() => navigate(`/dashboard/groups/${id}/lesson/${getFullDate(d)}`)}
                          sx={{
                            width: 50,
                            py: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            cursor: "pointer",
                            transition: "0.2s",
                            ...getDayStyle(d),
                            "&:hover": getHoverStyle(d)
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{d.month?.slice(0, 3)}</Typography>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{d.day}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllMonths(false)}
                    sx={{ borderColor: "#e5e7eb", color: "#4b5563", textTransform: "none", fontSize: 13, borderRadius: 2 }}
                  >
                    Yopish
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
      {tabValue === 1 && <GroupCoursework />}
      {tabValue === 2 && (
        <Box sx={{ p: { xs: 2, lg: 3 } }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: "#111827" }}>
              Guruh talabalari davomat ko'rsatkichlari
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>#</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Talaba FIO</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Telefon</th>
                    <th style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(oneGroup?.students || []).map((st, idx) => (
                    <tr key={st.id || idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4b5563" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar src={getFileUrl(st.photo) || ""} sx={{ width: 30, height: 30, fontSize: 12 }}>
                            {st.full_name?.charAt(0)}
                          </Avatar>
                          {st.full_name}
                        </Box>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4b5563", textAlign: "center" }}>{st.phone || "—"}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Box component="span" sx={{ px: 1.5, py: 0.3, bgcolor: "#dcfce7", color: "#16a34a", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                          Faol
                        </Box>
                      </td>
                    </tr>
                  ))}
                  {(!oneGroup?.students || oneGroup.students.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                        Talabalar ro'yxati mavjud emas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
    </Box>
  );
}
