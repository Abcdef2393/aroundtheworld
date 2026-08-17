const express = require("express");
const app = express();

const FIRMS_KEY = "5102335756ae3df6427369151dc649f3";

app.get("/render", async (req, res) => {
    try {
        const url =
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
            `${FIRM_KEY}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(url);
        const csv = await response.text();

        const lines = csv.trim().split("\n");
        const headers = lines[0].split(",");

        const fires = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",");

            const fire = {};

            for (let j = 0; j < headers.length; j++) {
                fire[headers[j]] = values[j];
            }

            fires.push(fire);
        }

        const result = JSON.stringify(fires);

        console.log("Sending:", result);

        res.send(result);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
