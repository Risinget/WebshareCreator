import fetch from "node-fetch";
import fs from "fs";
const outputFileProxies = "proxies.txt";

const getProxiesList = async (token) => {
  // Add query parameters directly in the URL
  const url = new URL("https://proxy.webshare.io/api/v2/proxy/list/");
  url.searchParams.append("mode", "direct");
  url.searchParams.append("page", "1");
  url.searchParams.append("page_size", "10");

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Authorization: "Token " + token,
    Origin: "https://proxy2.webshare.io",
    Connection: "keep-alive",
    Referer: "https://proxy2.webshare.io/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    TE: "trailers",
  };

  // Remove body from the fetch options
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: headers,
  });

  return response.json();
};

const getCaptchaToken = async () => {
  const apiKey = "xxxx"; // Your apikey 2captcha.com
  const siteKey = "6LeHZ6UUAAAAAKat_YS--O2tj_by3gv3r_l03j9d";S
  const url = `http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=https://proxy2.webshare.io/`;

  const response = await fetch(url);
  const result = await response.text();
  const captchaId = result.split("|")[1];

  const captchaUrl = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`;

  let captchaToken = "";
  while (captchaToken === "") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const captchaResponse = await fetch(captchaUrl);
    const captchaResult = await captchaResponse.json();
    if (captchaResult.status === 1) {
      captchaToken = captchaResult.request;
    }
  }

  return captchaToken;
};

const ShareRequest = async (email, password) => {
  const captchaToken = await getCaptchaToken();

  console.log("Email: " + email);
  console.log("Password: " + password);
  console.log("Captcha Token: " + captchaToken);
  console.log("Sending, wait a moment please...");

  const url = "https://proxy.webshare.io/api/v2/register/";
  const requestBody = {
    email: email,
    password: password,
    tos_accepted: true,
    recaptcha: captchaToken,
  };
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/json",
    Connection: "keep-alive",
    Host: "proxy.webshare.io",
    Origin: "https://proxy2.webshare.io",
    Referer: "https://proxy2.webshare.io/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    TE: "trailers",
  };
  const method = "POST";

  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: JSON.stringify(requestBody),
  });
  return response.json();
};

const getMailToken = async (community, domain, prefix) => {
  // domain cse445.com
  const body = {
    community: community,
    domain: domain,
    prefix: prefix,
  };

  const response = await fetch("https://api.tempmail.lol/v2/inbox/create", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  const email = data.address;
  const tokenEmail = data.token;
  // Return email and tokenEmail
  return { tokenEmail, email };
};

const getMessageVerificationLink = async (tokenEmail, attempt = 0) => {
  const response = await fetch(
    `https://api.tempmail.lol/v2/inbox?token=${tokenEmail}`,
    { method: "GET" }
  );

  let responseJson = await response.json();

  if (responseJson.emails.length === 0) {
    if (attempt < maxAttempts) {
      console.log(`Attempt ${attempt + 1} of ${maxAttempts}`);
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(getMessageVerificationLink(tokenEmail, attempt + 1)),
          1000
        )
      );
    } else {
      return "No emails found after maximum attempts.";
    }
  } else {
    const responseBody = responseJson.emails[0].body;
    const prefix = "https://proxy2.webshare.io/activation/";
    const suffix = ")";

    const prefixIndex = responseBody.indexOf(prefix);
    const suffixIndex = responseBody.indexOf(suffix, prefixIndex);

    // Asegúrate de que el índice es válido antes de cortar.
    if (prefixIndex !== -1 && suffixIndex > prefixIndex) {
      const link = responseBody.slice(prefixIndex, suffixIndex);
      return link;
    }

    return responseBody;
  }
};

// 2pebsy59y4vi88wp8rf5q82q68ngn33ksaz1oj websha7193@t6r9q8q.cse445.com

const postUrl = async (codeToken, tokenAccount) => {
  const body = {
    activation_token: codeToken,
  };

  const headers = {
    authority: "proxy.webshare.io",
    method: "GET",
    path: "/api/v2/activation/",
    scheme: "https",
    "Content-Type": "application/json", // Asegúrate de incluir este encabezado
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Authorization: "Token " + tokenAccount,
    Origin: "https://proxy2.webshare.io",
    Referer: "https://proxy2.webshare.io/",
    "Sec-Ch-Ua":
      '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
  };

  const response = await fetch(
    "https://proxy.webshare.io/api/v2/activation/complete/",
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    }
  );

  return response.json();
};

const maxAttempts = 100;
const run = async () => {
  // capture token and email
  const prefix = "websha";
  const domain = "cse445.com";
  const communityEmail = true;

  let mail = await getMailToken(communityEmail, domain, prefix);

  console.log(mail.tokenEmail, mail.email);

  let email = mail.email;
  let password = "=vi*'*?s#\"bV2r7";

  const response = await ShareRequest(email, password);
  console.log(response.token);
  if (response.token) {
    ("Succesfully registered!");
    let link = await getMessageVerificationLink(mail.tokenEmail);
    console.log(link);
    let codeLink = link.split("activation/")[1].split("/confirm")[0];
    console.log(codeLink);
    const data = await postUrl(codeLink, response.token);
    console.log(data);

    const proxies = await getProxiesList(response.token);

    // foreach to print all proxies with this format "ip:port:username:password"

    proxies.results.forEach((proxy) => {
      console.log(
        `${proxy.proxy_address}:${proxy.port}:${proxy.username}:${proxy.password}`
      );
      // save all proxies to a file
      fs.appendFileSync(
        outputFileProxies,
        `${proxy.proxy_address}:${proxy.port}:${proxy.username}:${proxy.password}\n`
      );
    });
  } else {
    "Error: " + response.error;
  }
};

run();
