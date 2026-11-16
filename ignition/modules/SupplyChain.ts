//huyền viết tạm để chạy thử
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// A distinct module preserves the V1 deployment journal during migration.
export default buildModule("SupplyChainV2Module", (m) => {
  const supplyChain = m.contract("SupplyChainV2");

  return { supplyChain };
});
