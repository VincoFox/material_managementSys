export const getLocalStorage = (key: string) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
