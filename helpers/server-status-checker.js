const mcutil = require("minecraft-server-util");
const Server = require("../models/serverSchema");

const options = {
  timeout: 1000 * 10, // timeout in milliseconds
  enableSRV: true, // SRV record lookup
};

checkServerOnline = async function _checkServerOnline(server) {
  try {
    await mcutil.status(server.ip, server.port, options);
    return true;
  } catch (err) {
    return false;
  }
};

//CALLED ON A SERVER TO UPDATE ALL ITS DATABASE METRICS
updateServerStatus = async function _updateServerStatus(server) {
  try {
    result = await mcutil.status(server.ip, server.port, options);
    await Server.findByIdAndUpdate(server.id, {
      totalPings: server.totalPings + 1,
      successfulPings: server.successfulPings + 1,
      uptime:
        ((server.successfulPings / server.totalPings) * 100).toFixed(2) + "%",
      onlineStatus: true,
      lastPinged: Date.now(),
      playerCount: result.players.online + "/" + result.players.max,
      version: result.version.name,
      edition: result.edition,
    });
    return true;
  } catch (e) {
    await Server.findByIdAndUpdate(server.id, {
      totalPings: server.totalPings + 1,
      uptime:
        ((server.successfulPings / server.totalPings) * 100).toFixed(2) + "%",
      onlineStatus: false,
      lastPinged: Date.now(),
    });
    return false;
  }
};

//CHECK EACH SERVER IN DATABASE
let timeoutId;
async function checkServers() {
  Server.find({}, (err, servers) => {
    if (err) {
      console.error(err);
      return;
    }
    servers.forEach(async (server) => {
      await updateServerStatus(server);
    });
  });

  //SCHEDULE THE NEXT CHECK
  timeoutId = setTimeout(checkServers, 2000);
}

//CALLED TO START CHECKING SERVERS IN SECONDS
function startCheckingServers() {
  checkServers();
}

module.exports = {
  checkServerOnline,
  updateServerStatus,
  startCheckingServers,
};
