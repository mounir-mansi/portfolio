const mockSend = jest.fn().mockResolvedValue({});

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn((input) => ({ input })),
  GetObjectCommand: jest.fn((input) => ({ input })),
  DeleteObjectCommand: jest.fn((input) => ({ input })),
}));

const briefStorage = require("../src/lib/briefStorage");

const KEY = `brief/1/${"a".repeat(32)}.pdf`;
const env = { ...process.env };

beforeEach(() => {
  mockSend.mockClear();
  process.env.NODE_ENV = "production";
  process.env.R2_BUCKET = "bucket-public";
  process.env.R2_BRIEF_BUCKET = "bucket-prive";
});

afterAll(() => {
  process.env = env;
});

describe("Stockage des fichiers de brief en production", () => {
  test("écrit dans le bucket privé, jamais dans le bucket public", async () => {
    await briefStorage.put(KEY, Buffer.from("x"), "application/pdf");
    expect(mockSend.mock.calls[0][0].input.Bucket).toBe("bucket-prive");
  });

  test("refuse d'écrire si R2_BRIEF_BUCKET est absent (pas de repli sur le bucket public)", async () => {
    delete process.env.R2_BRIEF_BUCKET;
    await expect(briefStorage.put(KEY, Buffer.from("x"), "application/pdf")).rejects.toThrow("R2_BRIEF_BUCKET");
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("refuse d'écrire si R2_BRIEF_BUCKET est le bucket public", async () => {
    process.env.R2_BRIEF_BUCKET = "bucket-public";
    await expect(briefStorage.put(KEY, Buffer.from("x"), "application/pdf")).rejects.toThrow("différent");
    expect(mockSend).not.toHaveBeenCalled();
  });

  test("la lecture passe aussi par le bucket privé", async () => {
    mockSend.mockResolvedValueOnce({ Body: { transformToByteArray: async () => new Uint8Array([1]) } });
    await briefStorage.get(KEY);
    expect(mockSend.mock.calls[0][0].input.Bucket).toBe("bucket-prive");
  });

  test("clé invalide refusée", async () => {
    await expect(briefStorage.put("brief/../x.pdf", Buffer.from("x"), "application/pdf")).rejects.toThrow("Clé");
  });
});
