async function fetchAddressBook() {
  const apiKey = localStorage.getItem("coqnetApiKey");
  if (!apiKey) {
    return {};
  }

  try {
    const response = await fetch(`https://sstqretxgcehhfbdjwcz.supabase.co/rest/v1/address_book`, {
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    let addressBook = {};
    data.forEach((row) => {
      addressBook[row.address.toLowerCase()] = row.name;
    });
    return addressBook;
  } catch (error) {
    console.error("Failed to fetch address book:", error);
    return {};
  }
}

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
  return `<span class="truncated-link">
            <a href="https://${row.network === "fuji" ? "testnet." : ""}snowtrace.io/address/${data}" target="_blank">${data}</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getSnowtraceTxLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span class="truncated-link">
            <a href="https://${row.network === "fuji" ? "testnet." : ""}snowtrace.io/tx/${data}" target="_blank">${data}</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getAvaxPLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span class="truncated-link">
            <a href="https://subnets${row.network === "fuji" ? "-test" : ""}.avax.network/p-chain/tx/${data}" target="_blank">${data}</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getAvaxCLink(data, type, row) {
  if (data.length == 0) return "";
  return `<span class="truncated-link">
            <a href="https://subnets${row.network === "fuji" ? "-test" : ""}.avax.network/c-chain/tx/${data}" target="_blank">${data}</a>
            <i class="fas fa-copy copy-btn" onclick="copyToClipboard('${data}')" title="Copy to clipboard"></i>
          </span>`;
}

function getNodeIDLink(data, type, row) {
  if (data.length == 0) return "";
  return `<a href="https://subnets.avax.network/${row.name}/details" target="_blank">${data}</a>`;
}

function contracts() {
  return {
    mainnet: {
      gas_station: "0x27Ce13Ed07c367258E0E65EB932DfFCb84f62b7e",
    },
    fuji: {
      gas_station: "0xBac9d1B636140863122bE643E5d041Ef0FF28Ec2",
    },
  };
}
export { contracts, copyToClipboard, getSnowtraceAddressLink, getSnowtraceTxLink, getAvaxPLink, getAvaxCLink, getNodeIDLink, fetchAddressBook };
