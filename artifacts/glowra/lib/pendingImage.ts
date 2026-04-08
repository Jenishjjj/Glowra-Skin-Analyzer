let _pendingBase64: string | null = null;
let _pendingMimeType: string = "image/jpeg";

export function setPendingImage(base64: string, mimeType: string) {
  _pendingBase64 = base64;
  _pendingMimeType = mimeType;
}

export function getPendingImage(): { base64: string | null; mimeType: string } {
  return { base64: _pendingBase64, mimeType: _pendingMimeType };
}

export function clearPendingImage() {
  _pendingBase64 = null;
  _pendingMimeType = "image/jpeg";
}
