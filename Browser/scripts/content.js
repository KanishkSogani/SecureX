function checkCurrentURL() {
  const url = window.location.href;
  
  chrome.runtime.sendMessage({ type: "CHECK_URL", url: url }, (response) => {
    console.log(response)
    if(response.isPhishing) {
        console.log("Phishing detected!");
    }else {
        console.log("No phishing detected!");
    }
  });
}
checkCurrentURL();
