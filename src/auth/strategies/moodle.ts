import { load } from "cheerio";

export const moodleStrategy = async (username: string, password: string) => {
  const loginURL = "https://elearning.ipvc.pt/ipvc2024/login";
  const form = new URLSearchParams({ username, password });

  try {
    const res = await fetch(`${loginURL}/index.php`);
    const $ = load(await res.text());
    form.append("logintoken", $("[name='logintoken']")[0].attribs.value);

    const moodleSessionCookie =
      res.headers
        .get("set-cookie")
        ?.split("Secure, ")
        .find((c) => c.startsWith("MoodleSession")) || "";

    const [loginRes, tokenRes] = await Promise.all([
      fetch(`${loginURL}/index.php`, {
        method: "POST",
        headers: { cookie: moodleSessionCookie },
        body: form,
        redirect: "manual",
        credentials: "include",
      }),
      fetch(
        `${loginURL}/token.php?username=${username}&password=${encodeURIComponent(
          password
        )}&service=moodle_mobile_app`
      ),
    ]);

    const cookies = loginRes.headers
      .get("set-cookie")
      ?.split("Secure, ")
      .find((c) => c.startsWith("MoodleSession"));

    const token = await tokenRes.json();

    return [cookies!.split(";")[0], token.token];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
};
