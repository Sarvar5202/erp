import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import axiosClient from "../api/axios";

export default function VideoUploadModal({ open, onClose, groupId, onSuccess }) {
  const fileInputRef = useRef(null);

  // Holat: "idle" = fayl tanlanmagan, "ready" = fayl tanlangan
  const [files, setFiles] = useState([]); // [{file, lessonId, videoName}]
  const [lessons, setLessons] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Lessons yuklash
  useEffect(() => {
    if (!open) return;
    async function fetchLessons() {
      try {
        const res = await axiosClient.get(`/lessons/my/group/${groupId}`);
        if (res.data?.success) setLessons(res.data.data || []);
      } catch (e) {
        console.error("Lessons fetch error:", e);
      }
    }
    fetchLessons();
  }, [open, groupId]);

  // Modal yopilganda tozalash
  const handleClose = () => {
    setFiles([]);
    setDragging(false);
    onClose();
  };

  // Fayl qo'shish
  const addFiles = (newFiles) => {
    const videoFiles = Array.from(newFiles).filter((f) =>
      ["mp4", "webm", "mov", "avi", "mpeg", "mkv", "m4v", "ogm"].includes(
        f.name.split(".").pop().toLowerCase()
      )
    );
    if (!videoFiles.length) {
      setSnackbar({ open: true, message: "Faqat video formatlar ruxsat etilgan!", severity: "warning" });
      return;
    }
    const mapped = videoFiles.map((file) => ({
      file,
      lessonId: "",
      videoName: file.name,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  // Input orqali tanlash
  const handleInputChange = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  // Drag & Drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  // Fayl o'chirish
  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Fayl maydonlari yangilash
  const updateFile = (idx, key, value) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  // Yuklash
  const handleUpload = async () => {
    // Validatsiya
    const invalid = files.find((f) => !f.lessonId);
    if (invalid) {
      setSnackbar({ open: true, message: "Har bir fayl uchun darsni tanlang!", severity: "warning" });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of files) {
      const formData = new FormData();
      // Originalname sifatida videoName ishlatamiz
      const renamedFile = new File([item.file], item.videoName, { type: item.file.type });
      formData.append("file", renamedFile);

      try {
        await axiosClient.post(
          `/files/group/${groupId}/upload?lessonId=${item.lessonId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        successCount++;
      } catch (e) {
        console.error("Upload error:", e);
        failCount++;
      }
    }

    setUploading(false);

    if (failCount === 0) {
      setSnackbar({ open: true, message: `${successCount} ta video muvaffaqiyatli yuklandi!`, severity: "success" });
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1200);
    } else {
      setSnackbar({
        open: true,
        message: `${successCount} ta yuklandi, ${failCount} ta xatolik!`,
        severity: failCount === files.length ? "error" : "warning",
      });
    }
  };

  const hasFiles = files.length > 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            Qo'shish
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#9ca3af" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Drag & Drop zona */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              border: `2px dashed ${dragging ? "#10b981" : "#e5e7eb"}`,
              borderRadius: 3,
              p: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              cursor: "pointer",
              bgcolor: dragging ? "#f0fdf4" : "#fafafa",
              transition: "0.2s",
              mb: hasFiles ? 3 : 0,
              "&:hover": { borderColor: "#10b981", bgcolor: "#f0fdf4" },
            }}
          >
            {/* Shopping bag icon */}
            <Box
              sx={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="14" width="32" height="28" rx="4" stroke="#10b981" strokeWidth="2.5" fill="none"/>
                <path d="M16 14v-2a8 8 0 0116 0v2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M18 22h12M24 18v8" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Box>

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "center" }}>
              Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
              Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov formatlaridan birida bo'lishi kerak
            </Typography>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            accept=".mp4,.webm,.mov,.avi,.mpeg,.mkv,.m4v,.ogm"
            onChange={handleInputChange}
          />

          {/* Fayl tanlangandan keyin: jadval */}
          {hasFiles && (
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {/* Jadval boshi */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 2fr 56px",
                  px: 2,
                  py: 1.2,
                  bgcolor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>
                  File name
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>
                  <Box component="span" sx={{ color: "#ef4444", mr: 0.3 }}>*</Box>
                  Dars
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>
                  <Box component="span" sx={{ color: "#ef4444", mr: 0.3 }}>*</Box>
                  Video nomi
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563", textAlign: "center" }}>
                  Actions
                </Typography>
              </Box>

              {/* Fayllar satrlari */}
              {files.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 2fr 56px",
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    borderBottom: idx < files.length - 1 ? "1px solid #f3f4f6" : "none",
                    gap: 1.5,
                  }}
                >
                  {/* File name */}
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.file.name}
                  </Typography>

                  {/* Dars tanlash */}
                  <FormControl size="small" fullWidth>
                    <Select
                      value={item.lessonId}
                      onChange={(e) => updateFile(idx, "lessonId", e.target.value)}
                      displayEmpty
                      sx={{
                        fontSize: 13,
                        borderRadius: 1.5,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        color: item.lessonId ? "#111827" : "#9ca3af",
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        Darsni tanlang
                      </MenuItem>
                      {lessons.map((lesson) => (
                        <MenuItem key={lesson.id} value={lesson.id} sx={{ fontSize: 13 }}>
                          {lesson.topic}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Video nomi */}
                  <TextField
                    size="small"
                    value={item.videoName}
                    onChange={(e) => updateFile(idx, "videoName", e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 13,
                        borderRadius: 1.5,
                        "& fieldset": { borderColor: "#e5e7eb" },
                      },
                    }}
                  />

                  {/* O'chirish */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <IconButton
                      size="small"
                      onClick={() => removeFile(idx)}
                      sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444" } }}
                    >
                      <DeleteOutlined sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              fontWeight: 600,
              fontSize: 13,
              px: 2.5,
              borderRadius: 2,
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Bekor qilish
          </Button>

          {hasFiles && (
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={15} color="inherit" /> : null}
              sx={{
                textTransform: "none",
                bgcolor: "#10b981",
                fontWeight: 600,
                fontSize: 13,
                px: 3,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: "#059669", boxShadow: "none" },
              }}
            >
              {uploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
            </Button>
          )}
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ fontWeight: 600, fontSize: 13 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
