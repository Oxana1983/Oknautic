"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertInventoryRows } from "@/lib/inventory-actions";
import type { InventoryRow } from "@/lib/inventory-actions";
import * as XLSX from "xlsx";

// Normalize header names: lowercase, strip spaces/underscores/special chars
// "Product Name" → "productname", "product_name" → "productname"
function normalizeHeader(h: string) {
  return String(h).trim().toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
}

function findCol(header: string[], names: string[]): number {
  return names.map((n) => header.indexOf(normalizeHeader(n))).find((i) => i >= 0) ?? -1;
}

// Parse a 2D array of rows (from CSV or Excel sheet) → InventoryRow[]
function parseRows(rows2d: string[][]): { rows: InventoryRow[]; errors: string[] } {
  const dataRows = rows2d.filter((r) => r.some((c) => c?.toString().trim()));
  if (dataRows.length < 2) return { rows: [], errors: ["Файл пустой или содержит только заголовок"] };

  const header = dataRows[0].map((h) => normalizeHeader(String(h ?? "")));

  const iSku   = findCol(header, ["sku", "артикул", "article"]);
  const iName  = findCol(header, ["product_name", "name", "наименование", "название"]);
  const iQty   = findCol(header, ["quantity", "qty", "количество", "кол"]);
  const iBrand = findCol(header, ["brand", "бренд", "производитель"]);
  const iCat   = findCol(header, ["category", "категория", "cat"]);
  const iPrice = findCol(header, ["price", "цена"]);
  const iCur   = findCol(header, ["currency", "валюта"]);
  const iCity  = findCol(header, ["location_city", "city", "город", "порт"]);
  const iCtry  = findCol(header, ["location_country", "country", "страна"]);

  if (iSku < 0 || iName < 0 || iQty < 0) {
    return { rows: [], errors: ["Не найдены обязательные колонки: SKU, Название, Количество"] };
  }

  const rows: InventoryRow[] = [];
  const errors: string[] = [];

  dataRows.slice(1).forEach((cols, li) => {
    const sku = cols[iSku]?.toString().trim();
    const name = cols[iName]?.toString().trim();
    const qtyRaw = cols[iQty]?.toString().trim();

    if (!sku || !name) { errors.push(`Строка ${li + 2}: пропущен SKU или название`); return; }
    const quantity = parseInt(qtyRaw ?? "0", 10);
    if (isNaN(quantity)) { errors.push(`Строка ${li + 2}: некорректное количество "${qtyRaw}"`); return; }

    rows.push({
      sku,
      product_name: name,
      brand: iBrand >= 0 ? cols[iBrand]?.toString().trim() : undefined,
      category: iCat >= 0 ? cols[iCat]?.toString().trim() || undefined : undefined,
      quantity,
      price: iPrice >= 0 ? parseFloat(cols[iPrice]?.toString().trim() ?? "") || undefined : undefined,
      currency: iCur >= 0 ? cols[iCur]?.toString().trim() || "EUR" : "EUR",
      location_city: iCity >= 0 ? cols[iCity]?.toString().trim() : undefined,
      location_country: iCtry >= 0 ? cols[iCtry]?.toString().trim() : undefined,
    });
  });

  return { rows, errors };
}

// Read file as ArrayBuffer and parse CSV or Excel
function parseFile(file: File): Promise<{ rows: InventoryRow[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result as ArrayBuffer;
      try {
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows2d = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        resolve(parseRows(rows2d as string[][]));
      } catch {
        resolve({ rows: [], errors: ["Не удалось прочитать файл. Убедитесь, что это Excel (.xlsx/.xls) или CSV."] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function InventoryUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<InventoryRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count?: number; error?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setResult(null);
    const { rows, errors } = await parseFile(f);
    setPreview(rows.slice(0, 5));
    setParseErrors(errors);
  }

  async function handleUpload() {
    if (!file) return;
    const { rows, errors } = await parseFile(file);
    if (errors.length && !rows.length) { setParseErrors(errors); return; }

    setUploading(true);
    const res = await upsertInventoryRows(rows);
    setUploading(false);
    setResult(res);
    if (!res.error) { setFile(null); setPreview([]); }
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
        <p className="text-sm font-medium text-navy-700">Перетащите CSV/Excel файл или нажмите для выбора</p>
        <p className="text-xs text-navy-400 mt-1">Формат: SKU, Product Name, Brand, Quantity, Price, Currency, City, Country</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Template download hint */}
      <div className="text-xs text-navy-400 flex items-center gap-1.5">
        <Upload size={12} />
        Пример строки CSV:
        <code className="bg-navy-50 px-1.5 py-0.5 rounded text-navy-600 font-mono">
          GRM-ECHOMAP94SV,Garmin ECHOMAP Ultra 94sv,Garmin,3,1250.00,EUR,Antibes,France
        </code>
      </div>

      {/* Selected file */}
      {file && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
          <FileSpreadsheet size={18} className="text-navy-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-800 truncate">{file.name}</p>
            <p className="text-xs text-navy-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => { setFile(null); setPreview([]); setParseErrors([]); }} className="text-navy-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 space-y-1">
          {parseErrors.map((e, i) => (
            <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />{e}
            </p>
          ))}
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <p className="text-xs font-medium text-navy-500 mb-2">Предпросмотр (первые 5 строк):</p>
          <div className="overflow-x-auto rounded-xl border border-navy-100">
            <table className="w-full text-xs">
              <thead className="bg-navy-50">
                <tr>
                  {["SKU", "Название", "Бренд", "Кол-во", "Цена", "Город"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-navy-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {preview.map((row, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-3 py-2 font-mono text-navy-700">{row.sku}</td>
                    <td className="px-3 py-2 text-navy-800 max-w-[180px] truncate">{row.product_name}</td>
                    <td className="px-3 py-2 text-navy-500">{row.brand ?? "—"}</td>
                    <td className="px-3 py-2 font-medium text-navy-800">{row.quantity}</td>
                    <td className="px-3 py-2 text-navy-500">{row.price ? `${row.price} ${row.currency}` : "—"}</td>
                    <td className="px-3 py-2 text-navy-500">{row.location_city ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success */}
      {result?.count && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-700">
          <CheckCircle2 size={16} className="shrink-0" />
          Загружено {result.count} позиций. Склад обновлён.
        </div>
      )}
      {result?.error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {result.error}
        </div>
      )}

      {file && preview.length > 0 && !result?.count && (
        <Button variant="primary" size="md" loading={uploading} onClick={() => void handleUpload()}>
          <Upload size={15} />
          Загрузить {preview.length >= 5 ? "все позиции" : `${preview.length} позиции`}
        </Button>
      )}
    </div>
  );
}
