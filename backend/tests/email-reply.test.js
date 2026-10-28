const mockSend = jest.fn().mockResolvedValue({});

jest.mock("resend", () => ({ Resend: jest.fn(() => ({ emails: { send: mockSend } })) }));
jest.mock("../src/lib/briefStorage", () => ({ get: jest.fn(), put: jest.fn(), remove: jest.fn() }));

const { sendReply } = require("../src/lib/emailSender");

const env = { ...process.env };

beforeEach(() => {
  mockSend.mockClear();
  process.env.EMAIL_FROM = "noreply@mandev.fr";
  process.env.EMAIL_CONTACT = "gmail@test.fr";
  delete process.env.EMAIL_REPLY_TO;
});

afterAll(() => {
  process.env = env;
});

describe("Réponse envoyée depuis l'admin", () => {
  test("l'adresse de réponse est EMAIL_REPLY_TO quand elle est définie", async () => {
    process.env.EMAIL_REPLY_TO = "contact@mandev.fr";
    await sendReply({ to: "client@test.fr", name: "Jean", replyMessage: "Bonjour" });
    const msg = mockSend.mock.calls[0][0];
    expect(msg.replyTo).toBe("contact@mandev.fr");
    expect(msg.from).toBe("noreply@mandev.fr");
    expect(msg.to).toBe("client@test.fr");
  });

  test("à défaut, la réponse revient sur EMAIL_CONTACT, jamais sur l'adresse noreply", async () => {
    await sendReply({ to: "client@test.fr", name: "Jean", replyMessage: "Bonjour" });
    const msg = mockSend.mock.calls[0][0];
    expect(msg.replyTo).toBe("gmail@test.fr");
    expect(msg.replyTo).not.toBe(msg.from);
  });

  test("le contenu est toujours échappé", async () => {
    await sendReply({ to: "client@test.fr", name: "<b>Jean</b>", replyMessage: "<script>x</script>" });
    const html = mockSend.mock.calls[0][0].html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
