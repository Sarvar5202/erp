import { useState,useEffect } from "react";
import { getFileUrl } from "../utils/fileUrl";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  FilterList,
  FileUpload,
  Visibility,
  Close,
  CalendarToday,
  SearchOutlined,
  Add as AddIcon,
  Remove,
  HistoryOutlined,
  Email,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function TeachersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const [selected, setSelected] = useState([]);
  const [phone, setPhone] = useState("+998");
  const [mail, setMail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [photo, setPhoto] = useState("");

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = selected.length > 0 && selected.length === teachers.length;
  const toggleAll = () => {
    setSelected(allSelected ? [] : teachers.map((t) => t.id));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const teachersRes = await axiosClient.get("/teachers");
        if (teachersRes?.data?.success) {
          setTeachers(teachersRes.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    } 
    fetchData();
  }, []);

  async function getGroups() {
    try { 
      const data = await axiosClient.get("/groups/all"); 
      if (data.data?.success) {
        setAllGroups(data.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function createTeacher() {
    if (!fullName || !phone) return;
    try { 
      const fd = new FormData();
      fd.append("full_name", fullName);
      fd.append("phone", phone);
      fd.append("email", mail);
      fd.append("address", address);
      fd.append("password", password || "teacher123");
      if (groups.length) fd.append("groups", groups.map(g => g.id).join(","));
      if (photo) fd.append("photo", photo);

      const res = await axiosClient.post("/teachers", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }); 
      if (res.data?.success) {
        setIsDrawerOpen(false);
        setFullName("");
        setPhone("");
        setMail("");
        setAddress("");
        setPassword("");
        setGroups([]);
        setPhoto("");
        const teachersRes = await axiosClient.get("/teachers");
        if (teachersRes?.data?.success) setTeachers(teachersRes.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  } 

  async function deleteTeacher(id) {
    if (!window.confirm("O'qituvchini o'chirishni xohlaysizmi?")) return;
    try {
      await axiosClient.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  } 


  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box", position: "relative" }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#111827", mb: 0.5 }}>
            O'qituvchilar
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#5b21b6" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
            }}
          >
            O'qituvchi qo'shish
          </Button>
        </Box>
      </Box>

      {/* White Card */}
      <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid #e5e7eb", mt: 2 }}>
        {/* Filters Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {/* Left: Filters + Arxiv yonma-yon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 2,
                borderColor: "#e5e7eb",
                color: "#374151",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 2,
                borderColor: "#e5e7eb",
                color: "#374151",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Arxiv
            </Button>
          </Box>

          {/* Right: Search */}
          <TextField
            size="small"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                bgcolor: "#f9fafb",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
              width: 200,
            }}
          />
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "40px 2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 130px",
            px: 2,
            py: 1,
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
          }}
        >
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={selected.length > 0 && !allSelected}
            onChange={toggleAll}
            sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" }, "&.MuiCheckbox-indeterminate": { color: "#7c3aed" } }}
          />
          {["Nomi ↓", "Guruh", "Telefon raqamlari", "Email", "Manzil", "Yaratilgan sana"].map((col, i) => (
            <Typography
              key={i}
              sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center" }}
            >
              {col}
            </Typography>
          ))}
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "flex-end" }}
          >
            Amallar
          </Typography>
        </Box>

        {/* Table Rows */}
        {teachers.map((teacher, idx) => (
          <Box
            key={teacher.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "40px 2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 130px",
              px: 2,
              py: 1.2,
              borderBottom: "1px solid #f9fafb",
              alignItems: "center",
              "&:hover": { bgcolor: "#fafafa" },
              transition: "background 0.15s",
            }}
          >
            {/* Checkbox */}
            <Checkbox
              size="small"
              checked={selected.includes(teacher.id)}
              onChange={() => toggleSelect(teacher.id)}
              sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" } }}
            />

            {/* Name + Avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={getFileUrl(teacher.photo)}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {teacher.full_name?.charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                {teacher.full_name} 
              </Typography>
            </Box>

            {/* Groups */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, alignItems: "center" }}>
              {teacher.groups?.map((g, gi) => (
                <Chip
                  key={gi}
                  label={g.name || g} // Handle both object and string just in case
                  size="small"
                  sx={{
                    fontSize: 11,
                    height: 20,
                    bgcolor: "#f3f4f6",
                    color: "#374151",
                    "& .MuiChip-label": { px: 0.8 },
                  }}
                />
              ))}

            </Box>

            {/* Phone */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.phone}</Typography>

            {/* Email */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.email}</Typography>

            {/* Address */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.address}</Typography>

            {/* Created Date */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString("ru-RU") : "-"}
            </Typography>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, justifyContent: "flex-end" }}>
  
              <IconButton size="small" sx={{ color: "#6b7280", p: 0.4 }}>
                <Visibility sx={{ fontSize: 16 }} />
              </IconButton>
  
              <IconButton
                size="small"
                onClick={() => deleteTeacher(teacher.id)}
                sx={{ color: "#ef4444", p: 0.4, "&:hover": { bgcolor: "#fee2e2" } }}
              >
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: "#7c3aed", p: 0.4 }}>
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: 13,
              borderRadius: 2,
              borderColor: "#e5e7eb",
              color: "#374151",
            }}
          >
            ← Previous
          </Button>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <Button
                key={i}
                size="small"
                variant={p === page ? "contained" : "text"}
                onClick={() => typeof p === "number" && setPage(p)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  fontSize: 13,
                  borderRadius: 1.5,
                  fontWeight: p === page ? 700 : 400,
                  bgcolor: p === page ? "#7c3aed" : "transparent",
                  color: p === page ? "white" : "#374151",
                  "&:hover": { bgcolor: p === page ? "#5b21b6" : "#f3f4f6" },
                  boxShadow: "none",
                }}
              >
                {p}
              </Button>
            ))}
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: 13,
              borderRadius: 2,
              borderColor: "#e5e7eb",
              color: "#374151",
            }}
          >
            Next →
          </Button>
        </Box>
      </Box>

      {/* ===================== DRAWER MODAL ===================== */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 420 },
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            animation: isDrawerOpen ? "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)" : undefined,
            "@keyframes slideInRight": {
              from: { transform: "translateX(100%)", opacity: 0 },
              to: { transform: "translateX(0)", opacity: 1 },
            },
          },
        }}
        SlideProps={{
          timeout: 300,
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            bgcolor: "white",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              O'qituvchi qo'shish
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.3 }}>
              Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsDrawerOpen(false)}
            size="small"
            sx={{ color: "#6b7280", mt: 0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Telefon raqam */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Telefon raqam
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Mail */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Mail
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Elektron pochtani kiriting"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* O'qituvchi FIO */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              O'qituvchi FIO
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ma'lumotni kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Guruh */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Guruh
            </Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                minHeight: 40,
                "&:hover": { borderColor: "#7c3aed" },
              }}
            >
              {groups.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {groups.map((g, gi) => (
                    <Chip
                      key={gi}
                      label={g.name}
                      size="small"
                      onDelete={() => setGroups(groups.filter((_, i) => i !== gi))}
                      sx={{
                        fontSize: 12,
                        height: 24,
                        bgcolor: "#ede9fe",
                        color: "#7c3aed",
                        "& .MuiChip-deleteIcon": { color: "#7c3aed", fontSize: 14 },
                      }}
                    />
                  ))}
                </Box>
              )}
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={() =>(setIsGroupModalOpen(true),getGroups())}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#7c3aed",
                  minWidth: "auto",
                  p: "4px 8px",
                  "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                }}
              >
                Qo'shish
              </Button>
            </Box>
          </Box>

          {/* Surati */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Surati
            </Typography>
            <Box
              component="label"
              sx={{
                border: "2px dashed #e5e7eb",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                display: "block",
                transition: "border-color 0.2s, bgcolor 0.2s",
                "&:hover": {
                  borderColor: "#7c3aed",
                  bgcolor: "#faf5ff",
                },
              }}
            >
              <input
                type="file"
                hidden
                accept="image/jpeg, image/png"
                onChange={(e) => setPhoto(e.target.files[0])}
              />
              <Box sx={{ fontSize: 28, mb: 1 }}>☁️</Box> 
              <Typography sx={{ fontSize: 12, color: "#374151" }}>
                <span style={{ color: "#7c3aed", fontWeight: 600, cursor: "pointer" }}>
                  Click to upload
                </span>{" "}
                or drag and drop
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.3 }}>
                {photo ? photo.name : "JPG or PNG (max. 800×800px)"}
              </Typography>
            </Box>
          </Box>

          {/* Manzil */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Manzil
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Manzilni kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Parol */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Parol
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>
        </Box>

        {/* Drawer Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            bgcolor: "white",
          }}
        >
          <Button
            variant="text"
            onClick={() => setIsDrawerOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
              borderRadius: 2,
              px: 2.5,
              border: "1px solid #e5e7eb",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
          onClick={createTeacher}
            variant="contained"
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#5b21b6" },
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
            }}
          >
            Saqlash
          </Button>
        </Box>
      </Drawer>
      <Dialog
        open={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              Guruhga biriktirish
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Bir yoki bir nechta guruhni tanlang
            </Typography>
          </Box>
          <IconButton onClick={() => setIsGroupModalOpen(false)} size="small" sx={{ color: "#6b7280" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Guruh qidirish..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
          <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {allGroups
                .filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                .map((g, idx, arr) => {
                  const isChecked = groups.some(selectedGroup => selectedGroup.id === g.id);
                  return (
                    <ListItem
                      key={g.id}
                      disablePadding
                      sx={{
                        borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <Button
                        fullWidth
                        onClick={() => {
                          if (isChecked) {
                            setGroups(groups.filter(sg => sg.id !== g.id));
                          } else {
                            setGroups([...groups, g]);
                          }
                        }}
                        sx={{
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.5,
                          textTransform: "none",
                          color: "#111827",
                          "&:hover": { bgcolor: "#f9fafb" },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0, mr: 1.5, "&.Mui-checked": { color: "#7c3aed" } }}
                        />
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {g.name}
                        </Typography>
                      </Button>
                    </ListItem>
                  );
              })}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsGroupModalOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              borderColor: "#e5e7eb",
              borderRadius: 2,
              px: 2,
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => setIsGroupModalOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#c4b5fd",
              color: "white",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#a78bfa" },
            }}
          >
            Qo'shish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
