import { useState } from "react";
import logoImg from '../assets/image.png';
import {
  Box,
  Drawer,
  Button,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Home,
  Person,
  Group,
  Diamond,
  CardGiftcard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Refresh,
  Layers,
  PersonOutlined,
  ExpandLess,
  ExpandMore,
  CreditCard,
  Groups,
  BarChart,
  Equalizer,
  ShoppingCart,
  OnlinePrediction,
} from "@mui/icons-material";

const SIDEBAR_WIDTH = 300;
const COLLAPSED_WIDTH = 64;

const navItems = [
  { label: "Asosiy", icon: <Home />, id: "home" },
  { label: "O'qituvchilar", icon: <Person />, id: "teachers" },
  { label: "Guruhlar", icon: <Group />, id: "groups" },
  { label: "Talabalar", icon: <Diamond />, id: "students" },
  { label: "Sovg'alar", icon: <CardGiftcard />, id: "gifts" },
  { label: "Boshqarish", icon: <Settings />, id: "management" },
];

export default function Sidebar({ collapsed, onToggle, activeItem, onItemClick }) {
  const [guruhlarOpen, setGuruhlarOpen] = useState(true);
  const role = localStorage.getItem("role");

  if (role === "TEACHER") {
    return (
      <Box
        sx={{
          width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "white",
          borderRight: "1px solid #e5e7eb",
          borderRadius: "0 16px 16px 0",
          overflow: "visible",
          boxSizing: "border-box",
          zIndex: 1200,
        }}
      >
        {/* Logo Area - matches header height */}
        <Box
          sx={{
            px: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            minHeight: 56,
            borderBottom: "1px solid #e5e7eb",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img src={logoImg} alt="NajotEdu CRM" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </Box>
          <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
            <Box sx={{ fontWeight: 800, fontSize: 20, whiteSpace: "nowrap", ml: 0.5 }}>
              <span style={{ color: "#0f2c59" }}>Najot</span>
              <span style={{ color: "#00b5a5" }}>Edu</span>
            </Box>
          </Collapse>
        </Box>

        {/* Toggle Button */}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            position: "absolute",
            right: -14,
            top: 14,
            zIndex: 1300,
            bgcolor: "#7c3aed",
            color: "white",
            width: 28,
            height: 28,
            borderRadius: "8px",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
            "&:hover": { bgcolor: "#5b21b6" },
          }}
        >
          {collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
        </IconButton>

        {/* Nav Items */}
        <List sx={{ flex: 1, pt: 2, px: 1, overflowY: "auto", overflowX: "hidden" }}>
          {/* Collapsible Guruhlar */}
          <Tooltip title={collapsed ? "Guruhlar" : ""} placement="right" arrow>
            <ListItemButton
              onClick={() => setGuruhlarOpen(!guruhlarOpen)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 44,
                px: 1.5,
                color: "#4b5563",
                "&:hover": {
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  "& .MuiListItemIcon-root": { color: "#7c3aed" },
                },
                transition: "all 0.15s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: "#4b5563",
                  mr: collapsed ? 0 : 0,
                  justifyContent: "center",
                }}
              >
                <Layers />
              </ListItemIcon>
              <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", overflow: "hidden" }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
                        Guruhlar
                      </Typography>
                    }
                  />
                  {guruhlarOpen ? <ExpandLess sx={{ fontSize: 18, color: "#6b7280" }} /> : <ExpandMore sx={{ fontSize: 18, color: "#6b7280" }} />}
                </Box>
              </Collapse>
            </ListItemButton>
          </Tooltip>

          {/* Sub-items list */}
          <Collapse in={guruhlarOpen && !collapsed} timeout={300} unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              <ListItemButton
                selected={activeItem === "groups"}
                onClick={() => onItemClick("groups")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 38,
                  px: 2,
                  "&.Mui-selected": {
                    bgcolor: "#7c3aed",
                    color: "white",
                    "&:hover": { bgcolor: "#5b21b6" },
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "#ede9fe",
                    color: "#7c3aed",
                  },
                  transition: "all 0.15s",
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 13, fontWeight: activeItem === "groups" ? 600 : 500 }}>
                      Guruhlar
                    </Typography>
                  }
                />
              </ListItemButton>

              <ListItemButton
                selected={activeItem === "planned-groups"}
                onClick={() => onItemClick("planned-groups")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 38,
                  px: 2,
                  "&.Mui-selected": {
                    bgcolor: "#7c3aed",
                    color: "white",
                    "&:hover": { bgcolor: "#5b21b6" },
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "#ede9fe",
                    color: "#7c3aed",
                  },
                  transition: "all 0.15s",
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 13, fontWeight: activeItem === "planned-groups" ? 600 : 500 }}>
                      Yig'ilayotgan guruhlar
                    </Typography>
                  }
                />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Collapsed sub-item menus when sidebar is collapsed */}
          {collapsed && (
            <>
              <Tooltip title="Guruhlar" placement="right" arrow>
                <ListItemButton
                  selected={activeItem === "groups"}
                  onClick={() => onItemClick("groups")}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    minHeight: 44,
                    px: 1.5,
                    justifyContent: "center",
                    "&.Mui-selected": {
                      bgcolor: "#7c3aed",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: "center", color: activeItem === "groups" ? "white" : "#6b7280" }}>
                    <Layers sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>

              <Tooltip title="Yig'ilayotgan guruhlar" placement="right" arrow>
                <ListItemButton
                  selected={activeItem === "planned-groups"}
                  onClick={() => onItemClick("planned-groups")}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    minHeight: 44,
                    px: 1.5,
                    justifyContent: "center",
                    "&.Mui-selected": {
                      bgcolor: "#7c3aed",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: "center", color: activeItem === "planned-groups" ? "white" : "#6b7280" }}>
                    <Layers sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </>
          )}

          {/* Profil */}
          <Tooltip title={collapsed ? "Profil" : ""} placement="right" arrow>
            <ListItemButton
              selected={activeItem === "profile"}
              onClick={() => onItemClick("profile")}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 44,
                px: 1.5,
                "&.Mui-selected": {
                  bgcolor: "#7c3aed",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { bgcolor: "#5b21b6" },
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  "& .MuiListItemIcon-root": { color: "#7c3aed" },
                },
                transition: "all 0.15s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: activeItem === "profile" ? "white" : "#6b7280",
                  transition: "color 0.15s",
                  mr: collapsed ? 0 : 0,
                  justifyContent: "center",
                }}
              >
                <PersonOutlined />
              </ListItemIcon>
              <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 14, fontWeight: activeItem === "profile" ? 600 : 500, whiteSpace: "nowrap" }}>
                      Profil
                    </Typography>
                  }
                />
              </Collapse>
            </ListItemButton>
          </Tooltip>
        </List>
      </Box>
    );
  }

  if (role === "STUDENT") {
    const studentNavItems = [
      { label: "Bosh sahifa", icon: <Home />, id: "home" },
      { label: "To'lovlarim", icon: <CreditCard />, id: "payments" },
      { label: "Guruhlarim", icon: <Groups />, id: "my-groups" },
      { label: "Ko'rsatkichlarim", icon: <BarChart />, id: "metrics" },
      { label: "Reyting", icon: <Equalizer />, id: "rating" },
      { label: "Do'kon", icon: <ShoppingCart />, id: "shop" },
      { label: "Qo'shimcha darslar", icon: <OnlinePrediction />, id: "additional-lessons" },
      { label: "Sozlamalar", icon: <Settings />, id: "settings" },
    ];

    return (
      <Box
        sx={{
          width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "white",
          borderRight: "1px solid #e5e7eb",
          borderRadius: "0 16px 16px 0",
          overflow: "visible",
          boxSizing: "border-box",
          zIndex: 1200,
        }}
      >
        {/* Logo Area */}
        <Box
          sx={{
            px: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            minHeight: 56,
            borderBottom: "1px solid #e5e7eb",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img src={logoImg} alt="NajotEdu CRM" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </Box>
          <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
            <Box sx={{ fontWeight: 800, fontSize: 20, whiteSpace: "nowrap", ml: 0.5 }}>
              <span style={{ color: "#0f2c59" }}>Najot</span> 
              <span style={{ color: "#d97706" }}>Edu</span>
            </Box>
          </Collapse>
        </Box>

        {/* Toggle Button */}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            position: "absolute",
            right: -14,
            top: 14,
            zIndex: 1300,
            bgcolor: "#cd9869",
            color: "white",
            width: 28,
            height: 28,
            borderRadius: "8px",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(205,152,105,0.3)",
            "&:hover": { bgcolor: "#b48256" },
          }}
        >
          {collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
        </IconButton>

        {/* Nav Items */}
        <List sx={{ flex: 1, pt: 2, px: 1, overflowY: "auto", overflowX: "hidden" }}>
          {studentNavItems.map((item) => (
            <Tooltip key={item.id} title={collapsed ? item.label : ""} placement="right" arrow>
              <ListItemButton
                selected={activeItem === item.id}
                onClick={() => onItemClick(item.id)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.5,
                  minHeight: 44,
                  px: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "#f9f6f3",
                    color: "#d97706",
                    "& .MuiListItemIcon-root": { color: "#d97706" },
                    "&:hover": { bgcolor: "#f3e8de" },
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "#f9f6f3",
                    color: "#d97706",
                    "& .MuiListItemIcon-root": { color: "#d97706" },
                  },
                  transition: "all 0.15s",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 36,
                    color: activeItem === item.id ? "#d97706" : "#6b7280",
                    transition: "color 0.15s",
                    mr: collapsed ? 0 : 0,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: 14, fontWeight: activeItem === item.id ? 600 : 500, whiteSpace: "nowrap" }}>
                          {item.label}
                        </Typography>
                      }
                    />
                  </Box>
                </Collapse>
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "white",
        borderRight: "1px solid #e5e7eb",
        borderRadius: "0 16px 16px 0",
        overflow: "visible",
        boxSizing: "border-box",
        zIndex: 1200,
      }}
    >
      {/* Logo Area - matches header height */}
      <Box
        sx={{
          px: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 56,
          borderBottom: "1px solid #e5e7eb",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img src={logoImg} alt="NajotEdu CRM" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
        <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
          <Box sx={{ fontWeight: 800, fontSize: 20, whiteSpace: "nowrap", ml: 0.5 }}>
            <span style={{ color: "#0f2c59" }}>Najot</span>
            <span style={{ color: "#00b5a5" }}>Edu</span>
          </Box>
        </Collapse>
      </Box>

      {/* Toggle Button */}
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          position: "absolute",
          right: -14,
          top: 14,
          zIndex: 1300,
          bgcolor: "#7c3aed",
          color: "white",
          width: 28,
          height: 28,
          borderRadius: "8px",
          border: "2px solid white",
          boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
          "&:hover": { bgcolor: "#5b21b6" },
        }}
      >
        {collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
      </IconButton>

      {/* Nav Items */}
      <List sx={{ flex: 1, pt: 2, px: 1, overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => (
          <Tooltip key={item.id} title={collapsed ? item.label : ""} placement="right" arrow>
            <ListItemButton
              selected={activeItem === item.id}
              onClick={() => onItemClick(item.id)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 44,
                px: 1.5,
                "&.Mui-selected": {
                  bgcolor: "#7c3aed",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { bgcolor: "#5b21b6" },
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  "& .MuiListItemIcon-root": { color: "#7c3aed" },
                },
                transition: "all 0.15s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: activeItem === item.id ? "white" : "#6b7280",
                  transition: "color 0.15s",
                  mr: collapsed ? 0 : 0,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Collapse in={!collapsed} orientation="horizontal" timeout={300}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: 14, fontWeight: activeItem === item.id ? 600 : 500, whiteSpace: "nowrap" }}>
                        {item.label}
                      </Typography>
                    }
                  />
                  {item.badge && item.badge}
                </Box>
              </Collapse>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      {/* Subscription Box */}
      <Collapse in={!collapsed} timeout={300}>
        <Box sx={{ m: 1.5, p: 1.5, bgcolor: "#fff5f5", border: "1px solid #fecaca", borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ fontSize: 28 }}>🔔</Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Obuna</Typography>
              <Typography sx={{ fontSize: 11, color: "#ef4444" }}>Obunangiz tugagan</Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Refresh />}
            sx={{
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              py: 0.8,
            }}
          >
            Obunani yangilash
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
