function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Optional: You could add a temporary tooltip or notification here
      console.log("Copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
}

function getSnowtraceAddressLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span>
            <a href="https://${row.network === "fuji" ? "testnet." : ""}snowtrace.io/address/${data}" target="_blank">${data.substring(0, 8)}... </a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getSnowtraceTxLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span>
            <a href="https://${row.network === "fuji" ? "testnet." : ""}snowtrace.io/tx/${data}" target="_blank">${data.substring(0, 8)}... </a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getAvaxPLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span><a href="https://subnets${row.network === "fuji" ? "-test" : ""}.avax.network/p-chain/tx/${data}" target="_blank">${data.substring(0, 8)}...</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getAvaxCLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span><a href="https://subnets${row.network === "fuji" ? "-test" : ""}.avax.network/c-chain/tx/${data}" target="_blank">${data.substring(0, 8)}...</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getNodeIDLink(data, type, row) {
  if (data.length == 0) return "";
  return `<a href="https://subnets.avax.network/${row.name}/details" target="_blank">${data}</a>`;
}

export { copyToClipboard, getSnowtraceAddressLink, getSnowtraceTxLink, getAvaxPLink, getAvaxCLink, getNodeIDLink };
