document.getElementById("recipe-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const ingredients = document.getElementById("ingredients").value.trim();
    const instructions = document.getElementById("instructions").value.trim();
    const tags = document.getElementById("tags").value.split(",").map(tag => tag.trim());
    const imageInput = document.getElementById("image");

    if (!title || !ingredients || !instructions) {
        alert("Please fill in all required fields.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    formData.append("tags", JSON.stringify(tags));

    if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    try {
        const response = await fetch("/api/save-recipe", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert("Recipe saved successfully!");
            window.location.href = "index.html";
        } else {
            alert("Error saving recipe: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving the recipe.");
    }
});
