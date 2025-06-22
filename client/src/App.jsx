import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<ProtectedRoute redirectWhenLoggedIn={true}><Login/></ProtectedRoute>}/>
        <Route path="/register" element={<ProtectedRoute redirectWhenLoggedIn={true}><Register/></ProtectedRoute>}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  )
}


export default App;