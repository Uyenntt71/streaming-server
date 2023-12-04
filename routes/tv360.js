const express = require("express");
const router = express.Router();
const FormData = require("form-data");

const curl = require("curlrequest");
const { encryptAES, decryptAES } = require("../helper");
const axios = require("axios").default;

// 1. Get your axios instance ready
function createAxios() {
  return axios.create({ withCredentials: true });
}
const axiosInstance = createAxios();

// 2. Make sure you save the cookie after login.
const cookieJar = {
  myCookies: undefined,
};

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
      "https://tv360.vn/login?r=https%3A%2F%2Ftv360.vn%2Fmovie%2F21685%3Fm%3D21685%26col%3Dbanner%26sect%3DBANNER%26page%3Dhome",
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
  const url =
    "https://tv360.vn/public/v1/watch-log/get-recommend?type=film&page=film&offset=0&id=recommend_film";
  curl.request(
    {
      ...options,
      url: requestBody.url ? requestBody.url : url,
    },
    async (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error making the request" });
      } else {
        const htmlResult = JSON.parse(response);

        if (htmlResult.errorCode == 200) {
          const content = htmlResult.data.content;
          res.status(200).json(content);
        } else {
          res.status(500).json("Error parsing http result");
        }
      }
    }
  );
});

router.get("/get-link", async function (req, res, next) {
  const res2 = await axios.post(`http://localhost:3080/tv360/login`);
  if (res2.data.errorCode == 400) {
    res.status(400).json(res2.data);
  }
  const params = {
    id: req.query.id, // vtv1 id=2
    type: "film",
    mod: "FILM",
    drm: "3,4",
    secured: true,
    t: Date.now() / 1000,
  };

  const response = await axiosInstance.get(
    "https://tv360.vn/public/v1/composite/get-link",
    {
      params,
      headers: {
        cookie: cookieJar.myCookies,
      },
    }
  );
  const _res = decryptAES(response.data?.data);
  res.status(200).json(JSON.parse(_res));
});

router.post("/login", async function (req, res, next) {
  await axiosInstance
    .post(
      "https://tv360.vn/public/v1/auth/login",
      {
        msisdn: "0335606978",
        password: "831997",
        grantType: "PASS",
      },
      {
        withCredentials: true,
        headers: {
          Cookie:
            "img-ext=avif; session-id=s%3Ab3f66e49-b3f3-44d7-b68f-e0b8c2c9f3f8.Pi7ZfnySJAAqGi8GdXB6AT0HrUeFONrYsv0B0M8%2Fcwc; NEXT_LOCALE=vi; device-id=s%3Aweb_fa87fdef-ca51-4034-af50-791e9266316b.5MrmKSmKYjMOsjagzzWT112nLLYNzj%2BkI70N3oCLh4g; shared-device-id=web_fa87fdef-ca51-4034-af50-791e9266316b; screen-size=s%3A1920x1080.uvjE9gczJ2ZmC0QdUMXaK%2BHUczLAtNpMQ1h3t%2Fq6m3Q; _gid=GA1.2.1294433775.1700615673; G_ENABLED_IDPS=google; accessed-in-day=s%3A1.E8d5%2BqHvtoRa81DxWMn1MgOyHoaIIEARCHxdA33Dyqw; auto-login=; acw_tc=2d31e24c60dc68f2cb718867cfdf25342f2c834c9fada39a61c8cd7d82667223; remember-user=; access-token=; refresh-token=; msisdn=; profile=; user-id=; _ga=GA1.1.204917889.1700615673; _ga_D7L53J0JMS=GS1.1.1700615672.1.1.1700618594.17.0.0; _ga_E5YP28Y8EF=GS1.1.1700615672.1.1.1700618594.0.0.0",
        },
      }
    )
    .then((response) => {
      cookieJar.myCookies = response.headers["set-cookie"];
      res.status(200).json(response.data);
    })
    .catch((err) => {
      res.status(400).json({ error: "Error login" });
    });
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
