import { useAppContext } from '../context/AppContext';
import { Users, Building2, UserCog } from 'lucide-react';

export default function Dashboard() {
  const { users, faculties } = useAppContext();

  const stats = [
    { name: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Faculties', value: faculties.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Staff Members', value: users.filter(u => u.role !== 'Student').length, icon: UserCog, color: 'text-violet-600', bg: 'bg-violet-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Faculty</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.slice(-5).reverse().map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-800 font-medium">{user.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {faculties.find(f => f.id === user.facultyId)?.name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
