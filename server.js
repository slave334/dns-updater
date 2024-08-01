const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const xml2js = require("xml2js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/update-dns", async (req, res) => {
  const { apiUser, apiKey, username, clientIp, domains, nameservers } = req.body;

  console.log("Received data:", req.body);

  try {
    for (const domain of domains) {
      const params = {
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: username,
        ClientIp: clientIp,
        Command: "namecheap.domains.dns.setCustom",
        SLD: domain.split(".")[0],
        TLD: domain.split(".")[1],
        Nameservers: nameservers.join(","),
      };

      console.log("Request params:", params);

      const response = await axios.get("https://api.namecheap.com/xml.response", { params });
      const responseData = response.data;

      console.log("Response data:", responseData);

      const parsedResult = await xml2js.parseStringPromise(responseData);
      const status = parsedResult.ApiResponse.$.Status;
      const updated = parsedResult.ApiResponse.CommandResponse[0].DomainDNSSetCustomResult[0].$.Updated === "true";

      if (status !== "OK" || !updated) {
        throw new Error(`Error updating DNS for domain ${domain}`);
      }
    }

    res.json({ message: "Nameservers successfully updated for all domains." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
