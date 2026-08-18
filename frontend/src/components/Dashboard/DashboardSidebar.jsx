import "./DashboardSidebar.css";

function Icon({ name }) {
  const paths = {
    dashboard: <><path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" /></>,
    requests: <><path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9" /><path d="m13 12 7-7 2 2-7 7-3 1 1-3Z" /></>,
    messages: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-4-.9L3 21l1.7-4.1A8 8 0 1 1 21 11.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></>,
  };
  return <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const items = [
  ["Dashboard", "dashboard"], ["My Requests", "requests"], ["Messages", "messages"],
  ["Ratings & Reviews", "star"], ["Settings", "settings"],
];

export default function DashboardSidebar() {
  return <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
    <nav className="sidebar-nav">
      {items.map(([label, icon], index) => <button className={`sidebar-link ${index === 0 ? "is-active" : ""}`} type="button" key={label}><Icon name={icon} />{label}</button>)}
      <button className="sidebar-link sidebar-logout" type="button"><Icon name="logout" />Logout</button>
    </nav>
  </aside>;
}
