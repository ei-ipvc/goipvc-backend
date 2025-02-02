import axios from "axios";

export const SASStrategy = async (username: string, password: string) => {
  try {
    const res = await axios.post(
      "https://sasocial.sas.ipvc.pt/api/authorization/authorize/device-type/WEB",
      {
        email: `${username}@ipvc.pt`,
        password: password,
      }
    );

    const cookies = res.headers["set-cookie"];
    const refreshToken =
      cookies
        ?.find((cookie) => cookie.includes("refreshTokenWEB"))
        ?.split(";")[0] || null;

    const tokens = [`Bearer ${res.data.data[0].token}`, refreshToken];
    return tokens;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
