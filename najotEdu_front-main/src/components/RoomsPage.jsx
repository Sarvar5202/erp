import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  Drawer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Refresh,
  Close,
} from "@mui/icons-material";
import ManagementTabs from "./ManagementTabs";
import axiosClient from "../api/axios";

export default function RoomsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getRooms = async () => {
    try {
      const res = await axiosClient.get("/rooms");
      if (res.status === 200) {
        setRooms(res.data.data);
      }
    } catch (error) {
      console.error("Xonalar yuklanmadi:", error);
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  const handleAddOpen = () => {
    setRoomName('');
    setCapacity('');
    setEditId(null);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setRoomName('');
    setCapacity('');
    setEditId(null);
    setIsDrawerOpen(false);
  };

  const handleEditOpen = async (id) => {
    try {
      const res = await axiosClient.get(`/rooms/one/${id}`);
      if (res.data?.success) {
        setRoomName(res.data.data.name);
        setCapacity(res.data.data.capacity);
        setEditId(id);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error("Xona ma'lumotlari olinmadi:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        const res = await axiosClient.patch(`/rooms/${editId}`, {
          name: roomName,
          capacity: Number(capacity),
        });
        if (res.data?.success) {
          handleClose();
          getRooms();
        }
      } else {
        const res = await axiosClient.post("/rooms", {
          name: roomName,
          capacity: Number(capacity),
        });
        if (res.status === 201 || res.data?.success) {
          handleClose();
          getRooms();
        }
      }
    } catch (error) {
      console.error("Xona saqlanmadi:", error);
    }
  };

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axiosClient.delete(`/rooms/${deleteId}`);
      if (res.data?.success) {
        handleDeleteClose();
        getRooms();
      }
    } catch (error) {
      console.error("Xona o'chirilmadi:", error);
    }
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      {/* Title */}
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1, color: "#111827" }}>
        Boshqarish
      </Typography>

      {/* Management Tabs */}
      <ManagementTabs />

      {/* Xonalar Section Wrapper */}
      <Box sx={{ bgcolor: "white", borderRadius: 3, p: 3, border: "1px solid #e5e7eb" }}>
        {/* Xonalar Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Xonalar</Typography>
          <IconButton onClick={getRooms} size="small" sx={{ color: "#6b7280" }}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddOpen}
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
          Xonani qo'shish
        </Button>
      </Box>

      {/* Rooms Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
        }}
      >
        {rooms.map((room) => (
          <Card
            key={room.id}
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "box-shadow 0.2s, transform 0.2s",
              "&:hover": {
                boxShadow: "0 4px 20px rgba(124,58,237,0.1)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                {room.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                Sig'imi: {room.capacity}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => handleDeleteOpen(room.id)}
                sx={{
                  color: "#ef4444",
                  "&:hover": { bgcolor: "#fef2f2" },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleEditOpen(room.id)}
                sx={{
                  color: "#7c3aed",
                  "&:hover": { bgcolor: "#ede9fe" },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ))}
        </Box>
      </Box>

      {/* Add Room Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleClose}
      >
        <Box sx={{ width: 400, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              {editId ? "Xonani tahrirlash" : "Xonani qo'shish"}
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: "#6b7280" }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>
                Nomi <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                onChange={(e)=>setRoomName(e.target.value)}
                value={roomName}
                size="small"
                placeholder="Xona nomi"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>
                Sig'imi <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField  
                fullWidth
                onChange={(e) => setCapacity(e.target.value)}
                value={capacity}
                size="small"
                placeholder="Masalan: 20"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="text"
              onClick={handleClose}
              sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600, borderRadius: 2 }}
            >
              Bekor qilish
            </Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#5b21b6" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
            >
              Saqlash
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: 600 }}>Xonani o'chirish</DialogTitle>
        <DialogContent>
          <Typography>Rostdan ham o'chirishni hohlaysizmi?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="text"
            onClick={handleDeleteClose}
            sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none", borderRadius: 2 }}
          >
            Ha
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
