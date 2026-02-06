import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import type { IgnitionModuleBuilder } from "@nomicfoundation/ignition-core";

const TipJarModule = buildModule("TipJarModule", (m: IgnitionModuleBuilder) => {
  const tipJar = m.contract("TipJar");
  return { tipJar };
});

export default TipJarModule;