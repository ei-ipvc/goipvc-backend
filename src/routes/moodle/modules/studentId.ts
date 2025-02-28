import axios from "axios";

export async function moodleStudentId(wstoken: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // @TODO: automatically get academic year
    axios
      .get("https://elearning.ipvc.pt/ipvc2024/webservice/rest/server.php", {
        params: {
          wstoken: wstoken,
          wsfunction: "core_webservice_get_site_info",
          moodlewsrestformat: "json",
        },
      })
      .then((response) => {
        resolve(response.data.userid);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
