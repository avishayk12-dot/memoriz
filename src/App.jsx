import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import EventGallery from './pages/EventGallery'
import Upload from './pages/Upload'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => { return onAuthStateChanged(auth, setUser) }, [])
  if (user === undefined) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050310'}}><div style={{width:40,height:40,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<ProtectedRoute><Navbar /><CreateEvent /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
        <Route path="/gallery/:eventId" element={<ProtectedRoute><Navbar /><EventGallery /></ProtectedRoute>} />
        <Route path="/upload/:eventId" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
