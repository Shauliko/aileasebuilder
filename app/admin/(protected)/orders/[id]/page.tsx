"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderDetailsPage({ params }: any) {
  const { id } = params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/admin/orders/${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendAction(action: string) {
    if (action === "refund") {
      if (!confirm("Are you sure you want to refund this payment?")) return;
    }

    if (action === "delete") {
      if (!confirm("Delete this log entry? This cannot be undone.")) return;
    }

    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert("Error: " + (json.error || "Unknown error"));
      return;
    }

    // Special handling for receipt_link
    if (action === "receipt_link") {
      if (json.receipt_url) {
        window.open(json.receipt_url, "_blank");
      } else {
        alert("No receipt URL available.");
      }
      return;
    }

    alert("Success");
    load();
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-10 text-white">
        <p className="text-red-400">Order not found.</p>
        <Link href="/admin/orders" className="text-blue-400 underline block mt-4">
          Back to orders
        </Link>
      </div>
    );
  }

  const hasPDF = data.metadata?.files?.lease_pdf_base64;
  const hasDOCX = data.metadata?.files?.lease_docx_base64;

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
    const byteChars = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
      const slice = byteChars.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      <Link href="/admin/orders" className="text-blue-400 underline mb-4 block">
        ← Back to orders
      </Link>

      {/* ADMIN ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-8">
        {data.type === "paid" && (
          <>
            <button
              onClick={() => sendAction("refund")}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
            >
              Refund Payment
            </button>

            <button
              onClick={() => sendAction("receipt_link")}
              className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500"
            >
              Open Receipt Link
            </button>
          </>
        )}

        <button
          onClick={() => sendAction("delete")}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
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
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
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
            className="px-4 py-2 bg-emerald-700 rounded hover:bg-emerald-600"
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
            className="px-4 py-2 bg-purple-700 rounded hover:bg-purple-600"
          >
            Download DOCX
          </button>
        )}
      </div>

      {/* MAIN INFO */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg mb-8 space-y-4">
        <Row label="Email" value={data.email || "—"} />
        <Row label="Type" value={data.type === "paid" ? "PAID" : "FREE"} />
        <Row
          label="Amount"
          value={
            data.type === "paid"
              ? `$${(data.amount / 100).toFixed(2)}`
              : "$0.00"
          }
        />
        <Row label="Currency" value={data.currency} />
        <Row label="Product" value={data.product} />
        <Row label="Stripe Session ID" value={data.stripe_session_id || "—"} />
        <Row label="Stripe Customer" value={data.stripe_customer || "—"} />
        <Row
          label="Created At"
          value={new Date(data.created_at).toLocaleString()}
        />
      </div>

      {/* METADATA */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Metadata</h2>

        {data.metadata && Object.keys(data.metadata).length > 0 ? (
          <pre className="bg-black/40 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(data.metadata, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No metadata</p>
        )}
      </div>

      {/* RAW JSON */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Raw Event JSON</h2>

        <pre className="bg-black/40 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-800 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
