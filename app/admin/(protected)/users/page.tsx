"use client";

import { useEffect, useState } from "react";
import { clerkClient } from "@clerk/nextjs/server";


export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load users from Clerk
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleBlock(userId: string, blocked: boolean) {
    setSaving(true);
    await fetch("/api/admin/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, blocked }),
    });
    setSaving(false);
    window.location.reload();
  }

  if (loading) {
    return <div className="p-8 text-gray-200">Loading users…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-gray-200">
      <h1 className="text-3xl font-bold">Manage Users</h1>
      <p className="text-sm text-gray-400">
        View, block, or manage all registered users.
      </p>

      <div className="bg-[#0d1224] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr className="border-b border-white/10">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/10 text-gray-200"
              >
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.createdAt}</td>
                <td className="p-2">
                  {user.blocked ? (
                    <span className="text-red-400">Blocked</span>
                  ) : (
                    <span className="text-green-400">Active</span>
                  )}
                </td>

                <td className="p-2">
                  {user.blocked ? (
                    <button
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => toggleBlock(user.id, false)}
                      disabled={saving}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={() => toggleBlock(user.id, true)}
                      disabled={saving}
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
