import axios from "axios";

// @TODO: get current moodle login url automatically
export const moodleStrategy = async (username: string, password: string) => {
  let cookie = null;
  let token = null;

  try {
    const response = await axios.post(
      "https://elearning.ipvc.pt/ipvc2024/login/index.php",
      {
        username: username,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );

    const cookies = response.headers["set-cookie"];
    cookie =
      cookies
        ?.find((cookie) => cookie.includes("MoodleSession"))
        ?.split(";")[0] || null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }

  try {
    const response = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/login/token.php?username=${username}&password=${encodeURIComponent(
        password
      )}&service=moodle_mobile_app`
    );

    token = response.data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }

  return [cookie, token];
};
