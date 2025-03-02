const axios = require("axios");
const cheerio = require("cheerio");

(async () => {
  const { data } = await axios.get(
    "https://www.ipvc.pt/estg/sobre-a-estg/servicos/"
  );
  const $ = cheerio.load(data);

  const title = $("title").text();
  console.log("Page Title:", title);

  // document.querySelector("#content-full > div > div.text-l1.small-12.grid-x > div.text-l1__wrapper.small-12.grid-x.align-center.grid-padding-x > div > div > div.content-001.BodyPrimaryNeutralLeft > ul")
})();
