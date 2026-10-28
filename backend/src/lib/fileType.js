// Détecte le vrai type d'un fichier à partir de ses premiers octets (jamais d'après son nom ni son type déclaré).
// Formats acceptés : PDF, JPEG, PNG, WebP. Le SVG est volontairement refusé (il peut contenir du code).
function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", mime: "image/png" };
  }
  if (buffer.subarray(0, 4).toString("latin1") === "RIFF" && buffer.subarray(8, 12).toString("latin1") === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

const MIME_BY_EXT = { pdf: "application/pdf", jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const FILE_ID_REGEX = /^[a-f0-9]{32}\.(pdf|jpg|png|webp)$/;

module.exports = { detectFileType, MIME_BY_EXT, FILE_ID_REGEX };
