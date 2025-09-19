import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar" style={{ gap: 16 }}>
      <div className="nav-brand">Microservices</div>
      <div className="nav-actions">
        <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>Products -Second Server</NavLink>
        <NavLink to="/cars" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>Cars - Main Server</NavLink>
        <NavLink to="/whatsapp" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>WhatsApp</NavLink>
      </div>
    </nav>
  )
}

export default Navbar


