self.onmessage = async (event) => {
  try {
    const { soljsonText, input } = event.data;
    const solc = await loadSolc(soljsonText);
    const solOut = solc.compile(input);
    const output = JSON.parse(solOut);
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
