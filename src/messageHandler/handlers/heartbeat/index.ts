import { IClient } from "../../../models/client";

export const HeartbeatHandler = (client: IClient | undefined): boolean => {
  if (client) {
    const nowTime = new Date().getTime();
    client.setLastPing(nowTime);
  }

  return true;
};
