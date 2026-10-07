"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
  Building2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { useSupplierStore } from "@/store/supplier-store";
import { VerificationDocument } from "@/types/supplier";

export function SupplierVerificationView() {
  const { verificationDocs, uploadVerificationDocument, profile, setActiveTab } =
    useSupplierStore();

  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleSimulatedUpload = (docId: string) => {
    const doc = verificationDocs.find((d) => d.id === docId);
    const mockFile = `${doc?.label.replace(/[\s/]/g, "_")}_2026_Updated.pdf`;
    uploadVerificationDocument(docId, mockFile);
    setActiveUploadDocId(null);
  };

  const verifiedCount = verificationDocs.filter((d) => d.status === "verified").length;
  const underReviewCount = verificationDocs.filter((d) => d.status === "under_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Verification & KYC Compliance"
        subtitle="Manage required statutory business documentation, government licenses, and compliance reviews."
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Business Verification" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {verifiedCount} of {verificationDocs.length} Documents Verified
            </span>
          </div>
        }
      />

      {/* Compliance Overview Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{profile.businessName}</h2>
                <StatusBadge status="verified" size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                TIN: <span className="font-mono font-bold text-slate-800">{profile.tinNumber}</span> • License:{" "}
                <span className="font-mono font-bold text-slate-800">{profile.licenseNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setActiveTab("onboarding")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Update Registration Info
            </button>
          </div>
        </div>
      </div>

      {/* Verification Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Mandatory Compliance Documents</h3>
          <span className="text-xs text-slate-500">Ministry of Trade & ECAE Verification Requirements</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verificationDocs.map((doc) => {
            return (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.label}</h4>
                        {doc.fileName ? (
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate max-w-[240px]">
                            {doc.fileName}
                          </p>
                        ) : (
                          <p className="text-[11px] text-rose-500 mt-0.5">Not yet uploaded</p>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={doc.status} size="sm" />
                  </div>

                  {/* Admin Feedback Box */}
                  {doc.reviewerNotes && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-0.5">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                        <span>Admin Verification Feedback:</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{doc.reviewerNotes}</p>
                      {doc.uploadedAt && (
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          Last audited: {doc.uploadedAt}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload / Replace Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Accepted formats: PDF, JPG, PNG (Max 15MB)</span>

                  <button
                    onClick={() => handleSimulatedUpload(doc.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>{doc.fileName ? "Re-upload" : "Upload File"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Review & Assistance Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Verification Guidelines & Registry Support</h3>
        <p className="text-slate-600 leading-relaxed">
          MercatoX verifies all business accounts against the electronic national registry of the Ministry of Trade and
          Industry (MOTRI) and the Ministry of Revenues. In case of license amendments, address relocations, or ECX seat
          re-elections, please upload updated certificates within 14 calendar days to maintain uninterrupted escrow payouts.
        </p>
      </div>
    </div>
  );
}
