"use client";

import React from "react";
import { ModalDialog } from "./modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import { Phone, Mail, HelpCircle, FileCheck, ExternalLink, ShieldCheck } from "lucide-react";

export function SupplierHelpModal() {
  const { activeModal, closeModal } = useSupplierStore();
  const isOpen = activeModal === "help-support";

  if (!isOpen) return null;

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title="MercatoX B2B Supplier Support & Knowledge Base"
      subtitle="Enterprise documentation, dedicated account manager, and mediation contacts"
      maxWidth="lg"
      footer={
        <button
          type="button"
          onClick={closeModal}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
        >
          Close Help Center
        </button>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Dedicated Account Manager Box */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                DEDICATED ACCOUNT EXECUTIVE
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5">Ato Ermias Hailu</h3>
              <p className="text-slate-600">Senior Agro & Industrial Commodity Specialist</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
              EH
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-emerald-100">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Phone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono">+251 11 551 8820 (Ext. 402)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Mail className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>e.hailu@mercatox.et</span>
            </div>
          </div>
        </div>

        {/* Quick Help Guides */}
        <div className="space-y-2">
          <p className="font-bold text-slate-900">Recommended Supplier Guides</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 p-3 hover:border-indigo-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>MercatoX Escrow Policy</span>
              </div>
              <p className="mt-1 text-slate-500">
                Learn how payments are secured via CBE/Telebirr escrow and how milestones release funds upon delivery.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 hover:border-indigo-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>RFQ to Quotation Workflow</span>
              </div>
              <p className="mt-1 text-slate-500">
                How to formulate compliant commercial quotes, tier discounts, and export FOB/CIF terms.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 hover:border-indigo-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dispute Resolution Charter</span>
              </div>
              <p className="mt-1 text-slate-500">
                Independent ECAE laboratory sampling, moisture arbitration, and weighbridge dispute handling.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 hover:border-indigo-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>ECX & Ministry of Trade Sync</span>
              </div>
              <p className="mt-1 text-slate-500">
                Synchronizing commodity warehouse receipts and electronic export declarations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
}
