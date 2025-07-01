// Create Leaflet map
const map = L.map("map", {
    minZoom: -3,
}).setView([65, 25], 0);

// Add OpenStreetMap tile background
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Load both GeoJSON and migration data before rendering map
Promise.all([
    // GeoJSON data for municipalities
    fetch(
        "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    ).then((res) => res.json()),

    // Migration data from PxWeb API
    fetch(
        "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: [
                    {
                        code: "Alue",
                        selection: { filter: "item", values: [] },
                    },
                    {
                        code: "Vuosi",
                        selection: { filter: "item", values: ["2022"] },
                    },
                    {
                        code: "Tieto",
                        selection: {
                            filter: "item",
                            values: ["vm01", "vm11"], // vm01 = positive, vm11 = negative
                        },
                    },
                ],
                response: { format: "json" },
            }),
        }
    ).then((res) => res.json()),
])
    .then(([geojson, migration]) => {
        // Prepare migration data
        const areas = migration.dimension.Alue.category.label;
        const areaCodes = Object.keys(areas);
        const values = migration.value;

        const migrationData = {};
        for (let i = 0; i < areaCodes.length; i++) {
            const name = areas[areaCodes[i]];
            const pos = values[i * 2] || 0;
            const neg = values[i * 2 + 1] || 0;
            migrationData[name] = { pos, neg };
        }

        // Add GeoJSON layer with color and interactivity
        const layer = L.geoJSON(geojson, {
            style: (feature) => {
                const name = feature.properties.nimi;
                const data = migrationData[name];
                if (!data || data.neg === 0) {
                    return { color: "gray", weight: 2 };
                }

                const ratio = data.pos / data.neg;
                const hue = Math.min(Math.pow(ratio, 3) * 60, 120);
                return {
                    color: `hsl(${hue}, 75%, 50%)`,
                    weight: 2,
                };
            },
            onEachFeature: (feature, layer) => {
                const name = feature.properties.nimi;
                const data = migrationData[name];

                // Tooltip on hover
                layer.bindTooltip(name, {
                    direction: "top",
                    sticky: true,
                });

                // Popup on click
                if (data) {
                    layer.bindPopup(`
            <strong>${name}</strong><br>
            Positive migration: ${data.pos}<br>
            Negative migration: ${data.neg}
        `);
                } else {
                    layer.bindPopup(
                        `<strong>${name}</strong><br>No migration data.`
                    );
                }
            },
        }).addTo(map);

        // Fit map to visible GeoJSON data
        map.fitBounds(layer.getBounds());
    })
    .catch((err) => {
        console.error("Error loading data:", err);
    });
