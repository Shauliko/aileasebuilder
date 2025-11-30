"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<"all" | "paid" | "free">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  // ---------------------------------------------------------------
  // LOAD ORDERS FROM API
  // ---------------------------------------------------------------
  async function load() {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      perPage: String(limit)
    });

    if (search.trim()) params.set("search", search.trim());
    if (filterType !== "all") params.set("type", filterType);

    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();

    // ✔ Corrected fields from API
    setOrders(data.results || []);
    setTotal(data.totalRows || 0);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [page, filterType]);

  function handleSearchSubmit(e: any) {
    e.preventDefault();
    setPage(1);
    load();
  }

  // ---------------------------------------------------------------
  // TABLE
  // ---------------------------------------------------------------
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

        {/* SEARCH BAR */}
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search email, product, session ID..."
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : orders.length === 0 ? (
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
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((event) => (
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
                    {event.type === "paid"
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

                  <td className="px-4 py-3">
                    <a
                      href={`/admin/orders/${event.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-2 border border-gray-700 rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-gray-300">
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </span>

        <button
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
          className="px-3 py-2 border border-gray-700 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
