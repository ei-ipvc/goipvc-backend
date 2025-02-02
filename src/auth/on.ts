import axios from "axios";

export const ONStrategy = async (username: string, password: string) => {
  try {
    const response = await axios.post("https://on.ipvc.pt/login.php", {
      "on-user": username,
      "on-pass": password,
      "on-auth": 3,
    });

    const cookies = response.headers["set-cookie"];
    const token =
      cookies?.find((cookie) => cookie.includes("PHPSESSID"))?.split(";")[0] ||
      null;

    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
