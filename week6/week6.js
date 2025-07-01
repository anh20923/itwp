
async function fetchData() {
    const input = document
        .getElementById("municipality")
        .value.trim()
        .toLowerCase();

    // Fetch all municipality codes
    const metaRes = await fetch(
        "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"
    );
    const meta = await metaRes.json();
    const codeMap = {};
    meta.variables[1].valueTexts.forEach((name, idx) => {
        codeMap[name.toLowerCase()] = meta.variables[1].values[idx];
    });
    codeMap["whole country"] = "SSS";

    const areaCode = codeMap[input] || "SSS";
    const areaName = input || "whole country";

    // Save for newchart.html
    localStorage.setItem("municipalityCode", areaCode);
    localStorage.setItem("municipalityName", areaName);

    // Continue with original fetch
    const res = await fetch(
        "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: [
                    {
                        code: "Vuosi",
                        selection: {
                            filter: "item",
                            values: Array.from({ length: 22 }, (_, i) =>
                                (2000 + i).toString()
                            ),
                        },
                    },
                    {
                        code: "Alue",
                        selection: { filter: "item", values: [areaCode] },
                    },
                    {
                        code: "Tiedot",
                        selection: { filter: "item", values: ["vaesto"] },
                    },
                ],
                response: { format: "json-stat2" },
            }),
        }
    );

    const data = await res.json();
    const years = data.dimension.Vuosi.category.label;
    const values = data.value;

    new frappe.Chart("#chart", {
        title: `Population Growth in ${areaName}`,
        data: {
            labels: Object.values(years),
            datasets: [{ name: "Population", values: values }],
        },
        type: "line",
        height: 400,
    });
}

document.getElementById("navigation").addEventListener("click", () => {
    window.location.href = "newchart.html";
});
