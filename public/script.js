document.getElementById("dnsForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const apiUser = document.getElementById("apiUser").value;
  const apiKey = document.getElementById("apiKey").value;
  const username = document.getElementById("username").value;
  const clientIp = document.getElementById("clientIp").value;
  const domains = document.getElementById("domains").value.split(",");
  const nameserver1 = document.getElementById("nameserver1").value;
  const nameserver2 = document.getElementById("nameserver2").value;

  const data = {
    apiUser,
    apiKey,
    username,
    clientIp,
    nameservers: [nameserver1, nameserver2],
  };

  // Open modal
  const modal = document.getElementById("progressModal");
  modal.style.display = "block";

  const domainList = document.getElementById("domainList");
  const progress = document.getElementById("progress");
  const completionMessage = document.getElementById("completionMessage");

  domainList.innerHTML = "";
  completionMessage.textContent = "";

  domains.forEach((domain) => {
    const domainItem = document.createElement("div");
    domainItem.textContent = domain;
    domainItem.classList.add("domain-item");
    domainItem.setAttribute("data-domain", domain);
    domainList.appendChild(domainItem);
  });

  try {
    let completed = 0;

    for (const domain of domains) {
      const response = await fetch("http://localhost:3000/update-dns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          domains: [domain],
        }),
      });

      const result = await response.json();

      const domainElement = Array.from(domainList.children).find((el) => el.getAttribute("data-domain") === domain);

      if (response.ok) {
        domainElement.innerHTML += " ✔️";
      } else {
        domainElement.innerHTML += " ❌";
      }

      completed++;
      progress.style.width = `${(completed / domains.length) * 100}%`;

      if (completed === domains.length) {
        completionMessage.textContent = "Completed";
      }
    }
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    document.getElementById("result").textContent = "Error updating DNS.";
    completionMessage.textContent = "Error occurred";
  }
});
