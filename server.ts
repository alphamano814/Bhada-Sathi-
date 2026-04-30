import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
  });
  app.use(express.json({ limit: '10mb' }));

  const routesFilePath = path.join(__dirname, "src", "data", "fareRoutes.json");
  const localRoutesFilePath = path.join(__dirname, "src", "data", "localRoutes.json");
  const updatesFilePath = path.join(__dirname, "src", "data", "updates.json");

  // API Route: Get routes from JSON file
  app.get("/api/routes", (req, res) => {
    try {
      if (fs.existsSync(routesFilePath)) {
        const data = fs.readFileSync(routesFilePath, "utf8");
        res.json(JSON.parse(data));
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error reading routes file:", error);
      res.status(500).json({ error: "Failed to read routes" });
    }
  });

  // API Route: Get local routes from JSON file
  app.get("/api/local-routes", (req, res) => {
    try {
      if (fs.existsSync(localRoutesFilePath)) {
        const data = fs.readFileSync(localRoutesFilePath, "utf8");
        res.json(JSON.parse(data));
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error reading local routes file:", error);
      res.status(500).json({ error: "Failed to read local routes" });
    }
  });

  // API Route: Get updates from JSON file
  app.get("/api/updates", (req, res) => {
    try {
      if (fs.existsSync(updatesFilePath)) {
        const data = fs.readFileSync(updatesFilePath, "utf8");
        res.json(JSON.parse(data));
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error reading updates file:", error);
      res.status(500).json({ error: "Failed to read updates" });
    }
  });

  // API Route: Save routes to JSON file
  app.post("/api/save-routes", (req, res) => {
    console.log(`[Server] Received request to save ${req.body?.length || 0} routes.`);
    try {
      const routes = req.body;
      if (!Array.isArray(routes)) {
        console.error("[Server] Invalid data format received.");
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
      }
      fs.writeFileSync(routesFilePath, JSON.stringify(routes, null, 2), "utf8");
      console.log(`[Server] Successfully saved routes to ${routesFilePath}`);
      res.json({ success: true });
    } catch (error) {
      console.error("[Server] Error writing routes file:", error);
      res.status(500).json({ error: "Failed to save routes" });
    }
  });

  // API Route: Save local routes to JSON file
  app.post("/api/save-local-routes", (req, res) => {
    console.log(`[Server] Received request to save ${req.body?.length || 0} local routes.`);
    try {
      const routes = req.body;
      if (!Array.isArray(routes)) {
        console.error("[Server] Invalid local routes data format received.");
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
      }
      fs.writeFileSync(localRoutesFilePath, JSON.stringify(routes, null, 2), "utf8");
      console.log(`[Server] Successfully saved local routes to ${localRoutesFilePath}`);
      res.json({ success: true });
    } catch (error) {
      console.error("[Server] Error writing local routes file:", error);
      res.status(500).json({ error: "Failed to save local routes" });
    }
  });

  // API Route: Save updates to JSON file
  app.post("/api/save-updates", (req, res) => {
    try {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
      }
      fs.writeFileSync(updatesFilePath, JSON.stringify(updates, null, 2), "utf8");
      res.json({ success: true });
    } catch (error) {
      console.error("Error writing updates file:", error);
      res.status(500).json({ error: "Failed to save updates" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical: Failed to start server:", err);
  process.exit(1);
});
