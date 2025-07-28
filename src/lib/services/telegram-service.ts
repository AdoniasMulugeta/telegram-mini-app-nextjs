import { validate, parse } from "@telegram-apps/init-data-node";

export const validateInitData = async (initData: string) => {
  try {
    validate(initData, process.env.TELEGRAM_BOT_TOKEN as string);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const parseUserFromInitData = async (initData: string) => {
  const parsedInitData = parse(initData);
  return parsedInitData.user;
};
