self.onmessage = async (event) => {
  const { soljsonText, input } = event.data;
  const solc = await loadSolc(soljsonText);
  const solOut = solc.compile(input);
  const output = JSON.parse(solOut);
  self.postMessage(output);
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
