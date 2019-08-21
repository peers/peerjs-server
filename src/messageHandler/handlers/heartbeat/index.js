module.exports = (client) => {
  const nowTime = new Date().getTime();
  client.setLastPing(nowTime);
};
