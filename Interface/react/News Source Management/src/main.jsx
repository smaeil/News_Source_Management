import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// elements
import HomePage from './components/HomePage.jsx'
import Login from './components/sign_in_up/Login.jsx'
import NotFound from './components/NotFound.jsx'
import ForgotPassword from './components/sign_in_up/ForgotPassword.jsx'
import Register from './components/sign_in_up/Register.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
    errorElement: <NotFound/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword/>
  },
  {
    path: '/register',
    element: <Register/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
