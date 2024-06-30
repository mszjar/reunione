const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ReunioneModule", (m) => {

  const reunione = m.contract("Reunione");

  return { reunione };
});
