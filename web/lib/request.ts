const request = {
  get(url: string, body?: Record<string, string>) {
    // 将参数对象转换为查询字符串
    const queryString = body
      ? Object.keys(body)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`
          )
          .join('&')
      : null;

    // 拼接完整的 URL
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    console.log('fullUrl====', fullUrl);
    return fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      console.log('response status:', res.status, 'response ok:', res.ok);
      const data = await res.json();
      if (res.status !== 200) {
        const { error } = data;
        return Promise.reject({ status: res.status, message: error });
      }
      return data;
    });
  },
  post(url: string, body?: Record<string, any>) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(async (res) => {
      console.log('response status:', res.status, 'response ok:', res.ok);
      const data = await res.json();
      if (res.status !== 200) {
        const { error } = data;
        return Promise.reject({ status: res.status, message: error });
      }
      return data;
    });
  },
};

export default request;
