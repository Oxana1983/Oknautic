"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { upsertInventoryRows } from "@/lib/inventory-actions";
import type { InventoryRow } from "@/lib/inventory-actions";
import * as XLSX from "xlsx";

const MAX_PREVIEW_ROWS = 100;

function normalizeHeader(h: string) {
  return String(h).trim().toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
}

function findCol(header: string[], names: string[]): number {
  return names.map((n) => header.indexOf(normalizeHeader(n))).find((i) => i >= 0) ?? -1;
}

type ParseMessages = {
  fileEmpty: string;
  missingCols: string;
  fileReadError: string;
};

function parseRows(rows2d: string[][], msgs: ParseMessages): { rows: InventoryRow[]; errors: string[] } {
  const dataRows = rows2d.filter((r) => r.some((c) => c?.toString().trim()));
  if (dataRows.length < 2) return { rows: [], errors: [msgs.fileEmpty] };

  const header = dataRows[0].map((h) => normalizeHeader(String(h ?? "")));

  const iSku   = findCol(header, ["sku", "артикул", "article"]);
  const iName  = findCol(header, ["product_name", "name", "наименование", "название", "productnamen", "productnameen"]);
  const iQty   = findCol(header, ["quantity", "qty", "количество", "кол"]);
  const iBrand = findCol(header, ["brand", "бренд", "производитель"]);
  const iCat   = findCol(header, ["category", "категория", "cat"]);
  const iPhoto = findCol(header, ["photo_url", "photo", "image", "фото", "изображение", "photourl"]);
  const iPrice = findCol(header, ["price", "цена", "priceexclvat", "priceexcl"]);
  const iCur   = findCol(header, ["currency", "валюта"]);
  const iCity  = findCol(header, ["location_city", "city", "город", "порт"]);
  const iCtry  = findCol(header, ["location_country", "country", "страна"]);

  if (iSku < 0 || iName < 0) {
    return { rows: [], errors: [msgs.missingCols] };
  }

  const rows: InventoryRow[] = [];
  const errors: string[] = [];

  dataRows.slice(1).forEach((cols, li) => {
    const sku = cols[iSku]?.toString().trim();
    const name = cols[iName]?.toString().trim();
    const qtyRaw = iQty >= 0 ? cols[iQty]?.toString().trim() : "";

    if (!sku || !name) { errors.push(`Row ${li + 2}: missing SKU or name`); return; }
    const quantity = qtyRaw ? parseInt(qtyRaw, 10) : 1;
    if (isNaN(quantity)) { errors.push(`Row ${li + 2}: invalid quantity "${qtyRaw}"`); return; }

    rows.push({
      sku,
      product_name: name,
      brand: iBrand >= 0 ? cols[iBrand]?.toString().trim() : undefined,
      category: iCat >= 0 ? cols[iCat]?.toString().trim() || undefined : undefined,
      photo_url: iPhoto >= 0 ? cols[iPhoto]?.toString().trim() || undefined : undefined,
      quantity,
      price: iPrice >= 0 ? parseFloat(cols[iPrice]?.toString().trim() ?? "") || undefined : undefined,
      currency: iCur >= 0 ? cols[iCur]?.toString().trim() || "EUR" : "EUR",
      location_city: iCity >= 0 ? cols[iCity]?.toString().trim() : undefined,
      location_country: iCtry >= 0 ? cols[iCtry]?.toString().trim() : undefined,
    });
  });

  return { rows, errors };
}

function parseFile(file: File, msgs: ParseMessages): Promise<{ rows: InventoryRow[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result as ArrayBuffer;
      try {
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows2d = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        resolve(parseRows(rows2d as string[][], msgs));
      } catch {
        resolve({ rows: [], errors: [msgs.fileReadError] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

type PreviewModalProps = {
  file: File;
  rows: InventoryRow[];
  parseErrors: string[];
  onConfirm: () => Promise<void>;
  onClose: () => void;
  uploading: boolean;
};

function PreviewModal({ file, rows, parseErrors, onConfirm, onClose, uploading }: PreviewModalProps) {
  const t = useTranslations("inventory");
  const shown = rows.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = rows.length - shown.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <Eye size={18} className="text-teal-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-900 text-sm">
                {t("previewModalTitle", { count: rows.length })}
              </p>
              <p className="text-xs text-navy-400 truncate max-w-[320px]">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Parse errors banner */}
        {parseErrors.length > 0 && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 shrink-0">
            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              {t("previewModalErrors", { count: parseErrors.length })}
            </p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto flex-1 mx-6 mt-4 rounded-xl border border-navy-100">
          <table className="w-full text-xs">
            <thead className="bg-navy-50 sticky top-0 z-10">
              <tr>
                {["#", "SKU", t("previewName"), t("previewBrand"), "Category", t("previewQty"), t("previewPrice"), "Currency"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-navy-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {shown.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/40"}>
                  <td className="px-3 py-1.5 text-navy-300">{i + 1}</td>
                  <td className="px-3 py-1.5 font-mono text-navy-700 whitespace-nowrap">{row.sku}</td>
                  <td className="px-3 py-1.5 text-navy-800 max-w-[240px] truncate">{row.product_name}</td>
                  <td className="px-3 py-1.5 text-navy-500 whitespace-nowrap">{row.brand ?? "—"}</td>
                  <td className="px-3 py-1.5 text-navy-500 max-w-[140px] truncate">{row.category ?? "—"}</td>
                  <td className="px-3 py-1.5 text-navy-700 text-right">{row.quantity}</td>
                  <td className="px-3 py-1.5 text-navy-700 text-right whitespace-nowrap">
                    {row.price ? row.price.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-navy-500">{row.currency ?? "EUR"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* "and N more" */}
        {hiddenCount > 0 && (
          <p className="text-xs text-center text-navy-400 mt-2 shrink-0">
            {t("previewModalMore", { count: hiddenCount })}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-100 shrink-0 mt-4">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-sm text-navy-600 hover:bg-navy-50 transition-colors disabled:opacity-40"
          >
            {t("cancel")}
          </button>
          <Button
            variant="primary"
            size="md"
            loading={uploading}
            onClick={onConfirm}
          >
            <Upload size={14} />
            {uploading
              ? t("previewModalUploading")
              : t("previewModalConfirm", { count: rows.length })}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InventoryUpload() {
  const t = useTranslations("inventory");
  const msgs: ParseMessages = {
    fileEmpty: t("fileEmpty"),
    missingCols: t("missingCols"),
    fileReadError: t("fileReadError"),
  };

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<InventoryRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count?: number; error?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setResult(null);
    setFile(f);
    const { rows, errors } = await parseFile(f, msgs);
    setParsedRows(rows);
    setParseErrors(errors);
    // Open modal only if we have at least some valid rows or fatal parse errors
    setShowModal(true);
  }

  async function handleConfirm() {
    if (!parsedRows.length) return;
    setUploading(true);
    const res = await upsertInventoryRows(parsedRows);
    setUploading(false);
    setResult(res);
    if (!res.error) {
      setShowModal(false);
      setFile(null);
      setParsedRows([]);
      setParseErrors([]);
    }
  }

  function handleClose() {
    if (uploading) return;
    setShowModal(false);
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-navy-200 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
      >
        <FileSpreadsheet size={36} className="text-navy-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-navy-700">{t("uploadDrop")}</p>
        <p className="text-xs text-navy-400 mt-1">{t("uploadHint")}</p>
        <p className="text-xs text-navy-400">{t("uploadOptional")}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      <div className="text-xs text-navy-400 flex items-center gap-1.5">
        <Upload size={12} />
        {t("uploadExample")}
        <code className="bg-navy-50 px-1.5 py-0.5 rounded text-navy-600 font-mono">
          GRM-ECHOMAP94SV,Garmin ECHOMAP Ultra 94sv,Garmin,navigation,https://…/photo.jpg,3,1250.00,EUR,Antibes,France
        </code>
      </div>

      {/* Success banner */}
      {result?.count && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-700">
          <CheckCircle2 size={16} className="shrink-0" />
          {t("uploadSuccess", { count: result.count })}
        </div>
      )}
      {result?.error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {result.error}
        </div>
      )}

      {/* Preview modal */}
      {showModal && file && (
        <PreviewModal
          file={file}
          rows={parsedRows}
          parseErrors={parseErrors}
          onConfirm={handleConfirm}
          onClose={handleClose}
          uploading={uploading}
        />
      )}
    </div>
  );
}
