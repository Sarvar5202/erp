import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import {
  MenuBook,
  MeetingRoom,
  BadgeOutlined,
  MonetizationOn,
  Send,
} from "@mui/icons-material";

const PANEL_WIDTH = 220;

const menuItems = [
  { label: "Kurslar", icon: <MenuBook /> },
  { label: "Xonalar", icon: <MeetingRoom /> },
  { label: "Hodimlar", icon: <BadgeOutlined /> },
  { label: "Coin", icon: <MonetizationOn /> },
  { label: "Xabar Yuborish", icon: <Send /> },
];

export default function ManagementPanel({ open, onClose, sidebarCollapsed, onNavigate }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.15)",
            zIndex: 200,
          }}
        />
      )}

      {/* Panel */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: sidebarCollapsed ? 64 : 300,
          width: PANEL_WIDTH,
          height: "100vh",
          bgcolor: "white",
          borderRight: "1px solid #e5e7eb",
          borderRadius: "0 16px 16px 0",
          boxShadow: open ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
          transform: open ? "translateX(0)" : `translateX(-${PANEL_WIDTH}px)`,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), left 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 1199,
          overflowY: "auto",
        }}
      >
        <Box sx={{ px: 2, pt: 2.5, pb: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: "#111827",
              pb: 1.5,
              borderBottom: "2px solid #ede9fe",
            }}
          >
            Menu
          </Typography>
        </Box>

        <List sx={{ px: 1, pt: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                if (onNavigate) onNavigate(item.label);
                onClose();
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                px: 1.5,
                "&:hover": {
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  "& .MuiListItemIcon-root": { color: "#7c3aed" },
                },
                transition: "all 0.2s",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "#6b7280" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );
}
