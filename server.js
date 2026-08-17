const express = require("express");
const app = express();

const FIRMS_KEY = "5102335756ae3df6427369151dc649f3";

app.get("/render", async (req, res) => {
    try {
        const url =
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
            `${FIRMS_KEY}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(url);
        const text = await response.text();

        const result = text;

        console.log("Sending:", result);

        res.send(result);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
