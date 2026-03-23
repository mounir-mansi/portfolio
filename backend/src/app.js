const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const router = require("./routers/router");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        process.env.CORS_ORIGIN,
        "http://localhost:5173",
        "http://localhost:3002",
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error("CORS non autorisé"));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV !== "production",
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
});
app.use("/login", loginLimiter);

// Routes API
app.use(router);

// Servir le frontend en production
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

module.exports = app;
