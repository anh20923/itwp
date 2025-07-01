document.addEventListener("DOMContentLoaded", function () {
    const areaCode = localStorage.getItem("municipalityCode") || "SSS";
    const areaName =
        localStorage.getItem("municipalityName") || "whole country";
    document.getElementById("municipalityName").textContent = areaName;

    let chartData = {
        labels: [],
        datasets: [
            {
                name: "Births",
                chartType: "bar",
                values: [],
                colors: ["#63d0ff"],
            },
            {
                name: "Deaths",
                chartType: "bar",
                values: [],
                colors: ["#363636"],
            },
        ],
    };

    let chart = new frappe.Chart("#chart", {
        title: `Births and deaths in ${areaName}`,
        data: chartData,
        type: "bar",
        height: 450,
    });

    fetchBirthsAndDeathsData(areaCode);

    function fetchBirthsAndDeathsData(areaCode) {
        const url =
            "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
        const data = {
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
                    selection: {
                        filter: "item",
                        values: [areaCode],
                    },
                },
                {
                    code: "Tiedot",
                    selection: {
                        filter: "item",
                        values: ["vm01", "vm11"],
                    },
                },
            ],
            response: {
                format: "json-stat2",
            },
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                updateChart(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    function updateChart(data) {
        const years = data.dimension.Vuosi.category.label;
        const births = data.value.slice(0, 22);
        const deaths = data.value.slice(22);

        chartData.labels = Object.values(years);
        chartData.datasets[0].values = births;
        chartData.datasets[1].values = deaths;

        chart.update(chartData);
    }
});
