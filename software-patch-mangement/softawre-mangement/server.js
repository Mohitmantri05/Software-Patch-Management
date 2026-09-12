const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readPatches() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function savePatches(patches) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(patches, null, 2));
}

app.get("/api/patches", (req, res) => res.json(readPatches()));

app.post("/api/patches", (req, res) => {
  const patches = readPatches();
  const patch = {
    id: req.body.id, software: req.body.software, version: req.body.version,
    description: req.body.description, priority: req.body.priority,
    testing: req.body.testing, deployment: req.body.deployment, date: req.body.date
  };
  if (!patch.id || !patch.software || !patch.version)
    return res.status(400).json({message:"Patch ID, software and version are required."});
  if (patches.some(p => p.id === patch.id))
    return res.status(409).json({message:"Patch ID already exists."});
  patches.push(patch); savePatches(patches); res.status(201).json(patch);
});

app.put("/api/patches/:id", (req, res) => {
  const patches = readPatches();
  const i = patches.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({message:"Patch not found."});
  patches[i] = {...patches[i], ...req.body, id: patches[i].id};
  savePatches(patches); res.json(patches[i]);
});

app.delete("/api/patches/:id", (req, res) => {
  const patches = readPatches();
  const updated = patches.filter(p => p.id !== req.params.id);
  if (updated.length === patches.length)
    return res.status(404).json({message:"Patch not found."});
  savePatches(updated); res.json({message:"Patch deleted successfully."});
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on port ${PORT}`);
});