import axios from "axios";

export const academicosStrategy = async (
  username: string,
  password: string
) => {
  try {
    const res = await axios.post(
      "https://academicos.ipvc.pt/netpa/ajax?stage=loginstage",
      {
        _formsubmitstage: "loginstage",
        _formsubmitname: "login",
        ajax_mode: true,
        _user: username,
        _pass: password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        withCredentials: true,
      }
    );

    const cookies = res.headers["set-cookie"];
    const token =
      cookies?.find((cookie) => cookie.includes("JSESSIONID"))?.split(";")[0] ||
      null;

    // Activate the session
    await axios.get(
      "https://academicos.ipvc.pt/netpa/page?stage=ConsultaNotasAluno",
      {
        headers: {
          Cookie: token,
        },
      }
    );

    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
