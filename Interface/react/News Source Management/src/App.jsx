import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { UserContext } from './UserContext.jsx'


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


function App() {

  // setting user parameter in userContext
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});


  return (
    <UserContext value={{isLoggedIn, setIsLoggedIn, userData, setUserData}}>
      <RouterProvider router={router} />
    </UserContext>
  )
}

export default App
