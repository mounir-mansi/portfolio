const mockSend = jest.fn().mockResolvedValue({});

jest.mock("resend", () => ({ Resend: jest.fn(() => ({ emails: { send: mockSend } })) }));
jest.mock("../src/lib/briefStorage", () => ({ get: jest.fn(), put: jest.fn(), remove: jest.fn() }));

const storage = require("../src/lib/briefStorage");
const { sendBriefNotification, splitIntoBatches } = require("../src/lib/emailSender");

const MB = 1024 * 1024;
const id = (n) => `${String(n).repeat(32).slice(0, 32)}`;
const row = (extra = {}) => ({ id: 7, name: "Test", menuFiles: [], logoFile: null, ...extra });

beforeEach(() => {
  mockSend.mockClear();
  mockSend.mockResolvedValue({});
  storage.get.mockReset();
  process.env.EMAIL_FROM = "from@test.fr";
  process.env.EMAIL_CONTACT = "to@test.fr";
});

describe("Répartition des pièces jointes", () => {
  const f = (mb) => ({ filename: "x", content: Buffer.alloc(mb * MB) });

  test("tout tient dans un seul lot sous 15 Mo", () => {
    expect(splitIntoBatches([f(5), f(5), f(5)])).toHaveLength(1);
  });
  test("au-delà de 15 Mo, plusieurs lots, aucun lot au-dessus de 15 Mo", () => {
    const batches = splitIntoBatches([f(10), f(10), f(10), f(5)]);
    expect(batches.length).toBeGreaterThan(1);
    for (const b of batches) expect(b.reduce((s, x) => s + x.content.length, 0)).toBeLessThanOrEqual(15 * MB);
  });
  test("un fichier de 10 Mo n'est jamais perdu", () => {
    expect(splitIntoBatches([f(10)])).toHaveLength(1);
  });
  test("aucun fichier : aucun lot", () => {
    expect(splitIntoBatches([])).toEqual([]);
  });
});

describe("Email du brief avec pièces jointes", () => {
  test("sans fichier : un mail, sans pièce jointe", async () => {
    await sendBriefNotification(row());
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].attachments).toBeUndefined();
  });

  test("menu et logo joints avec des noms neutres", async () => {
    storage.get.mockResolvedValue(Buffer.from("data"));
    await sendBriefNotification(row({ menuFiles: [`${id(1)}.pdf`, `${id(2)}.jpg`], logoFile: `${id(3)}.png` }));
    expect(mockSend).toHaveBeenCalledTimes(1);
    const names = mockSend.mock.calls[0][0].attachments.map((a) => a.filename);
    expect(names).toEqual(["menu-1.pdf", "menu-2.jpg", "logo.png"]);
    expect(storage.get).toHaveBeenCalledWith(`brief/7/${id(1)}.pdf`);
  });

  test("fichiers trop gros pour un mail : plusieurs mails numérotés", async () => {
    storage.get.mockResolvedValue(Buffer.alloc(10 * MB));
    await sendBriefNotification(row({ menuFiles: [`${id(1)}.pdf`, `${id(2)}.pdf`, `${id(3)}.pdf`] }));
    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(mockSend.mock.calls[0][0].subject).toContain("fichiers 1/3");
    expect(mockSend.mock.calls[2][0].subject).toContain("fichiers 3/3");
    for (const [msg] of mockSend.mock.calls) expect(msg.attachments).toHaveLength(1);
  });

  test("fichier introuvable : ignoré, le mail part quand même", async () => {
    storage.get.mockRejectedValueOnce(new Error("NoSuchKey")).mockResolvedValue(Buffer.from("ok"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    await sendBriefNotification(row({ menuFiles: [`${id(1)}.pdf`, `${id(2)}.pdf`] }));
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].attachments.map((a) => a.filename)).toEqual(["menu-2.pdf"]);
  });

  test("échec d'un mail de suite : n'empêche pas le mail principal ni ne fait échouer l'envoi", async () => {
    storage.get.mockResolvedValue(Buffer.alloc(10 * MB));
    mockSend.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("resend down")).mockResolvedValue({});
    jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(sendBriefNotification(row({ menuFiles: [`${id(1)}.pdf`, `${id(2)}.pdf`, `${id(3)}.pdf`] }))).resolves.toBeUndefined();
    expect(mockSend).toHaveBeenCalledTimes(3);
  });
});
