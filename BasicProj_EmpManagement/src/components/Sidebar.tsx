 

type View = 'dashboard' | 'add' | 'credentials' | 'profile' | 'alerts';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  const NavButton: React.FC<{ label: string; v: View }> = ({ label, v }) => (
    <button
      onClick={() => setView(v)}
      className={`text-left w-full px-4 py-2 rounded ${view === v ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      {label}
    </button>
  );

  return (
    <aside className="w-64 bg-white p-4 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Employee Management</h2>
      </div>
      <nav className="space-y-2">
        <NavButton label="Dashboard" v="dashboard" />
        <NavButton label="Credentials" v="credentials" />
        <NavButton label="Profile" v="profile" />
        <NavButton label="Alerts" v="alerts" />
        <div className="border-t pt-4 mt-4">
          <NavButton label="Add Employee" v="add" />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
