import { useState, useEffect, useMemo } from "react";
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
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  FilterList,
  Visibility,
  Close,
  FileUpload,
  Remove,
  FileDownload,
  GroupsOutlined,
  EmojiEvents,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function StudentPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });

  // Form State
  const [phone, setPhone] = useState("+998");
  const [mail, setMail] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axiosClient.get("/students");
        if (res.data?.success) {
          setStudents(res.data.data);
        }
      } catch (error) {
        console.error("Talabalar yuklanmadi:", error);
      }
    }

    async function fetchGroups() {
      try {
        const res = await axiosClient.get("/groups");
        if (res.data?.success) {
          setAllGroups(res.data.data);
        }
      } catch (error) {
        console.error("Guruhlar yuklanmadi:", error);
      }
    }

    fetchStudents();
    fetchGroups();
  }, []);

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = students.length > 0 && selected.length === students.length;
  const toggleAll = () => {
    setSelected(allSelected ? [] : students.map((s) => s.id));
  };

  async function handleCreateStudent() {
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone", phone);
    formData.append("email", mail);
    formData.append("birth_date", birthDate);
    formData.append("address", address); 
    formData.append("password", password);
    if (photo) formData.append("photo", photo);
    formData.append("groups", selectedGroups.map(g => g.id));

    try {
      const res = await axiosClient.post("/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        console.log(res.data.data)
        setIsDrawerOpen(false);
        setStudents((prev) => [...prev, {  
          full_name:fullName, 
          phone, email:mail, 
          birth_date:birthDate,  
          address, photo:null, 
          groups:selectedGroups.map(group => ({
            id: group.id,
            name: group.name
          })),
          created_at:new Date().toISOString()
          }]);
      } else { 
        setAlert({ open: true, message: res.data?.message || "Xatolik yuz berdi", severity: "error" });
      }
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || "Serverda xatolik", severity: "error" });
    }
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm("Talabani o'chirishni xohlaysizmi?")) return;
    try {
      await axiosClient.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setAlert({ open: true, message: "Talaba muvaffaqiyatli o'chirildi", severity: "success" });
    } catch (err) {
      setAlert({ open: true, message: "Talabani o'chirishda xatolik", severity: "error" });
    }
  }

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

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box", bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827", mb: 0.5 }}>
            Talabalar
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
            }}
          >
            Talaba qo'shish
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {/* Filters and Search Row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  width: 240,
                  "& fieldset": { borderColor: "#e5e7eb" },
                },
              }}
            />
          </Box>
          {/* Right: Filters + Arxiv yonma-yon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                textTransform: "none",
                color: "#374151",
                borderColor: "#e5e7eb",
                borderRadius: 2,
                fontSize: 13,
                fontWeight: 500,
                px: 2,
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
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 1fr 1.5fr 1fr 1.2fr 1fr 110px",
            px: 2,
            py: 1,
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#f9fafb",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={selected.length > 0 && !allSelected}
              onChange={toggleAll}
              sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" }, "&.MuiCheckbox-indeterminate": { color: "#7c3aed" } }}
            />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Nomi ↓</Typography>
          </Box>
          {["Guruh", "Telefon raqamlari", "Email", "Tug'ilgan sanasi", "Manzil", "Yaratilgan sana"].map((col) => (
            <Typography key={col} sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {col}
            </Typography>
          ))}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            Amallar
          </Typography>
        </Box>

        {/* Table Rows (Mock or Dynamic) */}
        {students.map((student) => (
          <Box
            key={student.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "200px 1fr 1fr 1.5fr 1fr 1.2fr 1fr 110px",
              px: 2,
              py: 1.2,
              borderBottom: "1px solid #f9fafb",
              alignItems: "center",
              "&:hover": { bgcolor: "#fafafa" },
              transition: "background 0.15s",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Checkbox
                size="small"
                checked={selected.includes(student.id)}
                onChange={() => toggleSelect(student.id)}
                sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" } }}
              />
              <Avatar
                src={getFileUrl(student.photo)}
                sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700 }}
              >
                {student.full_name?.charAt(0) || "Q"}
              </Avatar>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {student.full_name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, alignItems: "center", justifyContent: "center" }}>
              {student.groups?.map((group) => (
                <Chip
                  key={group.id}
                  label={group.name}
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
              {!student.groups?.length && <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Guruh yo'q</Typography>}
            </Box>
            <Typography sx={{ fontSize: 13, color: "#374151", textAlign: "center" }}>
              {student.phone}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis" }}>
              {student.email}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151", textAlign: "center" }}>
              {student.birth_date ? new Date(student.birth_date).toLocaleDateString("ru-RU") : "-"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis" }}>
              {student.address || "-"}
            </Typography> 
            <Typography sx={{ fontSize: 13, color: "#374151", textAlign: "center" }}>
              {student.created_at ? new Date(student.created_at).toLocaleDateString("ru-RU") : "-"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, justifyContent: "flex-end" }}>
              <IconButton size="small" sx={{ color: "#6b7280", p: 0.4 }}>
                <Visibility sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteStudent(student.id)}
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

        {!students.length && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
              Hozircha talabalar yo'q
            </Typography>
          </Box>
        )}

        {/* Pagination Footer */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button variant="outlined" size="small" sx={{ textTransform: "none", color: "#374151", borderColor: "#e5e7eb", borderRadius: 2 }}>
            ← Previous
          </Button>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <Button
                key={i}
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: 1.5,
                  fontSize: 13,
                  fontWeight: p === 1 ? 700 : 400,
                  bgcolor: p === 1 ? "#f3f4f6" : "transparent",
                  color: "#374151",
                }}
              >
                {p}
              </Button>
            ))}
          </Box>
          <Button variant="outlined" size="small" sx={{ textTransform: "none", color: "#374151", borderColor: "#e5e7eb", borderRadius: 2 }}>
            Next →
          </Button>
        </Box>
      </Box>

      {/* ===================== ADD STUDENT DRAWER ===================== */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100vw", sm: 400 }, height: "100vh", display: "flex", flexDirection: "column" },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              Talaba qo'shish
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
              Bu yerda siz yangi Talaba qo'shishingiz mumkin.
            </Typography>
          </Box>
          <IconButton onClick={() => setIsDrawerOpen(false)} size="small" sx={{ color: "#9ca3af" }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Phone */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Telefon raqam</Typography>
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Mail */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Mail</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Elektron pochtani kiriting"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: "#9ca3af" }} /></InputAdornment> }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Full Name */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Talaba FIO</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Ma'lumotni kiriting"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Birth Date */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Tug'ilgan sanasi</Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Address */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Manzil</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Manzilni kiriting"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Password */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Parol</Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Group */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Guruh</Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => (setIsGroupModalOpen(true) , getGroups())}
              startIcon={<Add sx={{ fontSize: 18 }} />}
              sx={{
                textTransform: "none",
                fontSize: 13, 
                fontWeight: 600,
                color: "#7c3aed",
                borderColor: "#e5e7eb",
                borderRadius: 2,
                py: 1.2,
                px: 2,
                justifyContent: "flex-start",
                borderWidth: "1px",
                "&:hover": { bgcolor: "#f5f3ff", borderColor: "#7c3aed", borderWidth: "1px" },
              }}
            >
              Guruh qo'shish
            </Button>
            {selectedGroups.length > 0 && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  bgcolor: "#f9fafb",
                }}
              >
                {selectedGroups.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.name}
                    size="small"
                    onDelete={() => setSelectedGroups((prev) => prev.filter((sg) => sg.id !== g.id))}
                    sx={{ height: 24, fontSize: 11, borderRadius: 1.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Photo Upload */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Surati</Typography>
            <Box
              component="label"
              sx={{
                border: "1px dashed #e5e7eb",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                display: "block",
                "&:hover": { bgcolor: "#f9fafb", borderColor: "#7c3aed" }
              }}
            >
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
              />
              <FileUpload sx={{ fontSize: 24, color: "#9ca3af", mb: 1 }} />
              <Typography sx={{ fontSize: 12, color: "#374151" }}>
                <span style={{ color: "#7c3aed", fontWeight: 600 }}>Click to upload</span> or drag and drop
              </Typography>
              <Typography sx={{ fontSize: 10, color: "#9ca3af", mt: 0.5 }}>
                {photo ? photo.name : "JPG or PNG (max. 2 MB)"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Drawer Footer */}
        <Box sx={{ p: 3, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="text"
            onClick={() => setIsDrawerOpen(false)}
            sx={{ textTransform: "none", color: "#6b7280", fontWeight: 600, fontSize: 13, px: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateStudent}
            sx={{ bgcolor: "#7c3aed", color: "white", "&:hover": { bgcolor: "#6d28d9" }, textTransform: "none", fontWeight: 600, fontSize: 13, px: 3, borderRadius: 2, boxShadow: "none" }}
          >
            Saqlash
          </Button>
        </Box>
      </Drawer>

      {/* Error Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ bgcolor: "#991b1b", color: "white", fontWeight: 600, "& .MuiAlert-icon": { color: "white" } }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      {/* Group Selection Modal */}
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
                  const isChecked = selectedGroups.some(selectedGroup => selectedGroup.id === g.id);
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
                            setSelectedGroups(selectedGroups.filter(sg => sg.id !== g.id));
                          } else {
                            setSelectedGroups([...selectedGroups, g]);
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

