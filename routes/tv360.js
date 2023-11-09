const express = require("express");
const router = express.Router();
const FormData = require("form-data");

const curl = require("curlrequest");
const { encryptAES, decryptAES } = require("../helper");
const axios = require("axios").default;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

const options = {
  method: "GET",
  headers: {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  },
};

const reqStreamOptions = {
  headers: {
    authority: "tv360.vn",
    accept: "*/*",
    "accept-language":
      "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,fr-FR;q=0.6,fr;q=0.5,zh-TW;q=0.4,zh;q=0.3",
    "cache-control": "max-age=0",
    referrer:
      "https://tv360.vn/movie/cong-to-vien-lach-luat-bad-prosecutor?m=16825&col=film_search&sect=FILM&page=search",
    "sec-ch-ua":
      '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  },
  method: "POST",
};

router.get("/get-recommend", async function (req, res, next) {
  const requestBody = req.body;
  //   const url =
  //     "https://tv360.vn/public/v1/watch-log/get-recommend?type=live&page=live&offset=0&id=recommend_live";
  curl.request(
    {
      ...options,
      url: requestBody.url
        ? requestBody.url
        : "https://tv360.vn/public/v1/watch-log/get-recommend?type=live&page=live&offset=0&id=recommend_live",
    },
    async (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error making the request a" });
      } else {
        const htmlResult = JSON.parse(response);
        // res.status(200).json(htmlResult);

        if (htmlResult.errorCode == 200) {
          const content = htmlResult.data.content;
          //   const currentDate = new Date();
          //   const currentTimeMilliseconds = currentDate.getTime();
          //   const currentTimeSeconds = Math.floor(currentTimeMilliseconds / 1000);
          //   console.log("time", currentTimeMilliseconds);
          //   for (let index = 0; index < content.length; index++) {
          //     const link = `id=${content[index].id}&type=${content[index].type}&t=${currentTimeSeconds}&secured=true&drm=3%2C4`;
          //     const encryptedStr = encryptAES(link);
          //     console.log("es", content[index].id, encryptedStr);
          //   }
          res.status(200).json(content);
        } else {
          res.status(500).json("Error parse http result");
        }
      }
    }
  );
});

router.get("/get-link/draft", async function (req, res, next) {
  try {
    if (req.body.url) {
      const resBody = JSON.parse(decryptAES(req.body.url));
      const sq = decryptAES(
        "R8CLKY/6Lsq2LGHFfDzM4a4/t5fg0o69b8l8V5nWX2dhprr81BJUijV6xby/R7WiWurJLAgiiq/jeUPQLMDh4g=="
      );
      console.log("sq", sq);

      const currentDate = new Date();
      const currentTimeMilliseconds = currentDate.getTime();
      const currentTimeSeconds = Math.floor(currentTimeMilliseconds / 1000);

      const encryptedStr = encryptAES(
        `id=4&type=live&mod=LIVE&t=${currentTimeSeconds}&secured=true&drm=3%2C4`
      );

      console.log("es", encryptedStr);

      const formData = new FormData();
      formData.append("secured", true);
      formData.append("sq", encryptedStr);

      curl.request(
        {
          ...reqStreamOptions,
          url: "https://tv360.vn/public/v1/composite/get-link",
          data: formData,
        },
        async (error, response) => {
          if (error) {
            console.error("Error:", error);
            return;
          } else {
            console.error("response:", response);
          }
        }
      );

      res.json(resBody);
    }
  } catch (n) {
    res.status(500).json({ error: "Error get-link" });
  }
});

module.exports = router;
