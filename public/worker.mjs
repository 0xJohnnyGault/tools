console.log("importing...");
let compiler = null;

// Initialize the compiler when it's loaded
self.Module = {
  exports: {},
  onRuntimeInitialized: () => {
    console.log("onRuntimeInitialized");
    compiler = self.Module;
    self.postMessage({ type: "initialized" });
  },
};

import * as solc from "https://binaries.soliditylang.org/emscripten-wasm32/solc-emscripten-wasm32-v0.8.19+commit.7dd6d404.js";
import * as wrapper from "https://esm.sh/solc@0.8.19/es2022/wrapper.mjs";

console.log(Object.keys(wrapper));
console.log("wrapper", wrapper);
console.log(compiler);
debugger;
let x = wrapper.default(self.Module);
console.log(x);

// self.addEventListener("message", async (e) => {
//   if (!compiler) {
//     self.postMessage({
//       type: "error",
//       error: "Compiler not initialized",
//     });
//     return;
//   }

//   const { source } = e.data;

//   try {
//     const input = {
//       language: "Solidity",
//       sources: {
//         "contract.sol": {
//           content: source,
//         },
//       },
//       settings: {
//         outputSelection: {
//           "*": {
//             "*": ["evm.bytecode"],
//           },
//         },
//       },
//     };

//     const output = JSON.parse(compiler.compile(JSON.stringify(input)));

//     if (output.errors?.some((error) => error.severity === "error")) {
//       throw new Error(output.errors.map((e) => e.formattedMessage).join("\n"));
//     }

//     const contractName = Object.keys(output.contracts["contract.sol"])[0];
//     const bytecode =
//       output.contracts["contract.sol"][contractName].evm.bytecode.object;

//     self.postMessage({
//       type: "success",
//       bytecode,
//     });
//   } catch (error) {
//     self.postMessage({
//       type: "error",
//       error: error.message,
//     });
//   }
// });
