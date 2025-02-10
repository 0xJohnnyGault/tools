const compilerInput = (source) => {
  const prefix = "// SPDX-License-Identifier: MIT";
  return {
    language: "Solidity",
    sources: {
      "contract.sol": {
        content: `${prefix}\n${source}`,
      },
    },
    settings: {
      outputSelection: {
        "*": ["*"],
      },
    },
  };
};

// {"language":"Solidity","sources":{"contract.sol":{"content":""}},"settings":{"outputSelection":{"*":["*"]}}}
// {
//   "language": "Solidity",
//   "sources": {
//     "contract.sol": {
//       "content": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0; contract Test {}"
//     }
//   },
//   "settings": {
//     "outputSelection": {
//       "*": [
//         "*"
//       ]
//     }
//   }
// }

self.onmessage = async (event) => {
  console.log("onmessage", event);
  try {
    const { soljsonText, source } = event.data;
    const solc = await loadSolc(soljsonText);
    console.log(source);
    const input = compilerInput(source);
    console.log(input);
    const s = JSON.stringify(input, null, 2);
    console.log(`${s}`);
    const solOut = solc.compile(s);
    const output = JSON.parse(solOut);
    if (output?.errors?.length > 0) {
      errorMessage = output.errors
        .map(
          (err) => err.message || err.formattedMessage || JSON.stringify(err)
        )
        .join("\n\n");
      throw new Error(errorMessage);
    }
    self.postMessage({ type: "success", output });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

async function loadSolc(soljsonText) {
  const Module = { exports: {} };

  const soljsonFunction = new Function("Module", soljsonText);
  soljsonFunction(Module);

  const compile = Module.cwrap("solidity_compile", "string", [
    "string",
    "number",
  ]);

  const solc = { compile };
  return solc;
}

self.postMessage({ type: "initialized" });
