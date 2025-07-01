document
    .getElementById("show-form")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const query = document.getElementById("input-show").value.trim();
        const container = document.querySelector(".show-container");

        // Clear previous search results
        container.innerHTML = "";

        if (query === "") return;

        try {
            const response = await fetch(
                `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
                    query
                )}`
            );
            const data = await response.json();

            data.forEach((item) => {
                const show = item.show;

                const showData = document.createElement("div");
                showData.className = "show-data";

                // Add image if available
                if (show.image && show.image.medium) {
                    const img = document.createElement("img");
                    img.src = show.image.medium;
                    img.alt = show.name;
                    showData.appendChild(img);
                }

                const infoDiv = document.createElement("div");
                infoDiv.className = "show-info";

                const title = document.createElement("h1");
                title.textContent = show.name;

                const summary = document.createElement("p");
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML =
                    show.summary || "<p>No summary available.</p>";
                summary.textContent = tempDiv.textContent;

                infoDiv.appendChild(title);
                infoDiv.appendChild(summary);
                showData.appendChild(infoDiv);

                container.appendChild(showData);
            });
        } catch (err) {
            container.innerHTML =
                "<p>Error loading data. Please try again.</p>";
            console.error(err);
        }
    });
