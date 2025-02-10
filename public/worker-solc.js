const compilerInput = (source) => {
  const prefix = "// SPDX-License-Identifier: MIT";
  return {
    language: "Solidity",
    sources: {
      "viewer.sol": {
        content: `${prefix}\n${source}`,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
};

self.onmessage = async (event) => {
  try {
    const { soljsonText, source } = event.data;
    const solc = await loadSolc(soljsonText);
    const solOut = solc.compile(JSON.stringify(compilerInput(source)));
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
