//huyền viết tạm để chạy thử
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SupplyChainModule", (m) => {
  const supplyChain = m.contract("SupplyChain");

  return { supplyChain };
});
