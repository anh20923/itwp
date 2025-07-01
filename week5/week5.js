window.addEventListener("load", async () => {
    const map = L.map("map", { minZoom: -3 }).setView([65, 25], 0);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const [geojson, migrationQuery] = await Promise.all([
        fetch(
            "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
        ).then((res) => res.json()),
        fetch("migration_data_query.json").then((res) => res.json()),
    ]);

    const migration = await fetch(
        "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(migrationQuery),
        }
    ).then((res) => res.json());

    // Parse dữ liệu
    const labels = migration.dimension.Alue.category.label;
    const keys = Object.keys(labels);
    const values = migration.value;

    const migrationData = {};
    keys.forEach((key, i) => {
        const name = labels[key];
        const pos = values[i * 2] || 0;
        const neg = values[i * 2 + 1] || 0;
        migrationData[name] = { pos, neg };
    });

    const layer = L.geoJSON(geojson, {
        style: (feature) => {
            const name = feature.properties.nimi;
            const data = migrationData[name];
            if (!data || data.neg === 0) return { color: "gray", weight: 2 };
            const hue = Math.min(Math.pow(data.pos / data.neg, 3) * 60, 120);
            return {
                color: `hsl(${hue}, 75%, 50%)`,
                weight: 2,
            };
        },
        onEachFeature: (feature, layer) => {
            const name = feature.properties.nimi;
            const data = migrationData[name];
            layer.bindTooltip(name, { direction: "top", sticky: true });

            layer.bindPopup(
                data
                    ? `<strong>${name}</strong><br>Positive: ${data.pos}<br>Negative: ${data.neg}`
                    : `<strong>${name}</strong><br>No data`
            );
        },
    }).addTo(map);

    map.fitBounds(layer.getBounds());
});
