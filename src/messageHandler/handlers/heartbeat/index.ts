import { IClient } from "../../../models/client";

export const HeartbeatHandler = (client: IClient): boolean => {
  const nowTime = new Date().getTime();
  client.setLastPing(nowTime);
  return true;
};
