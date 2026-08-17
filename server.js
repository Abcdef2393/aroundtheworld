const express = require("express");
const app = express();

const FIRMS_KEY = "5102335756ae3df6427369151dc649f3";

app.get("/render", async (req, res) => {
    try {
        console.log("Getting wildfire data...");

        const url =
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
            `${FIRMS_KEY}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(url);
        const csv = await response.text();

        const lines = csv.trim().split("\n");
        const headers = lines[0].split(",");

        const fires = lines.slice(1).map(line => {
            const values = line.split(",");

            const fire = {};

            headers.forEach((header, i) => {
                fire[header] = values[i];
            });

            return fire;
        });

        // Only keep major fires
        const majorFires = fires.filter(fire => {
            return Number(fire.frp) >= 100;
        });

        // Put the entire result into one variable
        const result = JSON.stringify(majorFires);

        // Output everything at once
        console.log(result);

        // Send the same result to the browser
        res.send(result);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
