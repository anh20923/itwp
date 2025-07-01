const populationUrl =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
const employmentUrl =
    "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";

const fetchStatFinData = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return await response.json();
};

const setupTable = (populationData, employmentData) => {
    const municipalities = populationData.dimension.Alue.category.label;
    const populationValues = populationData.value;
    const employmentValues = employmentData.value;

    const tbody = document.getElementById("table-rows");
    tbody.innerHTML = "";

    const keys = Object.keys(municipalities);

    keys.forEach((key, index) => {
        const city = municipalities[key];
        const population = populationValues[index];
        const employment = employmentValues[index];

        let employmentPercent = 0;
        if (population > 0) {
            employmentPercent = ((employment / population) * 100).toFixed(2);
        } else {
            employmentPercent = "0.00";
        }

        let rowColor = "";
        if (employmentPercent > 45) {
            rowColor = "style='background-color: #abffbd'";
        } else if (employmentPercent < 25) {
            rowColor = "style='background-color: #ff9e9e'";
        }

        const row = `
            <tr ${rowColor}>
                <td>${city}</td>
                <td>${population}</td>
                <td>${employment}</td>
                <td>${employmentPercent}%</td>
            </tr>
        `;

        tbody.innerHTML += row;
    });
};

const initializeCode = async () => {
    try {
        const populationBody = await (
            await fetch("population_query.json")
        ).json();
        const employmentBody = await (
            await fetch("employment_query.json")
        ).json();

        const [populationData, employmentData] = await Promise.all([
            fetchStatFinData(populationUrl, populationBody),
            fetchStatFinData(employmentUrl, employmentBody),
        ]);

        setupTable(populationData, employmentData);
    } catch (error) {
        console.error("Error initializing data:", error);
    }
};

initializeCode();
