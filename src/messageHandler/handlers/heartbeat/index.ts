import { IClient } from "../../../models/client";

export default function(client: IClient): boolean {
  const nowTime = new Date().getTime();
  client.setLastPing(nowTime);
  return true;
}
