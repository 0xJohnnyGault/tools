// import * as solc from "solc";

self.onmessage = async (e: MessageEvent) => {
  try {
    const { contractSource } = e.data;

    // Load the compiler
    const compiler = new solc.Compiler();
    compiler.loadRemoteVersion(
      "latest",
      (err: Error | null, solcVersion: any) => {
        if (err) {
          self.postMessage({ error: "Failed to load Solidity compiler" });
          return;
        }

        try {
          const input = {
            language: "Solidity",
            sources: {
              "contract.sol": {
                content: contractSource,
              },
            },
            settings: {
              outputSelection: {
                "*": {
                  "*": ["*"],
                },
              },
              optimizer: {
                enabled: true,
                runs: 200,
              },
            },
          };

          const output = JSON.parse(solcVersion.compile(JSON.stringify(input)));

          if (output.errors) {
            const filteredErrors = output.errors
              .filter((error: any) => !error.message.includes("Warning"))
              .map((error: any) => error.formattedMessage || error.message)
              .join("\n");

            if (filteredErrors) {
              self.postMessage({ error: filteredErrors });
              return;
            }
          }

          const contractName = Object.keys(output.contracts["contract.sol"])[0];
          const contract = output.contracts["contract.sol"][contractName];

          self.postMessage({
            bytecode: contract.evm.bytecode.object,
          });
        } catch (error) {
          self.postMessage({
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      }
    );
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
