import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import Upload from './pages/Upload';
import CreateLayer from './pages/CreateLayer';
import ManageData from './pages/ManageData';
import DataEntry from './pages/DataEntry';
import Users from './pages/Users';
import Docs from './pages/Docs';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<Report />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/create-layer" element={<CreateLayer />} />
          <Route path="/manage-data" element={<ManageData />} />
          <Route path="/data-entry" element={<DataEntry />} />
          <Route path="/users" element={<Users />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
