import { PeerServer } from "./index";
import { IConfig } from "./config";

const config: IConfig = {
  port: 9000,
  expire_timeout: 5000,
  alive_timeout: 60000,
  key: "peerjs",
  path: "/myapp",
  concurrent_limit: 5000,
  allow_discovery: false,
  proxied: false,
  cleanup_out_msgs: 1000,
};

PeerServer(config);

console.log("Server started at port 9000");
