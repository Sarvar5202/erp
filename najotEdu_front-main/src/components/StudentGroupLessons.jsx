import {
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import { getFileUrl } from "../utils/fileUrl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

export default function StudentGroupLessons() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(0); // 0 = Videolar, 1 = Uyga vazifalar

  // Video and Lessons state
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [lessonVideos, setLessonVideos] = useState({});
  const [videosLoading, setVideosLoading] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentLessonName, setCurrentLessonName] = useState("");
  const videoRef = useRef(null);

  // Homework state
  const [homeworkList, setHomeworkList] = useState([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedHw, setSelectedHw] = useState(null);
  const [submitText, setSubmitText] = useState("");
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/groups/${groupId}/lessons`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const filtered = data.filter((l) => l && l.topic);
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setLessons(filtered);

        const firstWithVideo = filtered.find((l) => (l.videoCount ?? 0) > 0);
        if (firstWithVideo) {
          openLesson(firstWithVideo.id, firstWithVideo.topic, filtered);
        }
      } catch (err) {
        console.error("Darslar yuklanmadi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [groupId]);

  const fetchHomework = async () => {
    try {
      setHomeworkLoading(true);
      const res = await axiosClient.get(`/homework/${groupId}`);
      if (res.data?.success) {
        setHomeworkList(res.data.data || []);
      }
    } catch (err) {
      console.error("Uyga vazifalar yuklanmadi:", err);
    } finally {
      setHomeworkLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 1) {
      fetchHomework();
    }
  }, [mainTab, groupId]);

  const fetchVideos = async (lessonId) => {
    if (lessonVideos[lessonId]) return lessonVideos[lessonId];
    setVideosLoading((prev) => ({ ...prev, [lessonId]: true }));
    try {
      const res = await axiosClient.get(`/groups/${groupId}/lessons/${lessonId}/videos`);
      const vids = res.data?.data || [];
      setLessonVideos((prev) => ({ ...prev, [lessonId]: vids }));
      return vids;
    } catch (err) {
      console.error("Videolar yuklanmadi:", err);
      setLessonVideos((prev) => ({ ...prev, [lessonId]: [] }));
      return [];
    } finally {
      setVideosLoading((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  const openLesson = async (lessonId, lessonTopic, allLessons) => {
    const lList = allLessons || lessons;
    const lesson = lList.find((l) => l.id === lessonId);
    if (!lesson || (lesson.videoCount ?? 0) === 0) return;

    setExpandedId(lessonId);
    setCurrentLessonName(lessonTopic);
    const vids = await fetchVideos(lessonId);
    if (vids.length > 0) {
      setCurrentVideo({ url: vids[0].video_url, name: vids[0].originalname });
    }
  };

  const handleAccordionChange = (lessonId, lessonTopic) => (event, isExpanded) => {
    if (isExpanded) {
      openLesson(lessonId, lessonTopic);
    } else {
      setExpandedId(null);
    }
  };

  const handleVideoClick = (vid) => {
    setCurrentVideo({ url: vid.video_url, name: vid.originalname });
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
  };

  const openSubmitDialog = (hw) => {
    setSelectedHw(hw);
    setSubmitText(hw.myAnswer?.text || "");
    setSubmitFile(null);
    setSubmitModalOpen(true);
  };

  const handleSubmitHomework = async () => {
    if (!submitText && !submitFile) {
      setSnackbar({ open: true, message: "Izoh yoki fayl kiriting!", severity: "warning" });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    if (submitText) formData.append("text", submitText);
    if (submitFile) formData.append("file", submitFile);

    try {
      const res = await axiosClient.post(`/homework/${selectedHw.id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setSnackbar({ open: true, message: "Uyga vazifa muvaffaqiyatli topshirildi!", severity: "success" });
        setSubmitModalOpen(false);
        fetchHomework();
      }
    } catch (err) {
      console.error("Vazifa topshirishda xatolik:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Xatolik yuz berdi", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#EEF2F6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Bar with Back button and Tabs */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          px: 3,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/dashboard/my-groups")} size="small" sx={{ color: "#4b5563" }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Guruh darslari
          </Typography>
        </Box>

        <Tabs
          value={mainTab}
          onChange={(e, v) => setMainTab(v)}
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              minHeight: 44,
              px: 3,
              color: "#6b7280",
            },
            "& .Mui-selected": { color: "#d97706 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#d97706", height: 3 },
          }}
        >
          <Tab label="Darslar & Videolar" />
          <Tab label="Uyga vazifalar" />
        </Tabs>
      </Box>

      {/* Main Tab 0: Video Player */}
      {mainTab === 0 && (
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* ── LEFT: Video Player ── */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              p: { xs: 2, md: 3 },
              minWidth: 0,
              overflowY: "auto",
              bgcolor: "#EEF2F6",
            }}
          >
            {currentVideo ? (
              <>
                <Box
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "#000",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    aspectRatio: "16/9",
                  }}
                >
                  <video
                    ref={videoRef}
                    key={currentVideo.url}
                    controls
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                    src={getFileUrl(currentVideo.url)}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    bgcolor: "#fff",
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.5,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                      {currentLessonName}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
                      &nbsp;({currentVideo.name})
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EEF2F6",
                  borderRadius: 3,
                  border: "1.5px dashed #c8d4e0",
                  minHeight: 320,
                  gap: 2,
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 56, color: "#d1d5db" }} />
                <Typography sx={{ fontSize: 15, color: "#9ca3af", fontWeight: 500 }}>
                  Darsni tanlang va videoni ko'ring
                </Typography>
              </Box>
            )}
          </Box>

          {/* ── RIGHT: Lesson List ── */}
          <Box
            sx={{
              width: { xs: "100%", md: 340 },
              minWidth: { md: 300 },
              maxWidth: { md: 380 },
              bgcolor: "#EEF2F6",
              overflowY: "auto",
              height: "100%",
              flexShrink: 0,
              px: 1.5,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {loading ? (
              <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} sx={{ color: "#f59e0b" }} />
              </Box>
            ) : lessons.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Darslar topilmadi</Typography>
              </Box>
            ) : (
              lessons.map((lesson) => {
                const hasVideo = (lesson.videoCount ?? 0) > 0;
                const videos = lessonVideos[lesson.id] || [];
                const vLoading = videosLoading[lesson.id];
                const isExpanded = expandedId === lesson.id;

                if (!hasVideo) {
                  return (
                    <Box
                      key={lesson.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: "#f5ede8",
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#2d1f17", lineHeight: 1.4 }}>
                        {lesson.topic}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9c7b6e", mt: 0.3 }}>
                        Dars sanasi: {formatDate(lesson.created_at)}
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Accordion
                    key={lesson.id}
                    expanded={isExpanded}
                    onChange={handleAccordionChange(lesson.id, lesson.topic)}
                    disableGutters
                    elevation={1}
                    sx={{
                      borderRadius: "12px !important",
                      overflow: "hidden",
                      "&:before": { display: "none" },
                      bgcolor: isExpanded ? "#dba07a" : "#f5ede8",
                      transition: "background 0.2s",
                      boxShadow: isExpanded
                        ? "0 2px 12px rgba(219,160,122,0.25)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{ color: isExpanded ? "#fff" : "#8b6a5a", fontSize: 22 }}
                        />
                      }
                      sx={{
                        px: 2,
                        py: 0.5,
                        minHeight: "auto",
                        bgcolor: "transparent",
                        "& .MuiAccordionSummary-content": { my: 1 },
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isExpanded ? "#fff" : "#2d1f17",
                            lineHeight: 1.4,
                          }}
                        >
                          {lesson.topic}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: isExpanded ? "#ffe0cc" : "#9c7b6e" }}>
                          Dars sanasi: {formatDate(lesson.created_at)}
                        </Typography>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 0, pt: 0, pb: 1, bgcolor: "transparent" }}>
                      {vLoading ? (
                        <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
                          <CircularProgress size={18} sx={{ color: "#fff" }} />
                        </Box>
                      ) : videos.length === 0 ? (
                        <Typography sx={{ fontSize: 12, color: "#fff", px: 2, py: 1 }}>
                          Video topilmadi
                        </Typography>
                      ) : (
                        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1 }}>
                          {videos.map((vid, vIdx) => {
                            const isActive = currentVideo && currentVideo.url === vid.video_url;
                            return (
                              <ListItem
                                key={vid.id}
                                disablePadding
                                onClick={() => handleVideoClick(vid)}
                                sx={{
                                  px: 1.5,
                                  py: 1,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  bgcolor: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                                  transition: "all 0.15s",
                                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                {isActive ? (
                                  <PlayCircleFilledWhiteOutlinedIcon
                                    sx={{ fontSize: 22, color: "#fff", flexShrink: 0 }}
                                  />
                                ) : (
                                  <PanoramaFishEyeIcon
                                    sx={{ fontSize: 22, color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
                                  />
                                )}
                                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", minWidth: 0 }}>
                                  <Typography
                                    component="span"
                                    sx={{ fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}
                                  >
                                    {vIdx + 1}-video:
                                  </Typography>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: 13,
                                      color: "rgba(255,255,255,0.9)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {vid.originalname}
                                  </Typography>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </Box>
        </Box>
      )}

      {/* Main Tab 1: Homework List & Submission */}
      {mainTab === 1 && (
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: "auto" }}>
          <Box sx={{ maxWidth: 960, mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                Guruh uyga vazifalari
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchHomework}
                sx={{ textTransform: "none", color: "#d97706", borderColor: "#fde68a" }}
              >
                Yangilash
              </Button>
            </Box>

            {homeworkLoading ? (
              <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                <CircularProgress sx={{ color: "#d97706" }} />
              </Box>
            ) : homeworkList.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <AssignmentOutlinedIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 1 }} />
                <Typography sx={{ color: "#6b7280", fontSize: 15, fontWeight: 600 }}>
                  Ushbu guruhda hozircha uyga vazifalar yo'q
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {homeworkList.map((hw, idx) => {
                  const ans = hw.myAnswer;
                  const isAccepted = ans?.status === "ACCEPTED";
                  const isRejected = ans?.status === "REJECTED";
                  const isPending = ans?.status === "PENDING";
                  const notSubmitted = !ans;

                  return (
                    <Paper
                      key={hw.id || idx}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        bgcolor: "white",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box>
                          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", mb: 0.5 }}>
                            {hw.topic || hw.title}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                            Berilgan sana: {formatDate(hw.created_at)}
                          </Typography>
                        </Box>

                        {/* Status Badge */}
                        <Box>
                          {notSubmitted && (
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#f3f4f6", color: "#6b7280", borderRadius: 2, fontSize: 12, fontWeight: 700 }}>
                              Topshirilmagan
                            </Box>
                          )}
                          {isPending && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, bgcolor: "#fffbeb", color: "#d97706", borderRadius: 2, fontSize: 12, fontWeight: 700, border: "1px solid #fef3c7" }}>
                              <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} />
                              Kutilmoqda (Tekshiruvda)
                            </Box>
                          )}
                          {isAccepted && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, bgcolor: "#dcfce7", color: "#15803d", borderRadius: 2, fontSize: 12, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                              <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />
                              Qabul qilindi
                            </Box>
                          )}
                          {isRejected && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2, fontSize: 12, fontWeight: 700, border: "1px solid #fecaca" }}>
                              <HighlightOffOutlinedIcon sx={{ fontSize: 14 }} />
                              Qaytarildi
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Homework Description from Teacher */}
                      <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                          {hw.title}
                        </Typography>
                        {hw.file && (
                          <Box sx={{ mt: 1.5 }}>
                            <Box
                              component="a"
                              href={`http://localhost:3000/files/${hw.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 0.8,
                                bgcolor: "white",
                                color: "#2563eb",
                                borderRadius: 1.5,
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: "none",
                                border: "1px solid #e2e8f0",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              📎 O'qituvchi ilova qilgan fayl: {hw.file}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Grade & Feedback section (If checked by Teacher) */}
                      {(isAccepted || isRejected) && (
                        <Box sx={{ bgcolor: isAccepted ? "#f0fdf4" : "#fef2f2", p: 2.5, borderRadius: 2, border: `1px solid ${isAccepted ? '#bbf7d0' : '#fecaca'}`, mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: isAccepted ? "#15803d" : "#b91c1c" }}>
                              Qo'yilgan ball: {ans.grade} / 100
                            </Typography>
                          </Box>
                          {ans.feedback && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>O'qituvchi izohi:</Typography>
                              <Typography sx={{ fontSize: 13, color: "#1e293b", fontWeight: 500, mt: 0.3 }}>
                                {ans.feedback}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Submitted Answer info (if any) */}
                      {ans && (
                        <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2, border: "1px solid #f1f5f9", mb: 2 }}>
                          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Siz yuborgan javob:</Typography>
                          <Typography sx={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" }}>
                            {ans.text || "Matn yo'q"}
                          </Typography>
                          {ans.file && (
                            <Typography sx={{ fontSize: 12, color: "#3b82f6", mt: 1 }}>
                              📎 Fayl: {ans.file}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Action Button */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        {notSubmitted && (
                          <Button
                            variant="contained"
                            onClick={() => openSubmitDialog(hw)}
                            sx={{
                              bgcolor: "#d97706",
                              "&:hover": { bgcolor: "#b45309" },
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 3,
                            }}
                          >
                            Vazifani topshirish
                          </Button>
                        )}
                        {isRejected && (
                          <Button
                            variant="outlined"
                            onClick={() => openSubmitDialog(hw)}
                            sx={{
                              color: "#ef4444",
                              borderColor: "#fca5a5",
                              "&:hover": { bgcolor: "#fef2f2", borderColor: "#ef4444" },
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 3,
                            }}
                          >
                            Qayta topshirish
                          </Button>
                        )}
                        {isPending && (
                          <Button
                            variant="outlined"
                            onClick={() => openSubmitDialog(hw)}
                            sx={{
                              color: "#d97706",
                              borderColor: "#fde68a",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 3,
                            }}
                          >
                            Tahrirlash
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Submit Homework Modal */}
      <Dialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
          Uyga vazifani topshirish
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Mavzu: <strong>{selectedHw?.topic || selectedHw?.title}</strong>
          </Typography>

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Javobingiz / Izohingiz:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Vazifa havolasi (masalan GitHub) yoki bajarilgan ish haqida yozing..."
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Fayl biriktirish (ixtiyoriy):
            </Typography>
            <Box
              component="label"
              sx={{
                border: "2px dashed #e2e8f0",
                borderRadius: 2,
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                bgcolor: "#f8fafc",
                "&:hover": { borderColor: "#d97706", bgcolor: "#fffbeb" },
              }}
            >
              <input
                type="file"
                hidden
                onChange={(e) => setSubmitFile(e.target.files[0])}
              />
              <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: "#d97706", mb: 1 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {submitFile ? submitFile.name : "Faylni tanlash uchun bosing"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.5 }}>
                PDF, ZIP, DOCX, JPG, PNG va boshqalar
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setSubmitModalOpen(false)}
            sx={{ textTransform: "none", color: "#6b7280", fontWeight: 600 }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitHomework}
            disabled={submitting}
            sx={{
              bgcolor: "#d97706",
              "&:hover": { bgcolor: "#b45309" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            {submitting ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
