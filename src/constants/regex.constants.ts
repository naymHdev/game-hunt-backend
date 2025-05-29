export const linksRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;

export const emailRegex = /^[\w.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/;

export const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
