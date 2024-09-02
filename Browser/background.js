chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_URL") {
    const url = request.url.url;

    fetch("http://127.0.0.1:3000/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }), // Send URL in the request body
    })
      .then((response) => {
        if (!response.ok) {
          // If the response is not OK, handle it as text to display error
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log("Received data:", data);
        if (data.isPhishing) {
          // Notify the user
          chrome.notifications.create({
            type: "basic",
            title: "Phishing Alert!",
            message: "This website is potentially unsafe to visit!",
          });
          sendResponse({ isPhishing: true });
        } else {
          const result = request.url.result;
          fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ features: [result] }), // Send features in the request body
          })
            .then((response) => {
              if (!response.ok) {
                return response.text().then((text) => {
                  throw new Error(text);
                });
              }
              return response.json(); // Parse JSON response
            })
            .then((data) => {
              console.log("Received data:", data);
              sendResponse({ data });
            })
            .catch((error) => {
              console.error("Error:", error);
              sendResponse({ error: `Error occurred while predicting the URL: ${error.message}` });
            });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ error: `Error occurred while checking the URL: ${error.message}` });
      });

    return true; // Keep the listener alive for async sendResponse
  }
});
