"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<"all" | "paid" | "free">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("lease_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
        setFiltered(data);
      }

      setLoading(false);
    }

    load();
  }, []);

  // ---------------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------------
  useEffect(() => {
    let data = [...orders];

    if (filterType !== "all") {
      data = data.filter((o) => o.type === filterType);
    }

    if (search.trim() !== "") {
      const term = search.toLowerCase();
      data = data.filter(
        (o) =>
          (o.email && o.email.toLowerCase().includes(term)) ||
          (o.user_id && o.user_id.toLowerCase().includes(term))
      );
    }

    setFiltered(data);
  }, [orders, filterType, search]);

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Orders & Lease Events</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 mb-8">

        {/* FILTER BUTTONS */}
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${
              filterType === "all"
                ? "bg-emerald-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>

          <button
            className={`px-4 py-2 rounded ${
              filterType === "paid"
                ? "bg-emerald-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setFilterType("paid")}
          >
            Paid
          </button>

          <button
            className={`px-4 py-2 rounded ${
              filterType === "free"
                ? "bg-emerald-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setFilterType("free")}
          >
            Free
          </button>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by email..."
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No matching results.</p>
      ) : (
        <div className="overflow-auto border border-gray-700 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-300 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">State</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-gray-800 hover:bg-gray-800/60"
                >
                  <td className="px-4 py-3">
                    {event.email || <span className="text-gray-500">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {event.type === "paid" ? (
                      <span className="text-emerald-400 font-semibold">
                        PAID
                      </span>
                    ) : (
                      <span className="text-blue-400 font-semibold">FREE</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {event.amount
                      ? `$${(event.amount / 100).toFixed(2)}`
                      : "$0.00"}
                  </td>

                  <td className="px-4 py-3">
                    {event.metadata?.state || (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {event.metadata?.ip || (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
