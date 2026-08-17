const express = require("express");
const app = express();

const FIRM_KEY = "5102335756ae3df6427369151dc649f3";

app.get("/render", async (req, res) => {
    try {
        // Get worldwide FIRMS fire data
        const url =
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
            `${FIRM_KEY}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(url);
        const csv = await response.text();

        if (!response.ok) {
            throw new Error(csv);
        }

        // Split CSV into rows
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

        // Only keep major fires
        const majorFires = fires.filter(fire => {
            return Number(fire.frp) >= 50;
        });

        // Country totals
        const countries = {};

        // Convert country code into flag emoji
        function countryFlag(code) {
            if (!code || code.length !== 2) {
                return "🌎";
            }

            return String.fromCodePoint(
                ...code
                    .toUpperCase()
                    .split("")
                    .map(char => 127397 + char.charCodeAt(0))
            );
        }

        // Find country for every major fire
        for (const fire of majorFires) {
            const latitude = fire.latitude;
            const longitude = fire.longitude;

            const geoURL =
                `https://api.bigdatacloud.net/data/reverse-geocode-client` +
                `?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&localityLanguage=en`;

            const geoResponse = await fetch(geoURL);

            if (!geoResponse.ok) {
                continue;
            }

            const geo = await geoResponse.json();

            const country = geo.countryName;
            const code = geo.countryCode;

            if (!country) {
                continue;
            }

            if (!countries[country]) {
                countries[country] = {
                    country: country,
                    code: code,
                    flag: countryFlag(code),
                    fires: 0
                };
            }

            countries[country].fires++;
        }

        // Convert to array and sort biggest → smallest
        const leaderboard = Object.values(countries)
            .sort((a, b) => b.fires - a.fires);

        // Everything Roblox will eventually receive
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
