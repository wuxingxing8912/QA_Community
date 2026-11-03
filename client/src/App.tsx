import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Write from './pages/Write';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Topics from './pages/Topics';
import Columns from './pages/Columns';
import Favorites from './pages/Favorites';
import Following from './pages/Following';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/columns" element={<Columns />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/write/:id?"
          element={
            <ProtectedRoute>
              <Write />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <Following />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">页面不存在</div>} />
      </Route>
    </Routes>
  );
}
