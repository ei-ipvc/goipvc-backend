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

    const loginRes = await fetch(`${loginURL}/index.php`, {
      method: "POST",
      headers: { cookie: moodleSessionCookie },
      body: form,
      redirect: "manual",
      credentials: "include",
    });
    const moodleSession = loginRes.headers
      .get("set-cookie")
      ?.split("Secure, ")
      .find((c) => c.startsWith("MoodleSession"))!
      .split(";")[0];

    const html = await fetch(
      "https://elearning.ipvc.pt/ipvc2024/my/courses.php",
      {
        headers: { cookie: moodleSession! },
      }
    ).then((res) => res.text());
    const sesskey = html.match(/sesskey":"([^"]+)/)![1];

    return [moodleSession, sesskey];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
};
