"use client";

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { useState, useEffect, useCallback } from "react";
import { CompilerErrorBoundary } from "@/components/CompilerErrorBoundary";
import { WebSolcProvider, useWebSolc } from "@web-solc/react";
import type { CompilerInput, CompilerOutput } from "web-solc";

function ContractCompiler() {
  const [contractSource, setContractSource] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [compiledBytecode, setCompiledBytecode] = useState<string>("");
  const [compilationError, setCompilationError] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState(false);

  const solc = useWebSolc("^0.8.25");

  const handleCompilation = useCallback(async () => {
    if (!solc) return;

    try {
      setIsCompiling(true);
      setCompilationError("");
      setCompiledBytecode("");

      if (!contractSource.trim()) {
        setCompilationError("Contract source cannot be empty");
        return;
      }

      const input: CompilerInput = {
        language: "Solidity",
        sources: {
          "contract.sol": {
            content: contractSource,
          },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["evm.bytecode", "abi"],
            },
          },
        },
      };

      const output = await solc.compile(input);

      // Check for errors in compilation
      if (output.errors?.some((error) => error.severity === "error")) {
        setCompilationError(
          output.errors.map((e) => e.formattedMessage).join("\n")
        );
        return;
      }

      // Get the bytecode from the output
      const contractName = Object.keys(output.contracts["contract.sol"])[0];
      const bytecode =
        output.contracts["contract.sol"][contractName].evm.bytecode.object;
      setCompiledBytecode(bytecode);
    } catch (error) {
      setCompilationError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsCompiling(false);
    }
  }, [contractSource, solc]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">Solidity Contract Source</h2>
        <button className="text-gray-600 hover:text-gray-800">
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-4">
          <CompilerErrorBoundary>
            <textarea
              value={contractSource}
              onChange={(e) => setContractSource(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md"
              placeholder="Paste your Solidity contract source code here..."
              spellCheck="false"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCompilation}
                disabled={isCompiling}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {isCompiling ? "Compiling..." : "Compile Contract"}
              </button>
            </div>

            {compilationError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
                <h3 className="font-semibold mb-2">Compilation Error:</h3>
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {compilationError}
                </pre>
              </div>
            )}

            {compiledBytecode && !compilationError && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
                <h3 className="font-semibold mb-2">Compiled Bytecode:</h3>
                <div className="max-h-40 overflow-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm break-all">
                    {compiledBytecode}
                  </pre>
                </div>
              </div>
            )}
          </CompilerErrorBoundary>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [rpcUrl, setRpcUrl] = useState(
    "http://api.avax-test.network/ext/bc/C/rpc"
  );
  const [client, setClient] = useState(() =>
    createPublicClient({
      chain: avalancheFuji,
      transport: http(rpcUrl),
    })
  );

  const updateClient = useCallback((url: string) => {
    try {
      const newClient = createPublicClient({
        chain: avalancheFuji,
        transport: http(url),
      });
      setClient(newClient);
      setRpcUrl(url);
    } catch (error) {
      console.error("Error creating client:", error);
    }
  }, []);

  return (
    <WebSolcProvider>
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">
          Avalanche Fuji Testnet Reader
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">RPC URL</h2>
            <input
              type="text"
              value={rpcUrl}
              onChange={(e) => updateClient(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter RPC URL"
            />
          </div>

          <ContractCompiler />
        </div>
      </main>
    </WebSolcProvider>
  );
}
