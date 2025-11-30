"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Convert timestamp to PST (America/Los_Angeles)
function toPST(dateString: string) {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  } catch {
    return "—";
  }
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const id = orderId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load order details
  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  // Perform action (refund, delete, receipt link)
  async function sendAction(action: string) {
    if (action === "refund" && !confirm("Refund this payment?")) return;
    if (action === "delete" && !confirm("Delete log entry?")) return;

    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });

    const json = await res.json();

    if (!res.ok) {
      alert("Error: " + (json.error || "Unknown error"));
      return;
    }

    if (action === "receipt_link") {
      if (json.receipt_url) window.open(json.receipt_url, "_blank");
      else alert("No receipt available.");
      return;
    }

    alert("Success.");
    load();
  }

  // Download helper
  function downloadFile(name: string, base64: string, mime: string) {
    const blob = b64toBlob(base64, mime);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function b64toBlob(b64Data: string, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  // Not found
  if (!data || data.error) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-400">Order not found.</p>
        <Link href="/admin/orders" className="text-blue-400 underline mt-4 block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  // Choose best timestamp available
  const created =
    data.created_at ||
    data.metadata?.created_at ||
    data.metadata?.leaseData?.created_at ||
    null;

  const hasPDF = data.metadata?.files?.lease_pdf_base64;
  const hasDOCX = data.metadata?.files?.lease_docx_base64;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto w-full space-y-10">

      {/* BACK LINK */}
      <Link href="/admin/orders" className="text-blue-400 underline">
        ← Back to orders
      </Link>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-4">

        {data.type === "paid" && (
          <>
            <button
              onClick={() => sendAction("refund")}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 text-sm"
            >
              Refund Payment
            </button>

            <button
              onClick={() => sendAction("receipt_link")}
              className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500 text-sm"
            >
              Open Receipt Link
            </button>
          </>
        )}

        <button
          onClick={() => sendAction("delete")}
          className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-sm"
        >
          Delete Log Entry
        </button>

        <button
          onClick={() =>
            downloadFile(
              `order_${id}.json`,
              btoa(JSON.stringify(data, null, 2)),
              "application/json"
            )
          }
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm"
        >
          Download JSON
        </button>

        {hasPDF && (
          <button
            onClick={() =>
              downloadFile(
                `lease_${id}.pdf`,
                data.metadata.files.lease_pdf_base64,
                "application/pdf"
              )
            }
            className="px-4 py-2 bg-emerald-700 rounded hover:bg-emerald-600 text-sm"
          >
            Download PDF
          </button>
        )}

        {hasDOCX && (
          <button
            onClick={() =>
              downloadFile(
                `lease_${id}.docx`,
                data.metadata.files.lease_docx_base64,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              )
            }
            className="px-4 py-2 bg-purple-700 rounded hover:bg-purple-600 text-sm"
          >
            Download DOCX
          </button>
        )}
      </div>

      {/* MAIN INFO */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg space-y-4">
        <Row label="Email" value={data.email || "—"} />
        <Row label="Type" value={data.type === "paid" ? "PAID" : "FREE"} />
        <Row
          label="Amount"
          value={data.type === "paid" ? `$${(data.amount / 100).toFixed(2)}` : "$0.00"}
        />
        <Row label="Currency" value={data.currency || "usd"} />
        <Row label="Product" value={data.product || "—"} />
        <Row label="Stripe Session ID" value={data.stripe_session_id || "—"} />
        <Row label="Stripe Customer" value={data.stripe_customer || "—"} />

        <Row label="Created At" value={created ? toPST(created) : "—"} />
      </div>

      {/* METADATA */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Metadata</h2>

        {data.metadata && Object.keys(data.metadata).length > 0 ? (
          <pre className="bg-black/40 p-4 rounded-lg text-sm max-h-[300px] overflow-auto whitespace-pre-wrap break-words">
            {JSON.stringify(data.metadata, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No metadata</p>
        )}
      </div>

      {/* RAW EVENT JSON */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Raw Event JSON</h2>
        <pre className="bg-black/40 p-4 rounded-lg text-sm max-h-[300px] overflow-auto whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// A clean little row component
function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-800 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
