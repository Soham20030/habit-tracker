import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; 

function ProtectedRoute({children, redirectWhenLoggedIn}) {
    const {isLoggedIn} = useContext(AuthContext);

    if(redirectWhenLoggedIn) {
        
        if(isLoggedIn) {
            return <Navigate to="/dashboard"/>
        } else {
            return children;
        }
    } else {
        if(!isLoggedIn) {
            return <Navigate to="/register"/>
        } else {
            return children;
        }
    }
}

export default ProtectedRoute;