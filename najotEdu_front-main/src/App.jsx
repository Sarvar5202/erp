import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Layout from "./components/Layout"

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace/>} />
        <Route path="login" element={<Login />} />
        <Route path="management/*" element={<Layout />} />
        <Route path="dashboard/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
