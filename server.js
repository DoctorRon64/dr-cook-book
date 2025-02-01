const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS)
app.use(express.static("public"));

// Serve JSON files (Fix for missing recipes)
app.use("/data/json", express.static(path.join(__dirname, "data/json")));

// Serve images
app.use("/data/img", express.static(path.join(__dirname, "data/img")));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: "data/img/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ✅ API: Save Recipe (Stores in `recipes.json`)
app.post("/api/save-recipe", upload.single("image"), (req, res) => {
    const { title, ingredients, instructions, tags } = req.body;
    const imageUrl = req.file ? `/data/img/${req.file.filename}` : null;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const newRecipe = {
        title,
        ingredients,
        instructions,
        tags: JSON.parse(tags),
        imageUrl
    };

    const recipesFile = "data/json/recipes.json";

    // Ensure recipes.json exists
    if (!fs.existsSync(recipesFile)) {
        fs.writeFileSync(recipesFile, JSON.stringify([], null, 2));
    }

    // Read existing recipes
    fs.readFile(recipesFile, "utf-8", (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error reading recipes file." });
        }

        let recipes = [];
        try {
            recipes = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ success: false, message: "Error parsing recipes file." });
        }

        // Add new recipe
        recipes.push(newRecipe);

        // Save back to `recipes.json`
        fs.writeFile(recipesFile, JSON.stringify(recipes, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ success: false, message: "Error saving recipe." });
            }
            res.json({ success: true, message: "Recipe saved successfully!" });
        });
    });
});

// ✅ API: Get Recipes
app.get("/api/get-recipes", (req, res) => {
    const recipesFile = "data/json/recipes.json";

    if (!fs.existsSync(recipesFile)) {
        return res.json([]); // Return empty array if file doesn't exist
    }

    fs.readFile(recipesFile, "utf-8", (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error reading recipes." });
        }

        try {
            const recipes = JSON.parse(data);
            res.json(recipes);
        } catch (parseError) {
            res.status(500).json({ success: false, message: "Error parsing recipes file." });
        }
    });
});

// ✅ API: Export Recipes
app.get("/api/export-recipes", (req, res) => {
    const recipesFile = "data/json/recipes.json";

    if (!fs.existsSync(recipesFile)) {
        return res.status(404).json({ success: false, message: "No recipes found to export." });
    }

    res.download(recipesFile, "recipes.json");
});

// ✅ API: Import Recipes
app.post("/api/import-recipes", express.json(), (req, res) => {
    const recipesFile = "data/json/recipes.json";

    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: "Invalid JSON format." });
    }

    fs.writeFile(recipesFile, JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error saving imported recipes." });
        }
        res.json({ success: true, message: "Recipes imported successfully!" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
