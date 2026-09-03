import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function HomeworkResults() {
  const { id, homeworkId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // Default to Kutayotganlar
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [homeworkInfo, setHomeworkInfo] = useState(null);

  const tabs = [
    { label: "Kutayotganlar", status: "PENDING", badgeColor: "#f59e0b" },
    { label: "Qaytarilganlar", status: "REJECTED", badgeColor: "#ef4444" },
    { label: "Qabul qilinganlar", status: "ACCEPTED", badgeColor: "#10b981" },
    { label: "Bajarilmagan", status: null, badgeColor: "#10b981" },
  ];

  useEffect(() => {
    async function fetchHomeworkDetails() {
      try {
        const res = await axiosClient.get(`/homework/${id}`);
        if (res.data?.success) {
          const hw = res.data.data.find(h => h.homework?.[0]?.id === parseInt(homeworkId));
          if (hw) setHomeworkInfo(hw);
        }
      } catch (error) {
        console.error("Error fetching homework details:", error);
      }
    }
    fetchHomeworkDetails();
  }, [id, homeworkId]);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const currentStatus = tabs[tabValue].status;
        const url = `/group/${id}/homework/${homeworkId}/results${currentStatus ? `?status=${currentStatus}` : ""}`;
        const res = await axiosClient.get(url);
        
        if (res.data?.success) {
          if (currentStatus) {
             setStudents(res.data.data.students || []);
          } else {
             setStudents(res.data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id, homeworkId, tabValue]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).replace(/ (\d{4})$/, ", $1") + " " + date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  };

  const getDeadline = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 20);
    return date.toISOString();
  };

  return (
    <Box sx={{ px: { xs: 2, lg: 3 }, py: 2, bgcolor: "white", minHeight: "100vh" }}>
      {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(`/dashboard/groups/${id}?tab=1`)} size="small" sx={{ p: 0.5 }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: "#111827", fontWeight: 700 }} />
          </IconButton>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            {homeworkInfo?.topic || "crm backend homework checking"}
          </Typography>
        </Box>

      {/* Info Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: "#f9fafb", // Very light gray background
          mb: 3,
          display: "flex",
          gap: 15
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 1, fontWeight: 500 }}>Mavzu</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {homeworkInfo?.topic || "crm backend homework checking"}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 1, fontWeight: 500 }}>Tugash vaqti</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {homeworkInfo?.homework?.[0]?.created_at ? formatDate(getDeadline(homeworkInfo.homework[0].created_at)) : "15 May, 2026 07:10"}
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 2, borderBottom: "1px solid #f3f4f6" }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)}
          sx={{
            minHeight: "auto",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              minWidth: "auto",
              mr: 4,
              px: 0,
              py: 1.5,
              "&.Mui-selected": {
                color: "#10b981",
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#10b981",
              height: 2,
            }
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab 
              key={idx} 
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.label}
                  {/* Badge */}
                  {idx === 0 && (
                    <Box sx={{ bgcolor: "#f59e0b", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {homeworkInfo?.homeworkPending || 0}
                    </Box>
                  )}
                  {idx === 1 && (
                    <Box sx={{ bgcolor: "#ef4444", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {homeworkInfo?.homeworkReject || 0}
                    </Box>
                  )}
                  {idx === 2 && (
                    <Box sx={{ bgcolor: "#10b981", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {homeworkInfo?.homeworkAccept || 0}
                    </Box>
                  )}
                  {idx === 3 && (
                    <Box sx={{ bgcolor: "#10b981", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {homeworkInfo ? (homeworkInfo.existStudentsIngroup - (homeworkInfo.homeworkPending + homeworkInfo.homeworkAccept + (homeworkInfo.homeworkReject || 0))) : 0}
                    </Box>
                  )}
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Box>

      {/* Student List */}
      <Box sx={{ minHeight: 400, position: "relative" }}>
        <Box sx={{ py: 2, borderBottom: "1px solid #f3f4f6", display: "flex" }}>
          <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, width: "40%" }}>O'quvchi ismi</Typography>
          {tabValue < 3 && (
            <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, width: "30%", textAlign: "center" }}>Uyga vazifa jo'natilgan vaqt</Typography>
          )}
        </Box>
        
        <Box sx={{ position: "relative" }}>
          {loading ? (
            <Box sx={{ 
              position: "absolute",
              top: 0, left: 0, right: 0,
              display: "flex", pt: 5, justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 1
            }}>
              <CircularProgress size={24} sx={{ color: "#10b981" }} />
            </Box>
          ) : null}

          <Box sx={{ opacity: loading ? 0.3 : 1 }}>
            {students.length > 0 ? (
              students.map((student, idx) => (
                <Box 
                  key={student.id} 
                  sx={{ 
                    py: 2, 
                    borderBottom: "1px solid #f3f4f6",
                    cursor: tabValue < 3 ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center"
                  }}
                  onClick={() => {
                    if (tabValue < 3) {
                      navigate(`/dashboard/groups/${id}/homework/${homeworkId}/result/${student.id}`);
                    }
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "#1e293b", fontWeight: 500, width: "40%" }}>
                    {student.full_name}
                  </Typography>
                  {student.created_at && (
                    <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500, width: "30%", textAlign: "center" }}>
                      {formatDate(student.created_at)}
                    </Typography>
                  )}
                </Box>
              ))
            ) : !loading && (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>Ma'lumot mavjud emas</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


