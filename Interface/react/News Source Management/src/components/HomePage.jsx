import { useContext, useEffect } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

import { loadLocal, removeLocal } from '../tools/localTools'

const HomePage = () => {

    const {isLoggedIn, setIsLoggedIn, userData, setUserData} = useContext(UserContext);

      const navigate = useNavigate();

  // initiating the the states from local storage
  useEffect(() => {

    // 1. reading the local storage
    const token = loadLocal('token');
    const user = loadLocal('user');
    const rememberMe = loadLocal('rememberMe');

    // 2. in case of no token or user data navigate to login
    if (!token || !user) {
      navigate('/login', {viewTransition: true});
    }
    
    // 3. handle saty Logged in logic
    const isActive = sessionStorage.getItem('session_active');
    if (rememberMe || isActive) {
        setIsLoggedIn(token? true: false);
        setUserData(user? user : {});
    } else {
        removeLocal('token');
        removeLocal('user');
        navigate('/login', {viewTransition: true});
    }



  });

    return (
        <>
            <h1 className="text-3xl font-bold underline">
                Home Page! Welcome {userData.name}
            </h1>
            <h2>{isLoggedIn ? 'Your Logged In' : 'Sorry! you are not logged in'}</h2>
        </>
    )
}

export default HomePage;