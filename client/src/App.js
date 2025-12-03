import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MantineProvider, LoadingOverlay } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import mantineTheme from './theme/mantineTheme';
import { useTheme } from './contexts/ThemeContext';

// Mantine CSS imports
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Login from './pages/common/Login/LoginMantine';
import Register from './pages/common/Register';
import Home from './pages/common/Home/HomeMantine';
import Profile from './pages/common/Profile';
import WriteExam from './pages/user/WriteExam/index.jsx';
import AdminReports from './pages/admin/AdminReports';
import UserReports from './pages/user/UserReports';
import Exams from './pages/admin/Exams';
import AddEditExam from './pages/admin/Exams/AddEditExam';
import AddEditQuestion from './pages/admin/Exams/AddEditQuestion';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/common/ForgotPassword';
import ResetPassword from './pages/common/ResetPassword';
import AvailableExams from './pages/user/AvailableExams';
import PaymentPortal from './pages/user/PaymentPortal';
import { ThemeProvider } from './contexts/ThemeContext';
import { ColorProvider } from './contexts/ColorContext';
import './stylesheets/globals.css';
import Leaderboard from './pages/Leaderboard';
import PaymentHistory from './pages/user/PaymentHistory';
import AdminPayments from './pages/admin/AdminPayments';

const router = createBrowserRouter(
  [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { 
      path: "/", 
      element: <ProtectedRoute><Home /></ProtectedRoute> 
    },
  { 
    path: "/profile", 
    element: <ProtectedRoute><Profile /></ProtectedRoute> 
  },
  { 
    path: "/user/reports", 
    element: <ProtectedRoute><UserReports /></ProtectedRoute> 
  },
  { 
    path: "/available-exams", 
    element: <ProtectedRoute><AvailableExams /></ProtectedRoute> 
  },
  { 
    path: "/user/write-exam", 
    element: <ProtectedRoute><Navigate to="/available-exams" replace /></ProtectedRoute> 
  },
  { 
    path: "/user/write-exam/:id", 
    element: <ProtectedRoute><WriteExam /></ProtectedRoute> 
  },
  { 
    path: "/admin/reports", 
    element: <ProtectedRoute><AdminReports /></ProtectedRoute> 
  },
  { 
    path: "/admin/exams", 
    element: <ProtectedRoute><Exams /></ProtectedRoute> 
  },
  { 
    path: "/admin/exams/add", 
    element: <ProtectedRoute><AddEditExam /></ProtectedRoute> 
  },
  { 
    path: "/admin/exams/edit/:id", 
    element: <ProtectedRoute><AddEditExam /></ProtectedRoute> 
  },
  { 
    path: "/admin/exams/questions/:id", 
    element: <ProtectedRoute><AddEditQuestion /></ProtectedRoute> 
  },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:email", element: <ResetPassword /> },
  { 
    path: "/payment-portal/:examId", 
    element: <ProtectedRoute><PaymentPortal /></ProtectedRoute> 
  },
  { 
    path: "/leaderboard", 
    element: <ProtectedRoute><Leaderboard /></ProtectedRoute> 
  },
  { 
    path: "/user/payment-history", 
    element: <ProtectedRoute><PaymentHistory /></ProtectedRoute> 
  },
  { 
    path: "/admin/payments", 
    element: <ProtectedRoute><AdminPayments /></ProtectedRoute> 
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
], 
{
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// Inner App component that can access ThemeContext
function AppContent() {
  const { loading } = useSelector(state => state.loader);
  const { isDarkMode } = useTheme();
  
  // Determine the color scheme based on theme settings
  const colorScheme = isDarkMode ? 'dark' : 'light';
  
  return (
    <MantineProvider 
      theme={mantineTheme} 
      defaultColorScheme={colorScheme}
      forceColorScheme={colorScheme}
    >
      <Notifications position="top-right" zIndex={2000} />
      <ModalsProvider>
        {loading && (
          <LoadingOverlay 
            visible={loading} 
            zIndex={1000} 
            overlayProps={{ 
              blur: 4,
              backgroundOpacity: 0.6 
            }}
            loaderProps={{
              color: 'violet',
              type: 'oval',
              size: 'lg'
            }}
          />
        )}
        <RouterProvider router={router} />
      </ModalsProvider>
    </MantineProvider>
  );
}

function App() {
  return (
    <ColorProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ColorProvider>
  );
}

export default App;
