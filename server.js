const express = require("express");
const app = express();

const FIRMS_KEY = process.env.FIRMS_KEY;

app.get("/render", async (req, res) => {
    try {
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
        const majorFires = fires.filter(fire =>
            Number(fire.frp) >= 0
        );

        // Put EVERYTHING into one result variable
        const result = JSON.stringify(majorFires);

        // Output the entire result at once
        console.log(result);

        // Also return it from /render
        res.send(result);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
