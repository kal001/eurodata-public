/**
 * IndexedDB service for local-storage users.
 * Banking data stays in the browser; no server-side transaction rows.
 * Optional passphrase-based encryption (AES-GCM) so data at rest is encrypted like in cloud.
 */

import * as enc from "./localEncryption";

const DB_NAME = "eurodata_local";
const DB_VERSION = 2;
const STORE_TRANSACTIONS = "transactions";
const STORE_META = "meta";
const META_KEY_ENCRYPTION = "encryption";
const PERSISTED_KEY_STORAGE_KEY = "eurodata_local_key";

let encryptionKeyRef: CryptoKey | null = null;

export type LocalTransaction = {
  local_id: string;
  id: number;
  bank_account_id: number;
  institution_name?: string | null;
  account_name?: string | null;
  account_friendly_name?: string | null;
  transaction_id: string;
  status: string;
  amount: string;
  currency: string;
  booking_date?: string | null;
  value_date?: string | null;
  posting_date?: string | null;
  description?: string | null;
  include_in_totals?: boolean;
  category_id?: number | null;
  category_name?: string | null;
  tags?: { id: number; name: string }[];
  is_new?: boolean;
  comment?: string | null;
  has_alert?: boolean;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "local_id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
  });
}

export type LocalEncryptionMeta = { salt: string; check: string } | null;

async function getMeta(): Promise<{ encryption?: LocalEncryptionMeta }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readonly");
    const req = tx.objectStore(STORE_META).get(META_KEY_ENCRYPTION);
    req.onsuccess = () => {
      const row = req.result;
      db.close();
      resolve(row ? { encryption: { salt: row.salt, check: row.check } } : {});
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

/** True if local transaction store is encrypted (passphrase required to read). */
export async function isLocalDataEncrypted(): Promise<boolean> {
  const meta = await getMeta();
  return !!meta.encryption;
}

/** Get encryption meta (salt/check) if set. Used by UI to show unlock. */
export async function getLocalEncryptionMeta(): Promise<LocalEncryptionMeta> {
  const meta = await getMeta();
  return meta.encryption ?? null;
}

/** Set the decryption key from passphrase. Call after user enters passphrase; verifies against stored check. Persists key in localStorage so unlock survives refresh and browser restart. */
export async function setLocalEncryptionKey(passphrase: string): Promise<boolean> {
  const meta = await getMeta();
  if (!meta.encryption) return false;
  const salt = enc.decodeBase64(meta.encryption.salt);
  const key = await enc.deriveKey(passphrase, salt);
  const ok = await enc.verifyCheck(meta.encryption.check, key);
  if (ok) {
    encryptionKeyRef = key;
    try {
      const exported = await enc.exportKeyRaw(key);
      localStorage.setItem(PERSISTED_KEY_STORAGE_KEY, exported);
    } catch (e) {
      console.warn("[eurodata] Could not persist unlock key to localStorage:", e);
    }
  }
  return ok;
}

/** Clear the in-memory key (lock). Also clears localStorage so refresh will require unlock again. */
export function clearLocalEncryptionKey(): void {
  encryptionKeyRef = null;
  try {
    localStorage.removeItem(PERSISTED_KEY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Restore decryption key from localStorage (e.g. after refresh or new tab). Returns true if restored and valid. */
export async function restoreLocalEncryptionFromSession(): Promise<boolean> {
  const meta = await getMeta();
  if (!meta.encryption) return false;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(PERSISTED_KEY_STORAGE_KEY);
  } catch {
    return false;
  }
  if (!stored) return false;
  try {
    const key = await enc.importKeyRaw(stored);
    const ok = await enc.verifyCheck(meta.encryption.check, key);
    if (ok) {
      encryptionKeyRef = key;
      return true;
    }
  } catch {
    // invalid or wrong key
    try {
      localStorage.removeItem(PERSISTED_KEY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return false;
}

/** True if encryption is enabled and the key is currently in memory (data is readable). */
export function isLocalDataUnlocked(): boolean {
  return !!encryptionKeyRef;
}

/** Enable encryption for local data: set passphrase, encrypt all existing records. */
export async function enableLocalEncryption(passphrase: string): Promise<void> {
  const all = await localTransactionsGetAllUnsafe();
  const salt = enc.randomSalt();
  const key = await enc.deriveKey(passphrase, salt);
  const check = await enc.createCheck(key);
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_TRANSACTIONS], "readwrite");
    const metaStore = tx.objectStore(STORE_META);
    metaStore.put({ key: META_KEY_ENCRYPTION, salt: enc.encodeBase64(salt), check });
    const store = tx.objectStore(STORE_TRANSACTIONS);
    store.clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
  encryptionKeyRef = key;
  const toPut: { local_id: string; cipher: string }[] = [];
  for (const t of all) {
    const rec: LocalTransaction = { ...t, local_id: t.local_id || `local_${t.bank_account_id}_${t.transaction_id}` };
    const cipher = await enc.encrypt(JSON.stringify(rec), key);
    toPut.push({ local_id: rec.local_id, cipher });
  }
  const db2 = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db2.transaction(STORE_TRANSACTIONS, "readwrite");
    const store = tx.objectStore(STORE_TRANSACTIONS);
    for (const row of toPut) store.put(row);
    tx.oncomplete = () => { db2.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

/** Disable encryption: decrypt all, remove meta, store plain. Requires key to be set. */
export async function disableLocalEncryption(passphrase: string): Promise<boolean> {
  if (!encryptionKeyRef) {
    const ok = await setLocalEncryptionKey(passphrase);
    if (!ok) return false;
  }
  const key = encryptionKeyRef!;
  const db = await openDB();
  const raw = await new Promise<Array<{ local_id: string; cipher?: string }>>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
    const req = tx.objectStore(STORE_TRANSACTIONS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
  const decrypted: LocalTransaction[] = [];
  for (const row of raw) {
    if (row.cipher) {
      const plain = await enc.decrypt(row.cipher, key);
      decrypted.push(JSON.parse(plain) as LocalTransaction);
    } else {
      decrypted.push(row as unknown as LocalTransaction);
    }
  }
  const db2 = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db2.transaction([STORE_META, STORE_TRANSACTIONS], "readwrite");
    tx.objectStore(STORE_META).delete(META_KEY_ENCRYPTION);
    const store = tx.objectStore(STORE_TRANSACTIONS);
    store.clear();
    tx.oncomplete = () => { db2.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
  encryptionKeyRef = null;
  for (const rec of decrypted) {
    await localTransactionsMergeFromFetch([rec]);
  }
  return true;
}

/** Get all without decryption (for enableLocalEncryption when data is still plain). */
async function localTransactionsGetAllUnsafe(): Promise<LocalTransaction[]> {
  const meta = await getMeta();
  const db = await openDB();
  const raw = await new Promise<Array<Record<string, unknown> & { local_id: string; cipher?: string }>>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
    const req = tx.objectStore(STORE_TRANSACTIONS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
  if (!meta.encryption) return raw as LocalTransaction[];
  if (!encryptionKeyRef) return [];
  const out: LocalTransaction[] = [];
  for (const row of raw) {
    if (row.cipher) {
      const plain = await enc.decrypt(row.cipher, encryptionKeyRef!);
      out.push(JSON.parse(plain) as LocalTransaction);
    } else {
      out.push(row as unknown as LocalTransaction);
    }
  }
  return out;
}

export async function localTransactionsGetAll(): Promise<LocalTransaction[]> {
  return localTransactionsGetAllUnsafe();
}

/** Merge fetched transactions into IndexedDB (upsert by local_id). Encrypts when encryption is enabled. */
export async function localTransactionsMergeFromFetch(
  transactions: LocalTransaction[]
): Promise<void> {
  if (transactions.length === 0) return;
  const meta = await getMeta();
  const useEncryption = !!meta.encryption && !!encryptionKeyRef;
  const db = await openDB();
  if (!useEncryption) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
      const store = tx.objectStore(STORE_TRANSACTIONS);
      for (const t of transactions) {
        const rec: LocalTransaction = {
          ...t,
          local_id: t.local_id || `local_${t.bank_account_id}_${t.transaction_id}`,
        };
        store.put(rec);
      }
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    });
  }
  const toPut: { local_id: string; cipher: string }[] = [];
  for (const t of transactions) {
    const rec: LocalTransaction = {
      ...t,
      local_id: t.local_id || `local_${t.bank_account_id}_${t.transaction_id}`,
    };
    const cipher = await enc.encrypt(JSON.stringify(rec), encryptionKeyRef!);
    toPut.push({ local_id: rec.local_id, cipher });
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
    const store = tx.objectStore(STORE_TRANSACTIONS);
    for (const row of toPut) store.put(row);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

export async function localTransactionsClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
    tx.objectStore(STORE_TRANSACTIONS).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Export all local transactions as JSON (for "Download my data"). */
export async function localTransactionsExportJSON(): Promise<string> {
  const all = await localTransactionsGetAll();
  return JSON.stringify(all, null, 2);
}

/** Export all local transactions as CSV. */
export async function localTransactionsExportCSV(): Promise<string> {
  const all = await localTransactionsGetAll();
  const header = [
    "local_id",
    "bank_account_id",
    "institution_name",
    "account_name",
    "account_friendly_name",
    "transaction_id",
    "status",
    "amount",
    "currency",
    "booking_date",
    "value_date",
    "posting_date",
    "description",
    "include_in_totals",
    "category_id",
    "category_name",
    "is_new",
    "comment",
  ];
  const rows = all.map((t) => [
    t.local_id,
    t.bank_account_id,
    t.institution_name ?? "",
    t.account_name ?? "",
    t.account_friendly_name ?? "",
    t.transaction_id,
    t.status,
    t.amount,
    t.currency,
    t.booking_date ?? "",
    t.value_date ?? "",
    t.posting_date ?? "",
    (t.description ?? "").replace(/"/g, '""'),
    t.include_in_totals ?? true,
    t.category_id ?? "",
    t.category_name ?? "",
    t.is_new ?? true,
    (t.comment ?? "").replace(/"/g, '""'),
  ]);
  const csvContent = [header.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  return "\uFEFF" + csvContent;
}

/** Format date for OFX (YYYYMMDD). */
function toOFXDate(s: string | null | undefined): string {
  if (!s) return "";
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}${m[2]}${m[3]}` : s.replace(/-/g, "").slice(0, 8);
}

/** Escape XML text for OFX. */
function escapeOFX(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Build OFX 2.0 XML from a list of transactions (for local or cloud export). */
export function buildOFXFromTransactions(all: LocalTransaction[]): string {
  const dates = all.flatMap((t) => [t.booking_date, t.value_date].filter(Boolean)) as string[];
  const dateStart = dates.length > 0 ? toOFXDate(dates.reduce((a, b) => (a < b ? a : b))) : "19700101";
  const dateEnd = dates.length > 0 ? toOFXDate(dates.reduce((a, b) => (a > b ? a : b))) : "20991231";
  const stmtTrns = all.map((t) => {
    const amt = parseFloat(t.amount) || 0;
    const trnType = amt >= 0 ? "CREDIT" : "DEBIT";
    const dt = toOFXDate(t.booking_date || t.value_date || t.posting_date) || dateEnd;
    const name = (t.description || "").trim().split(/\n/)[0] || "Transaction";
    const memo = (t.description || "").trim();
    return `<STMTTRN>
  <TRNTYPE>${trnType}</TRNTYPE>
  <DTPOSTED>${dt}</DTPOSTED>
  <TRNAMT>${t.amount}</TRNAMT>
  <FITID>${escapeOFX(t.transaction_id || t.local_id)}</FITID>
  <NAME>${escapeOFX(name.slice(0, 32))}</NAME>
  <MEMO>${escapeOFX(memo.slice(0, 255))}</MEMO>
</STMTTRN>`;
  }).join("\n");
  const currency = all[0]?.currency || "EUR";
  return `<?xml version="1.0" encoding="UTF-8"?>
<?ofx version="2.0" encoding="UTF-8"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <CURDEF>${escapeOFX(currency)}</CURDEF>
        <BANKACCTFROM>
          <BANKID>000000</BANKID>
          <ACCTID>local</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${dateStart}</DTSTART>
          <DTEND>${dateEnd}</DTEND>
${stmtTrns}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
}

/** Export all local transactions as OFX 2.0 XML. */
export async function localTransactionsExportOFX(): Promise<string> {
  const all = await localTransactionsGetAll();
  return buildOFXFromTransactions(all);
}

/** Import from OFX (XML 2.x or SGML 1.x). Merges by local_id. */
export async function localTransactionsImportFromOFX(ofxString: string): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const toPut: LocalTransaction[] = [];
  const isXML = /<\?xml|<\/OFX>|<OFX>/.test(ofxString.trim());
  if (isXML && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(ofxString, "text/xml");
      const stmtTrns = doc.getElementsByTagName("STMTTRN");
      for (let i = 0; i < stmtTrns.length; i++) {
        const tr = stmtTrns[i];
        const get = (tag: string) => (tr.getElementsByTagName(tag)[0]?.textContent ?? "").trim();
        const fitId = get("FITID") || `ofx_${i}`;
        const amount = get("TRNAMT") || "0";
        const dt = get("DTPOSTED").slice(0, 8);
        const dateStr = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : null;
        const name = get("NAME") || get("MEMO") || "OFX";
        const bankAccountId = 1;
        toPut.push({
          local_id: `local_${bankAccountId}_${fitId}`,
          id: 0,
          bank_account_id: bankAccountId,
          transaction_id: fitId,
          status: "booked",
          amount,
          currency: "EUR",
          booking_date: dateStr,
          value_date: dateStr,
          posting_date: dateStr,
          description: name,
          include_in_totals: true,
          is_new: true,
        });
      }
    } catch (e) {
      errors.push("Invalid OFX XML");
    }
  } else {
    const stmtTrnBlocks = ofxString.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
    for (let i = 0; i < stmtTrnBlocks.length; i++) {
      const block = stmtTrnBlocks[i];
      const getTag = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
        return (m ? m[1].trim() : "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      };
      const fitId = getTag("FITID") || `ofx_${i}`;
      const amount = getTag("TRNAMT") || "0";
      const dt = getTag("DTPOSTED").slice(0, 8);
      const dateStr = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : null;
      const name = getTag("NAME") || getTag("MEMO") || "OFX";
      toPut.push({
        local_id: `local_1_${fitId}`,
        id: 0,
        bank_account_id: 1,
        transaction_id: fitId,
        status: "booked",
        amount,
        currency: "EUR",
        booking_date: dateStr,
        value_date: dateStr,
        posting_date: dateStr,
        description: name,
        include_in_totals: true,
        is_new: true,
      });
    }
  }
  if (toPut.length > 0) {
    await localTransactionsMergeFromFetch(toPut);
  }
  return { imported: toPut.length, errors };
}

/** Parse OFX to array of transactions for POST /api/transactions/import (cloud). */
export function parseOFXToImportPayload(ofxString: string): { transactions: Array<{
  bank_account_id: number;
  transaction_id: string;
  amount: string;
  currency: string;
  booking_date: string | null;
  value_date: string | null;
  posting_date: string | null;
  description: string | null;
  status: string;
  include_in_totals: boolean;
  category_id: number | null;
  tag_ids: number[];
  is_new: boolean;
  comment: string | null;
}>; errors: string[] } {
  const errors: string[] = [];
  const toPut: LocalTransaction[] = [];
  const isXML = /<\?xml|<\/OFX>|<OFX>/.test(ofxString.trim());
  if (isXML && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(ofxString, "text/xml");
      const stmtTrns = doc.getElementsByTagName("STMTTRN");
      for (let i = 0; i < stmtTrns.length; i++) {
        const tr = stmtTrns[i];
        const get = (tag: string) => (tr.getElementsByTagName(tag)[0]?.textContent ?? "").trim();
        const fitId = get("FITID") || `ofx_${i}`;
        const amount = get("TRNAMT") || "0";
        const dt = get("DTPOSTED").slice(0, 8);
        const dateStr = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : null;
        const name = get("NAME") || get("MEMO") || "OFX";
        toPut.push({
          local_id: `local_1_${fitId}`,
          id: 0,
          bank_account_id: 1,
          transaction_id: fitId,
          status: "booked",
          amount,
          currency: "EUR",
          booking_date: dateStr,
          value_date: dateStr,
          posting_date: dateStr,
          description: name,
          include_in_totals: true,
          is_new: true,
        });
      }
    } catch {
      errors.push("Invalid OFX XML");
    }
  } else {
    const stmtTrnBlocks = ofxString.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
    for (let i = 0; i < stmtTrnBlocks.length; i++) {
      const block = stmtTrnBlocks[i];
      const getTag = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
        return (m ? m[1].trim() : "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      };
      const fitId = getTag("FITID") || `ofx_${i}`;
      const amount = getTag("TRNAMT") || "0";
      const dt = getTag("DTPOSTED").slice(0, 8);
      const dateStr = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : null;
      const name = getTag("NAME") || getTag("MEMO") || "OFX";
      toPut.push({
        local_id: `local_1_${fitId}`,
        id: 0,
        bank_account_id: 1,
        transaction_id: fitId,
        status: "booked",
        amount,
        currency: "EUR",
        booking_date: dateStr,
        value_date: dateStr,
        posting_date: dateStr,
        description: name,
        include_in_totals: true,
        is_new: true,
      });
    }
  }
  const transactions = toPut.map((t) => ({
    bank_account_id: t.bank_account_id,
    transaction_id: t.transaction_id,
    amount: t.amount,
    currency: t.currency ?? "",
    booking_date: t.booking_date ?? null,
    value_date: t.value_date ?? null,
    posting_date: t.posting_date ?? null,
    description: t.description ?? null,
    status: t.status ?? "booked",
    include_in_totals: t.include_in_totals !== false,
    category_id: t.category_id ?? null,
    tag_ids: (t.tags ?? []).map((x) => x.id),
    is_new: t.is_new !== false,
    comment: t.comment ?? null,
  }));
  return { transactions, errors };
}

/** Import from JSON (array of LocalTransaction-like objects). Merges by local_id. */
export async function localTransactionsImportFromJSON(jsonString: string): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let arr: unknown[];
  try {
    arr = JSON.parse(jsonString);
  } catch (e) {
    return { imported: 0, errors: ["Invalid JSON"] };
  }
  if (!Array.isArray(arr)) {
    return { imported: 0, errors: ["Expected a JSON array"] };
  }
  const toPut: LocalTransaction[] = [];
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i] as Record<string, unknown>;
    const local_id = typeof o.local_id === "string" ? o.local_id : `local_${o.bank_account_id}_${o.transaction_id}`;
    const bank_account_id = Number(o.bank_account_id);
    const transaction_id = String(o.transaction_id ?? "");
    if (!transaction_id || Number.isNaN(bank_account_id)) {
      errors.push(`Row ${i + 1}: missing transaction_id or bank_account_id`);
      continue;
    }
    toPut.push({
      local_id,
      id: typeof o.id === "number" ? o.id : 0,
      bank_account_id,
      institution_name: o.institution_name as string | null | undefined,
      account_name: o.account_name as string | null | undefined,
      account_friendly_name: o.account_friendly_name as string | null | undefined,
      transaction_id,
      status: (o.status as string) || "booked",
      amount: String(o.amount ?? "0"),
      currency: String(o.currency ?? ""),
      booking_date: o.booking_date as string | null | undefined,
      value_date: o.value_date as string | null | undefined,
      posting_date: o.posting_date as string | null | undefined,
      description: o.description as string | null | undefined,
      include_in_totals: o.include_in_totals !== false,
      category_id: o.category_id as number | null | undefined,
      category_name: o.category_name as string | null | undefined,
      tags: (o.tags as { id: number; name: string }[]) || [],
      is_new: o.is_new !== false,
      comment: o.comment as string | null | undefined,
      has_alert: o.has_alert === true,
    });
  }
  if (toPut.length > 0) {
    await localTransactionsMergeFromFetch(toPut);
  }
  return { imported: toPut.length, errors };
}

/** Parse CSV string (with header) into LocalTransaction[]. Supports our export format and backend export (id, bank_account_id, ...). */
function parseCSVToTransactionRows(csvString: string): { rows: LocalTransaction[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csvString.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return { rows: [], errors: ["CSV must have a header and at least one row"] };
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows: LocalTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: column count mismatch`);
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = values[j] ?? ""));
    const bank_account_id = Number(row.bank_account_id ?? row["bank_account_id"]);
    const transaction_id = String(row.transaction_id ?? row["transaction_id"] ?? "").trim();
    if (!transaction_id || Number.isNaN(bank_account_id)) {
      errors.push(`Row ${i + 1}: missing transaction_id or bank_account_id`);
      continue;
    }
    const local_id = (row.local_id ?? row["local_id"] ?? "").trim() || `local_${bank_account_id}_${transaction_id}`;
    rows.push({
      local_id,
      id: Number(row.id ?? row["id"]) || 0,
      bank_account_id,
        institution_name: (row.institution_name ?? row["institution_name"]) || null,
        account_name: (row.account_name ?? row["account_name"]) || null,
        account_friendly_name: (row.account_friendly_name ?? row["account_friendly_name"]) || null,
      transaction_id,
      status: (row.status ?? row["status"] ?? "booked").trim() || "booked",
      amount: String(row.amount ?? row["amount"] ?? "0").trim(),
      currency: String(row.currency ?? row["currency"] ?? "").trim(),
      booking_date: (row.booking_date ?? row["booking_date"]) || null,
      value_date: (row.value_date ?? row["value_date"]) || null,
      posting_date: (row.posting_date ?? row["posting_date"]) || null,
      description: (row.description ?? row["description"]) || null,
      include_in_totals: (row.include_in_totals ?? row["include_in_totals"]) !== "false",
      category_id: row.category_id ?? row["category_id"] ? Number(row.category_id ?? row["category_id"]) : null,
      category_name: (row.category_name ?? row["category_name"]) || null,
      tags: [],
      is_new: (row.is_new ?? row["is_new"]) !== "false",
      comment: (row.comment ?? row["comment"]) || null,
      has_alert: false,
    });
  }
  return { rows, errors };
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      cur += c;
    } else if (c === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/** Import from CSV. Merges by local_id (avoids duplicates). */
export async function localTransactionsImportFromCSV(csvString: string): Promise<{ imported: number; errors: string[] }> {
  const { rows, errors } = parseCSVToTransactionRows(csvString);
  if (rows.length > 0) {
    await localTransactionsMergeFromFetch(rows);
  }
  return { imported: rows.length, errors };
}

/** Parse CSV to array of objects suitable for POST /api/transactions/import (cloud). */
export function parseCSVToImportPayload(csvString: string): { transactions: Array<{
  bank_account_id: number;
  transaction_id: string;
  amount: string;
  currency: string;
  booking_date: string | null;
  value_date: string | null;
  posting_date: string | null;
  description: string | null;
  status: string;
  include_in_totals: boolean;
  category_id: number | null;
  tag_ids: number[];
  is_new: boolean;
  comment: string | null;
}>; errors: string[] } {
  const { rows, errors } = parseCSVToTransactionRows(csvString);
  const transactions = rows.map((t) => ({
    bank_account_id: t.bank_account_id,
    transaction_id: t.transaction_id,
    amount: t.amount,
    currency: t.currency ?? "",
    booking_date: t.booking_date ?? null,
    value_date: t.value_date ?? null,
    posting_date: t.posting_date ?? null,
    description: t.description ?? null,
    status: t.status ?? "booked",
    include_in_totals: t.include_in_totals !== false,
    category_id: t.category_id ?? null,
    tag_ids: (t.tags ?? []).map((x) => x.id),
    is_new: t.is_new !== false,
    comment: t.comment ?? null,
  }));
  return { transactions, errors };
}

/** Download blob as file. */
export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
