import { useState, useCallback, useEffect } from "react";

interface CompilerResult {
  bytecode?: string;
  error?: string;
}

export function useCompilerWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    // Initialize worker
    const compilerWorker = new Worker(
      new URL("../workers/compiler.worker.ts", import.meta.url)
    );
    setWorker(compilerWorker);

    // Cleanup
    return () => {
      compilerWorker.terminate();
    };
  }, []);

  const compileContract = useCallback(
    (contractSource: string): Promise<CompilerResult> => {
      if (!worker) {
        return Promise.reject(new Error("Compiler worker not initialized"));
      }

      setIsCompiling(true);

      return new Promise((resolve) => {
        const handleMessage = (e: MessageEvent) => {
          setIsCompiling(false);
          worker.removeEventListener("message", handleMessage);
          resolve(e.data as CompilerResult);
        };

        worker.addEventListener("message", handleMessage);
        worker.postMessage({ contractSource });
      });
    },
    [worker]
  );

  return { compileContract, isCompiling };
}
