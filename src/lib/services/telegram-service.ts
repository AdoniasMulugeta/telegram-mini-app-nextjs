import { validate, parse } from "@telegram-apps/init-data-node";
import logger from "@/lib/util/logger";

export const validateInitData = async (initData: string) => {
  try {
    validate(initData, process.env.TELEGRAM_BOT_TOKEN as string);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const parseUserFromInitData = async (initData: string) => {
  const parsedInitData = parse(initData);
  return parsedInitData.user;
};
