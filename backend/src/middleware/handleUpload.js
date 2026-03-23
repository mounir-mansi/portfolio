const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé (JPEG, PNG, WebP uniquement)"));
  }
};

// Upload avec clé aléatoire (galerie projets)
function upload(prefix) {
  return multer({
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: multerS3({
      s3,
      bucket: process.env.R2_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        const unique = crypto.randomBytes(8).toString("hex");
        cb(null, `${prefix}/${unique}.${ext}`);
      },
    }),
  });
}

// Upload avec clé fixe (sections, photo principale)
function uploadFixed(key) {
  return multer({
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: multerS3({
      s3,
      bucket: process.env.R2_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => cb(null, key),
    }),
  });
}

module.exports = { upload, uploadFixed };
