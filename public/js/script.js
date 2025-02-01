document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();
    document.getElementById("export-json").addEventListener("click", exportRecipes);
    document.getElementById("import-json").addEventListener("change", importRecipes);
});

async function fetchRecipes() {
    try {
        const response = await fetch("/api/get-recipes");
        const recipes = await response.json();

        console.log("📌 Fetched recipes:", recipes); // 🔥 Debugging log

        if (!Array.isArray(recipes)) {
            console.error("❌ Unexpected response format:", recipes);
            return;
        }

        displayRecipes(recipes);
    } catch (error) {
        console.error("❌ Error fetching recipes:", error);
    }
}

function displayRecipes(recipes) {
    console.log("📌 Displaying recipes:", recipes); // 🔥 Debugging log

    const container = document.getElementById("recipes-container");
    container.innerHTML = ""; // Clear previous content

    if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe => {
        console.log("📌 Rendering recipe:", recipe); // 🔥 Debugging log for each recipe

        const recipeElement = document.createElement("div");
        recipeElement.classList.add("recipe-card");

        recipeElement.innerHTML = `
            <h2>${recipe.title}</h2>
            ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image">` : ""}
            <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
            <p><strong>Instructions:</strong> ${recipe.instructions}</p>
            <p><strong>Tags:</strong> ${recipe.tags.map(tag => `<span class="tag">#${tag}</span>`).join(" ")}</p>
        `;

        container.appendChild(recipeElement);
    });
}

function searchRecipes() {
    let searchQuery = document.getElementById("search").value.trim().toLowerCase();

    // Check if the search query starts with '#'
    const isTagSearch = searchQuery.startsWith("#");

    // If it's a tag search, remove the '#'
    if (isTagSearch) {
        searchQuery = searchQuery.slice(1); // Remove the '#' from the search query
    }

    // Fetch recipes from the server
    fetch("/api/get-recipes")
        .then(response => response.json())
        .then(recipes => {
            const filteredRecipes = recipes.filter(recipe => {
                // Search by title or tags
                const titleMatches = recipe.title.toLowerCase().includes(searchQuery);
                const tagMatches = recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery));
                return titleMatches || tagMatches;
            });

            // Display the filtered recipes
            displayRecipes(filteredRecipes);
        })
        .catch(error => console.error("Error fetching recipes:", error));
}

// Export recipes.json
async function exportRecipes() {
    window.location.href = "/api/export-recipes";
}

// Import recipes.json
async function importRecipes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const recipes = JSON.parse(e.target.result);
            const response = await fetch("/api/import-recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recipes)
            });

            const result = await response.json();
            if (result.success) {
                alert("Recipes imported successfully!");
                fetchRecipes(); // Refresh recipe list
            } else {
                alert("Error importing recipes: " + result.message);
            }
        } catch (error) {
            console.error("Error importing recipes:", error);
        }
    };
    reader.readAsText(file);
}
