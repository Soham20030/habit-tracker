import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: username,
        email:email,
        password: password
      })
    });

    if(response.ok) {
      navigate("/login");
    } else {
      console.error('Login failed:', response);
    }
  }


  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input 
            type="text"
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="email">Email</label>
          <input 
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}

          />

          <label htmlFor="password">Password</label>
          <input 
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)} 
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}

export default Register;


