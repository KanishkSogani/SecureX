
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_URL") {
    const url = request.url;

    fetch('http://127.0.0.1:3000/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url })  // Send URL in the request body
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.isPhishing) {
          //notify the user
          chrome.notifications.create({
            type: "basic",
            title: "Phishing Alert!",
            message: "This website is potentially unsafe to visit!",
          });
          sendResponse({ isPhishing: true });
        } else {
        //     const worker = new Worker(chrome.runtime.getURL('mlWorker.js'));
        //     worker.postMessage(url);

        //     worker.onmessage = function (event) {
        //         if (event.data.isPhishing) {
        //         chrome.notifications.create({
        //             type: "basic",
        //             title: "Phishing Alert",
        //             message: "The website is potentially a phishing site!",
        //         });
        //      }
        //     sendResponse({ isPhishing: event.data.isPhishing });
        //     worker.terminate();
        //   };

        //   worker.onerror = function (error) {
        //     console.error("Worker error:", error);
        //     sendResponse({ error: "Error occurred in Web Worker" });
        //     worker.terminate();
        //   };
            
             sendResponse({ isPhishing: false });
        // }
      })
      .catch((error) => {
        console.log("Error : ", error);
        sendResponse({ error: "Error occurred while checking the URL" });
      });

    return true;
  }
});
