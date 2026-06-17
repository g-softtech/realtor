'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AgentsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('agent');
  const [currentUserId, setCurrentUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) setUserRole(user.role);
        if (user._id) setCurrentUserId(user._id);
      } catch (e) {
        console.error('Error parsing user object');
      }
    }
  }, []);

  useEffect(() => {
    // Only fetch if admin
    if (userRole !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await api.get('/api/users');
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Error pulling network assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(); 
  }, [userRole, router]);

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (!confirm("Are you absolutely sure you want to permanently revoke this user's access?")) {
      return;
    }

    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      alert("Agent access revoked successfully!");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(err.message || "Failed to delete the user. Please try again.");
    }
  };

  const handleRoleToggle = async (id: string, currentRole: string) => {
    if (id === currentUserId) {
      alert("You cannot demote your own admin account.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'agent' : 'admin';
    const actionText = newRole === 'admin' ? 'promote this agent to Admin' : 'demote this Admin to standard agent';
    
    if (!confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      const updatedUser = await api.put(`/api/users/${id}/role`, { role: newRole });
      setUsers(users.map(user => user._id === id ? { ...user, role: updatedUser.role } : user));
      alert(`User role updated to ${newRole.toUpperCase()}!`);
    } catch (err: any) {
      console.error("Error updating user role:", err);
      alert(err.message || "Failed to update role. Please try again.");
    }
  };

  if (userRole !== 'admin') {
    return (
      <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 flex items-center justify-center">
        <EmptyState 
          title="Access Denied" 
          description="You do not have the required administrative clearance to view this module."
          actionHref="/dashboard"
          actionLabel="Return to Overview"
        />
      </main>
    );
  }

  if (error) return <div className="p-12 text-center text-red-500 font-medium">Error: {error}</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-600">Personnel</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agent Management</h1>
            <p className="text-sm text-gray-500 mt-1">Audit, promote, or revoke access for internal company agents.</p>
          </div>
          <Link 
            href="/dashboard/agents/create" 
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            + Create New Agent
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : users.length === 0 ? (
            <EmptyState 
              title="No Agents Found" 
              description="There are no registered users in the database."
            />
          ) : (
            users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                    {user._id === currentUserId && (
                      <span className="px-2 py-1 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-md">YOU</span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{user.name}</h3>
                  <p className="text-sm font-medium text-gray-500 break-all">{user.email}</p>
                </div>

                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col gap-4 mt-auto">
                  <div className="pt-2 flex justify-end gap-2">
                    {user._id !== currentUserId && (
                      <>
                        <button 
                          onClick={() => handleRoleToggle(user._id, user.role)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition"
                        >
                          {user.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition"
                        >
                          Revoke Access
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
