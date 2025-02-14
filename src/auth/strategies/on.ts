import axios from "axios";

export const onStrategy = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      "https://on.ipvc.pt/login.php",
      {
        "on-user": username,
        "on-pass": password,
        "on-auth": 3,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );

    const cookies = response.headers["set-cookie"];
    const cookie = (name: string) =>
      cookies?.find((cookie) => cookie.includes(name))?.split(";")[0] || null;

    return `${cookie("ONIPVC")}; ${cookie("PHPSESSID")}`;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
