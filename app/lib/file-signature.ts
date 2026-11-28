/**
 * Checks what a picked file really is, from its first bytes, before it's uploaded, so a wrong or
 * disguised file is caught instantly with a clear message. The API checks everything again (and
 * more deeply); this is only for quick feedback. Keep the messages in step with the backend's
 * src/upload-validation.
 */
type FileType = 'jpeg' | 'png' | 'pdf' | 'xlsx' | 'csv';

/** Same kinds as the API's upload policies. */
export type UploadKind = 'photo' | 'document' | 'spreadsheet';

const MB = 1024 * 1024;
const KINDS: Record<UploadKind, { types: FileType[]; maxBytes: number; accepted: string }> = {
 photo: { types: ['jpeg', 'png'], maxBytes: 5 * MB, accepted: 'JPEG or PNG' },
 document: { types: ['jpeg', 'png', 'pdf'], maxBytes: 5 * MB, accepted: 'JPEG, PNG or PDF' },
 spreadsheet: { types: ['xlsx', 'csv'], maxBytes: 50 * MB, accepted: 'Excel (.xlsx) or CSV' },
};

const EXTENSIONS: Record<FileType, string[]> = {
 jpeg: ['jpg', 'jpeg', 'jfif'],
 png: ['png'],
 pdf: ['pdf'],
 xlsx: ['xlsx'],
 csv: ['csv'],
};

const starts = (bytes: Uint8Array, signature: number[]) => signature.every((byte, i) => bytes[i] === byte);

async function detect(file: File): Promise<FileType | null> {
 const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
 if (starts(head, [0xff, 0xd8, 0xff])) return 'jpeg';
 if (starts(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
 if (starts(head, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf'; // %PDF-
 if (starts(head, [0x50, 0x4b, 0x03, 0x04])) return 'xlsx'; // ZIP; the API checks it's really a workbook
 // CSV has no signature: a .csv name and text content (no NUL bytes).
 if (file.name.toLowerCase().endsWith('.csv') && head.length > 0 && !head.includes(0)) return 'csv';
 return null;
}

/** Returns what's wrong with the file for this kind of upload, or null if it looks right. */
export async function checkUploadFile(file: File, kind: UploadKind): Promise<string | null> {
 const policy = KINDS[kind];
 if (file.size === 0) return 'This file is empty.';
 if (file.size > policy.maxBytes) return `The file is larger than ${Math.round(policy.maxBytes / MB)} MB.`;

 const type = await detect(file);
 const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
 // A name that says one type while the bytes say another is a disguised file; no extension is fine.
 if (!type || !policy.types.includes(type) || (extension && !EXTENSIONS[type].includes(extension))) {
  return `Only ${policy.accepted} files are accepted.`;
 }
 return null;
}
