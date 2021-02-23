import rp from "request-promise";

const url = "https://leadwallet-errors-and-analytics-a901e9.us1.kinto.io";

export const sendMail = async (type: string, body: any): Promise<any> => {
  try {
    const path = {
      err: "/error",
      analytics: "/analytics"
    };
    const fullUrl = url + path[type];
    const response = await rp.post(fullUrl, {
      simple: false,
      resolveWithFullResponse: true,
      json: true,
      body
    });

    if (response.statusCode >= 400) throw new Error(response.body);

    return Promise.resolve({ ...response.body });
  } catch (error) {
    console.error(error);
  }
};
