import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const managementTabs = [
  { label: "Kurslar", path: "/management/course" },
  { label: "Xonalar", path: "/management/rooms" },
  { label: "Xodimlar", path: "/management/teachers" },
];

export default function ManagementTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap", borderBottom: "1px solid #e5e7eb" }}>
      {managementTabs.map((tab) => {
        const isActive = location.pathname.includes(tab.path);
        return (
          <Box
            key={tab.label}
            onClick={() => navigate(tab.path)}
            sx={{
              pb: 1.5,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#7c3aed" : "#6b7280",
              borderBottom: isActive ? "2px solid #7c3aed" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { color: "#7c3aed" },
              marginBottom: "-1px"
            }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );
}
