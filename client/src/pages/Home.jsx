import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <div>
        <h1>Welcome to Habit Tracker</h1>
        <p>Track your daily habits and build consistency</p>

        <div>
          <Link to="/login">
            <button>Login</button>
          </Link>

          <Link to="/register">
            <button>Sign up</button>
          </Link>
        </div>
      </div>
    </>
  )
}


export default Home;