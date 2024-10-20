export const fetchWithRetries = (
  url: string,
  options: RequestInit = {},
  retries: number
): Promise<any> =>
  fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      if (retries > 0) {
        return fetchWithRetries(url, options, retries - 1);
      }
      throw new Error(res.status.toString());
    })
    .catch((error) => {
      console.error(error.message);
      throw error;
    });
