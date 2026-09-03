import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatQuote,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  Link,
  CloudUpload,
} from "@mui/icons-material";

export default function HomeworkCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await axiosClient.get(`/lessons/my/group/${id}`);
        if (res.data?.success) {
          setLessons(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setFetching(false);
      }
    }
    fetchLessons();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePublish = async () => {
    if (!lessonId || !description) {
      setSnackbar({ open: true, message: "Mavzu va izoh kiritilishi shart!", severity: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("lesson_id", lessonId);
    formData.append("group_id", id);
    formData.append("title", description);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
 
    setLoading(true);
    try {
      const res = await axiosClient.post("/homework", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.success || res.status === 201) {
        setSnackbar({ open: true, message: "Uyga vazifa muvaffaqiyatli e'lon qilindi!", severity: "success" });
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      console.error("Error publishing homework:", error);
      const msg = error.response?.data?.message || "Xatolik yuz berdi!";
      setSnackbar({ open: true, message: Array.isArray(msg) ? msg[0] : msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "white", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: "#111827" }}>
          <KeyboardArrowLeft sx={{ fontSize: 24 }} />
        </IconButton>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Yangi uyga vazifa yaratish
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 800 }}>
        {/* Topic Select */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5, display: "flex", gap: 0.5 }}>
            <span style={{ color: "#ef4444" }}>*</span> Mavzu
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              displayEmpty
              disabled={fetching}
              sx={{
                borderRadius: 2,
                bgcolor: "#f9fafb",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                fontSize: 14,
                color: lessonId ? "#111827" : "#94a3b8"
              }}
            >
              <MenuItem value="" disabled>
                {fetching ? "Yuklanmoqda..." : "Mavzulardan birini tanlang"}
              </MenuItem>
              {lessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.topic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Description / Rich Text Mockup */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5, display: "flex", gap: 0.5 }}>
            <span style={{ color: "#ef4444" }}>*</span> Izoh
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: "#e5e7eb", overflow: "hidden" }}>
            {/* Toolbar */}
            <Box sx={{ display: "flex", flexWrap: "wrap", p: 1, gap: 0.5, bgcolor: "white" }}>
              <IconButton size="small"><Typography sx={{ fontSize: 14, fontWeight: 700 }}>H1</Typography></IconButton>
              <IconButton size="small"><Typography sx={{ fontSize: 14, fontWeight: 700 }}>H2</Typography></IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Select size="small" defaultValue="sans" sx={{ height: 32, fontSize: 12, minWidth: 100, "& fieldset": { border: "none" } }}>
                <MenuItem value="sans">Sans Serif</MenuItem>
              </Select>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Select size="small" defaultValue="normal" sx={{ height: 32, fontSize: 12, minWidth: 80, "& fieldset": { border: "none" } }}>
                <MenuItem value="normal">Normal</MenuItem>
              </Select>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <IconButton size="small"><FormatBold sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatItalic sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatUnderlined sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><StrikethroughS sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatQuote sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><Code sx={{ fontSize: 18 }} /></IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <IconButton size="small"><FormatListBulleted sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatListNumbered sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatAlignLeft sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><FormatAlignCenter sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small"><Link sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            <Divider />
            <TextField
              fullWidth
              multiline
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
              variant="standard"
              sx={{
                p: 2,
                "& .MuiInput-root": {
                  fontSize: 14,
                  "&:before, &:after": { display: "none" }
                }
              }}
            />
          </Paper>
        </Box>

        {/* Upload Area */}
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Box
          onClick={triggerFileUpload}
          sx={{
            border: "1px dashed #e5e7eb",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            mb: 4,
            transition: "0.2s",
            "&:hover": { bgcolor: "#f9fafb", borderColor: "#10b981" }
          }}
        >
          {selectedFile ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
                {selectedFile.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 24, color: "#10b981" }} />
              <Typography sx={{ fontSize: 14, color: "#94a3b8" }}>Faylni tanlash yoki shu yerga tashlang</Typography>
            </>
          )}
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              borderColor: "#e5e7eb",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              fontSize: 14,
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" }
            }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              textTransform: "none",
              bgcolor: "#10b981",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              fontSize: 14,
              "&:hover": { bgcolor: "#059669" }
            }}
          >
            {loading ? "E'lon qilinmoqda..." : "E'lon qilish"}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
