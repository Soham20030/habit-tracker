import {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../AuthContext";

function Login() {

  const {login} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) =>{
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if(response.ok) {
      const data = await response.json();
      login(data.token);
      navigate('/dashboard');
    } else {
    console.error('Login failed:', response);
  }
}

  return(
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange = {(event) => setEmail(event.target.value)} 
          />

          <label htmlFor="password">Password</label>
          <input
            id="password" 
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}



export default Login;
