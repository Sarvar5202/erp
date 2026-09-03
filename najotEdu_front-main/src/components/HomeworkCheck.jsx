import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Slider,
  TextField,
  Breadcrumbs,
  Link,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";

export default function HomeworkCheck() {
  const { id, homeworkId, studentId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await axiosClient.get(`/group/${id}/homework/${homeworkId}/result/${studentId}`);
        if (res.data?.success) {
          setSubmission(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [id, homeworkId, studentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/group/${id}/homework/${homeworkId}/check`, {
        grade: grade,
        title: feedback || "Checked",
        homework_answer_id: submission?.id
      });
      if (res.data?.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, lg: 4 }, py: 3, bgcolor: "#f3f4f6", minHeight: "100%", display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 840 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<Box sx={{ mx: 0.5 }}>&gt;</Box>} 
          sx={{ mb: 3, "& .MuiBreadcrumbs-separator": { color: "#94a3b8", fontSize: 14 } }}
        >
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={() => navigate(-1)} 
          sx={{ cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#111827" }}
        >
          Kutayotganlar
        </Link>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: "#64748b" }}>
          Uyga vazifa tekshirish
        </Typography>
      </Breadcrumbs>

      {/* Homework Section */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "none", border: "1px solid #e5e7eb", bgcolor: "white" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>Vazifa haqida</Typography>
        <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: 2, border: "1px solid #f3f4f6" }}>
          <Typography sx={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
            {submission?.homework_title || "Uyga vazifa"}
          </Typography>
        </Box>
      </Paper>

      {/* Student Section */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "none", border: "1px solid #e5e7eb", bgcolor: "white" }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 2 }}>
          {submission?.student?.full_name || submission?.students?.full_name || "Talaba"}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 5, mb: 3, bgcolor: "#f9fafb", p: 2, borderRadius: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Topshirilgan vaqt:</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {submission?.submitted_at ? new Date(submission.submitted_at).toLocaleString("uz-UZ") : "—"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Status:</Typography>
            <Box sx={{
              bgcolor: submission?.status === "ACCEPTED" ? "#dcfce7" : submission?.status === "REJECTED" ? "#fee2e2" : "#fffbeb",
              color: submission?.status === "ACCEPTED" ? "#16a34a" : submission?.status === "REJECTED" ? "#ef4444" : "#f59e0b",
              px: 1.5,
              py: 0.4,
              borderRadius: 1,
              fontSize: 12,
              fontWeight: 700,
              display: "inline-block"
            }}>
              {submission?.status === "ACCEPTED" ? "Qabul qilindi" : submission?.status === "REJECTED" ? "Qaytarildi" : "Kutilmoqda"}
            </Box>
          </Box>
        </Box>

        {/* Submitted Text */}
        <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, borderLeft: "4px solid #3b82f6", mb: 3 }}>
          <Typography sx={{ fontSize: 13, color: "#94a3b8", mb: 0.5 }}>Talaba javobi / izohi:</Typography>
          <Typography sx={{ fontSize: 14, color: "#1e293b", fontWeight: 500, whiteSpace: "pre-wrap" }}>
            {submission?.text || "Matn kiritilmagan"}
          </Typography>
        </Box>

        {/* Submitted File */}
        {submission?.file && (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1, fontWeight: 600 }}>Yuklangan fayl:</Typography>
            <Box
              component="a"
              href={`http://localhost:3000/files/${submission.file}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                borderRadius: 2,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid #bfdbfe",
                "&:hover": { bgcolor: "#dbeafe" }
              }}
            >
              📎 {submission.file} (Yuklab olish / Ko'rish)
            </Box>
          </Box>
        )}
      </Paper>

      {/* Grading Section */}
      <Paper sx={{ p: 3, borderRadius: 4, mb: 3, boxShadow: "none", border: "1px solid #e5e7eb" }}>
        <Box sx={{ bgcolor: "#eff6ff", p: 2, borderRadius: 3, display: "flex", gap: 2, alignItems: "center", mb: 4 }}>
          <InfoOutlinedIcon sx={{ color: "#3b82f6" }} />
          <Typography sx={{ fontSize: 14, color: "#1e40af", fontWeight: 500 }}>
            60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 4 }}>Ball</Typography>
        
        <Box sx={{ px: 2, mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Slider
              value={grade}
              onChange={(e, v) => setGrade(v)}
              min={0}
              max={100}
              sx={{
                flex: 1,
                color: "#10b981",
                height: 8,
                "& .MuiSlider-track": { border: "none" },
                "& .MuiSlider-thumb": {
                  width: 24, height: 24, bgcolor: "#fff", border: "2px solid currentColor",
                  "&:hover": { boxShadow: "0 0 0 8px rgba(16, 185, 129, 0.16)" },
                },
                "& .MuiSlider-rail": { opacity: 0.5, bgcolor: "#e2e8f0" },
              }}
            />
            <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, px: 2, py: 1, minWidth: 60, textAlign: "center" }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{grade}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#64748b", mt: 1, textAlign: "center", width: "100%" }}>
            O'tish bali
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Fayllar</Typography>
        <Box sx={{ 
          border: "2px dashed #e2e8f0", borderRadius: 4, py: 5, textAlign: "center", mb: 4,
          bgcolor: "#f8fafc"
        }}>
          <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: "#10b981", mb: 2 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", mb: 1 }}>
            Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
            .jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin
          </Typography>
        </Box>

        <Box sx={{ position: "relative" }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Izohingiz"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4, bgcolor: "#f8fafc",
                "& fieldset": { borderColor: "#f1f5f9" },
                "&:hover fieldset": { borderColor: "#e2e8f0" },
              }
            }}
          />
          <IconButton sx={{ position: "absolute", bottom: 10, right: 10, color: "#10b981", bgcolor: "#ecfdf5" }}>
            <MicNoneOutlinedIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ 
            textTransform: "none", borderRadius: 2.5, px: 4, py: 1.2, borderColor: "#e5e7eb", color: "#64748b",
            "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" }
          }}
        >
          Bekor qilish
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ 
            textTransform: "none", borderRadius: 2.5, px: 4, py: 1.2, bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" }
          }}
        >
          {submitting ? "Yuborilmoqda..." : "Yuborish"}
        </Button>
      </Box>
      </Box>
    </Box>
  );
}
