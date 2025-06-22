import {useContext} from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';


function Dashboard() {
  const {logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
};

  const {isLoggedIn} = useContext(AuthContext);
  return (
    <>
     <h1>Dashboard Page</h1>
     <p>Is logged in: {isLoggedIn.toString()}</p>
     <button onClick={handleLogout}>Logout</button>
    </>

  )
}

export default Dashboard