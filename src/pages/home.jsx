import "../styles/home.scss";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <header className="navbar">
        <h1 className="logo">BirkMan</h1>
        <nav>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/research">Research</Link></li>
            <li><Link to="/signup" className="btn">Sign-Up</Link></li>
            <li><Link to="/login" className="btn">Login</Link></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h2>Effortless comparison research!</h2>
        <p>Create studies, gather insights, analyze results, and share your findings—all in one platform!</p>
        <div className="cta-buttons">
          <Link to="/signup" className="btn btn-primary">Try Now!</Link>
          <Link to="/participate" className="btn btn-secondary">Participate!</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
