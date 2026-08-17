const express = require("express");
const countryCoder = require("@rapideditor/country-coder");

const app = express();

const FIRM_KEY = "5102335756ae3df6427369151dc649f3";

app.get("/render", async (req, res) => {
    try {
        const url =
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
            `${FIRM_KEY}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(url);
        const csv = await response.text();

        if (!response.ok) {
            throw new Error(csv);
        }

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

        // Keep major fires
        const majorFires = fires.filter(fire =>
            Number(fire.frp) >= 50
        );

        // Country information
        const countries = {};

        for (const fire of majorFires) {
            const latitude = Number(fire.latitude);
            const longitude = Number(fire.longitude);

            // country-coder expects [longitude, latitude]
            const code = countryCoder.iso1A2Code([
                longitude,
                latitude
            ]);

            if (!code) {
                continue;
            }

            const feature = countryCoder.feature([
                longitude,
                latitude
            ]);

            const country = feature?.properties?.nameEn || code;
            const flag = feature?.properties?.emojiFlag || "🌎";

            if (!countries[code]) {
                countries[code] = {
                    country: country,
                    code: code,
                    flag: flag,
                    fires: 0
                };
            }

            countries[code].fires++;
        }

        // Sort largest → smallest
        const leaderboard = Object.values(countries)
            .sort((a, b) => b.fires - a.fires);

        // Final output
        const result = JSON.stringify(leaderboard);

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
