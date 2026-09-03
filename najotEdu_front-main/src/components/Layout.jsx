import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ManagementPanel from "./ManagementPanel";
import DashboardHome from "./DashboardHome";
import RoomsPage from "./RoomsPage";
import CoursesPage from "./CoursesPage";
import TeachersPage from "./TeachersPage";
import GroupPage from "./GroupPage";
import GroupInner from "./GroupInner";
import StudentPage from "./StudentPage";
import GroupLesson from "./GroupLesson";
import HomeworkCreate from "./HomeworkCreate";
import HomeworkResults from "./HomeworkResults";
import HomeworkCheck from "./HomeworkCheck";
import ProfilePage from "./ProfilePage";
import StudentMyGroups from "./StudentMyGroups";
import StudentGroupLessons from "./StudentGroupLessons";
import ProtectedRoute from "./ProtectedRoute";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  // Determine active sidebar item from URL
  let activeItem = "home";
  if (location.pathname.startsWith("/management") || location.pathname.includes("/course") || location.pathname.includes("/rooms")) {
    activeItem = "management";
  } else if (location.pathname.includes("/attendance")) {
    activeItem = "attendance";
  } else if (location.pathname.includes("/leads")) {
    activeItem = "leads";
  } else if (location.pathname.includes("/teachers")) {
    activeItem = "teachers";
  } else if (location.pathname.includes("/planned-groups")) {
    activeItem = "planned-groups";
  } else if (location.pathname.includes("/my-groups")) {
    activeItem = "my-groups";
  } else if (location.pathname.includes("/groups")) {
    activeItem = "groups";
  } else if (location.pathname.includes("/students")) {
    activeItem = "students";
  } else if (location.pathname.includes("/gifts")) {
    activeItem = "gifts";
  } else if (location.pathname.includes("/finance")) {
    activeItem = "finance";
  } else if (location.pathname.includes("/tests")) {
    activeItem = "tests";
  } else if (location.pathname.includes("/profile")) {
    activeItem = "profile";
  }

  const handleItemClick = (id) => {
    if (id === "management") {
      setManagementOpen((prev) => !prev);
      navigate("/management");
    } else {
      setManagementOpen(false);
      navigate(id === "home" ? "/dashboard" : `/dashboard/${id}`);
    }
  };

  // Close management panel when navigating to non-management pages
  useEffect(() => {
    if (!location.pathname.startsWith("/management")) {
      setManagementOpen(false);
    }
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleManagementNavigate = (label) => {
    if (label === "Xonalar") {
      navigate("/management/rooms");
    } else if (label === "Kurslar") {
      navigate("/management/course");
    } else {
      navigate("/management");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f3f4f6",
      }}
    >
      {/* Sidebar - full height from top to bottom */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      {/* Right side: Header + Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Header darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          <ManagementPanel
            open={managementOpen}
            onClose={() => {
              setManagementOpen(false);
            }}
            sidebarCollapsed={sidebarCollapsed}
            onNavigate={handleManagementNavigate}
          />

          <Box
            component="main"
            sx={{
              flex: 1,
              overflowY: "auto",
              bgcolor: "#f3f4f6",
              transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="rooms" element={<ProtectedRoute allowedRoles={["ADMIN"]}><RoomsPage /></ProtectedRoute>} />
              <Route path="course" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CoursesPage /></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CoursesPage /></ProtectedRoute>} />
              {/* Fallbacks for other sidebar tabs temporarily */}
              <Route path="teachers" element={<ProtectedRoute allowedRoles={["ADMIN"]}><TeachersPage /></ProtectedRoute>} />
              <Route path="planned-groups" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><GroupPage statusFilter="planned" /></ProtectedRoute>} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="my-groups" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentMyGroups /></ProtectedRoute>} />
              <Route path="my-groups/:groupId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentGroupLessons /></ProtectedRoute>} />
              <Route path="groups" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><GroupPage statusFilter="active" /></ProtectedRoute>} />
              <Route path="groups/:id" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><GroupInner /></ProtectedRoute>} />
              <Route path="groups/:id/lesson/:lessonId" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><GroupLesson /></ProtectedRoute>} />
              <Route path="groups/:id/homework/create" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><HomeworkCreate /></ProtectedRoute>} />
              <Route path="groups/:id/homework/:homeworkId/results" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><HomeworkResults /></ProtectedRoute>} />
              <Route path="groups/:id/homework/:homeworkId/result/:studentId" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><HomeworkCheck /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><StudentPage /></ProtectedRoute>} />
              <Route path="attendance" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Davomat</Typography></Box>} />
              <Route path="leads" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Lidlar</Typography></Box>} />
              <Route path="gifts" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Sovg'alar</Typography></Box>} />
              <Route path="finance" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Moliya</Typography></Box>} />
              <Route path="tests" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Testlar</Typography></Box>} />
              <Route path="payments" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>To'lovlarim</Typography><Typography sx={{ color: '#6b7280' }}>Barcha to'lovlar o'z vaqtida amalga oshirilgan.</Typography></Box>} />
              <Route path="metrics" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Ko'rsatkichlarim</Typography><Typography sx={{ color: '#6b7280' }}>O'zlashtirish va davomat ko'rsatkichlari yaxshi darajada.</Typography></Box>} />
              <Route path="rating" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Reyting</Typography><Typography sx={{ color: '#6b7280' }}>Guruhdagi o'quvchilar reytingi.</Typography></Box>} />
              <Route path="shop" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Do'kon</Typography><Typography sx={{ color: '#6b7280' }}>NajotEdu sovg'alar va ballar do'koni.</Typography></Box>} />
              <Route path="additional-lessons" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Qo'shimcha darslar</Typography><Typography sx={{ color: '#6b7280' }}>Qo'shimcha master-klasslar va darslar.</Typography></Box>} />
              <Route path="settings" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Sozlamalar</Typography><Typography sx={{ color: '#6b7280' }}>Hisob va bildirishnoma sozlamalari.</Typography></Box>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
