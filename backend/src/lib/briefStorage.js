// Stockage privé des fichiers importés par les visiteurs (menu, logo).
// Production : Cloudflare R2, sous le préfixe brief/. Développement : dossier local, pour ne jamais écrire dans le vrai bucket.
const fs = require("fs/promises");
const path = require("path");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const LOCAL_DIR = path.join(__dirname, "../../private-uploads");
const KEY_REGEX = /^brief\/\d+\/[a-f0-9]{32}\.(pdf|jpg|png|webp)$/;

const useR2 = () => process.env.NODE_ENV === "production";

let s3;
const client = () => {
  if (!s3) {
    s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
};

function checkKey(key) {
  if (!KEY_REGEX.test(key)) throw new Error("Clé de fichier invalide");
}

const localPath = (key) => path.join(LOCAL_DIR, ...key.split("/"));

async function put(key, buffer, contentType) {
  checkKey(key);
  if (useR2()) {
    await client().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
    return;
  }
  const file = localPath(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buffer);
}

async function get(key) {
  checkKey(key);
  if (useR2()) {
    const res = await client().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    return Buffer.from(await res.Body.transformToByteArray());
  }
  return fs.readFile(localPath(key));
}

async function remove(key) {
  try {
    checkKey(key);
    if (useR2()) await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    else await fs.rm(localPath(key), { force: true });
  } catch (err) {
    console.error("briefStorage.remove:", err.message);
  }
}

module.exports = { put, get, remove };
