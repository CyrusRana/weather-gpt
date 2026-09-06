import { NavLink } from 'react-router-dom'
import { Cloud, Grid2X2, CalendarDays, Sparkles, BarChart3, MapPin, Settings, X } from 'lucide-react'

const links = [
  ['/','Dashboard',Grid2X2],
  ['/forecast','Forecast',CalendarDays],
  ['/assistant','AI Assistant',Sparkles],
  ['/analytics','Analytics',BarChart3],
  ['/locations','Locations',MapPin],
]

export default function Sidebar({
  mobileOpen,
  onClose,
  location,
}) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button className="mobile-close" onClick={onClose} aria-label="Close navigation"><X size={18}/></button>
      <div className="brand">
        <div className="brand-mark"><Cloud size={29} strokeWidth={1.8}/></div>
        <div><div className="brand-name">Weather GPT</div><div className="brand-sub">Decision Intelligence</div></div>
      </div>
      <nav className="nav-section">
        <div className="nav-label">MENU</div>
        {links.map(([to,label,Icon]) => (
          <NavLink key={to} to={to} onClick={onClose} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon/><span>{label}</span>
          </NavLink>
        ))}
        <div className="nav-label" style={{marginTop:12}}>SYSTEM</div>
        <NavLink to="/settings" onClick={onClose} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings/><span>Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-spacer"/>
      <div className="location-footer">
        <div className="location-icon"><MapPin size={21}/></div>
        <div>
          <small>Current Location</small>
          <strong>
              {location?.city || 'Bengaluru'}, {location?.country || 'India'}
            </strong>
        </div>
      </div>
    </aside>
  )
}
