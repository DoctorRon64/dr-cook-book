document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipe-form');
    const recipesContainer = document.getElementById('recipes-container');
    const exportButton = document.getElementById('export-json');
    const importInput = document.getElementById('import-json');
    
    // Load recipes from localStorage
    const loadRecipes = () => {
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        recipesContainer.innerHTML = recipes.map((recipe) => `
            <div class="recipe-card">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
                <h2>${recipe.title}</h2>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                <p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>
            </div>
        `).join('');
    };
    loadRecipes(); // Initial load

    // Handle recipe submission
    if (recipeForm) {
        recipeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value.trim();
            const ingredients = document.getElementById('ingredients').value.trim();
            const instructions = document.getElementById('instructions').value.trim();
            const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
            const image = document.getElementById('image').files[0];

            const recipes = JSON.parse(localStorage.getItem('recipes')) || [];

            const newRecipe = { title, ingredients, instructions, tags };

            if (image) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    newRecipe.image = event.target.result; // Base64 encoded image
                    recipes.push(newRecipe);
                    localStorage.setItem('recipes', JSON.stringify(recipes));
                    alert('Recipe saved successfully!');
                    loadRecipes(); // Reload recipes
                    window.location.href = 'index.html';
                };
                reader.readAsDataURL(image);
            } else {
                recipes.push(newRecipe);
                localStorage.setItem('recipes', JSON.stringify(recipes));
                alert('Recipe saved successfully!');
                loadRecipes(); // Reload recipes
                window.location.href = 'index.html';
            }
        });
    }

    // Export recipes as JSON
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipes));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "recipes.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // Import recipes from file
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const recipes = JSON.parse(event.target.result);
                    localStorage.setItem('recipes', JSON.stringify(recipes));
                    alert('Recipes imported successfully!');
                    loadRecipes(); // Reload recipes after import
                };
                reader.readAsText(file);
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipes-container');
    const recipes = JSON.parse(localStorage.getItem('recipes')) || [];

    if (recipesContainer) {
        recipesContainer.innerHTML = recipes.map((recipe, index) => `
            <div class="recipe-card">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
                <h2>${recipe.title}</h2>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                <p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>
            </div>
        `).join('');
    }
});
function searchRecipes() {
    const query = document.getElementById('search').value.toLowerCase();
    const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const recipesContainer = document.getElementById('recipes-container');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
    );

    recipesContainer.innerHTML = filteredRecipes.map(recipe => `
        <div class="recipe-card">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
            <h2>${recipe.title}</h2>
            <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
            <p><strong>Instructions:</strong> ${recipe.instructions}</p>
            <p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>
        </div>
    `).join('');
}