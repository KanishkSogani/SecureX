function checkCurrentURL() {
  const url = window.location.href;
  const result = extractFeaturesFromURL(url);
  
  chrome.runtime.sendMessage({ type: "CHECK_URL", url: {url, result} }, (response) => {
    console.log(response)
    if(response.isPhishing) {
        console.log("Phishing detected!");
    }else {
        console.log("No phishing detected!");
    }
  });
}
function extractFeaturesFromURL(url) {
  var result = {};
  var urlDomain = new URL(url).hostname;

  // 1. IP Address
  var ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  var patt = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
  var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;
  if (ip.test(urlDomain) || patt.test(urlDomain) || patt2.test(urlDomain)) {
    result["IP Address"] = "1";
  } else {
    result["IP Address"] = "-1";
  }

  // 2. URL Length
  if (url.length < 54) {
    result["URL Length"] = "-1";
  } else if (url.length >= 54 && url.length <= 75) {
    result["URL Length"] = "0";
  } else {
    result["URL Length"] = "1";
  }

  // 3. Tiny URL
  var onlyDomain = urlDomain.replace('www.', '');
  if (onlyDomain.length < 7) {
    result["Tiny URL"] = "1";
  } else {
    result["Tiny URL"] = "-1";
  }

  // 4. @ Symbol
  if (/@/.test(url)) {
    result["@ Symbol"] = "1";
  } else {
    result["@ Symbol"] = "-1";
  }

  // 5. Redirecting using //
  if (url.lastIndexOf("//") > 7) {
    result["Redirecting using //"] = "1";
  } else {
    result["Redirecting using //"] = "-1";
  }

  // 6. (-) Prefix/Suffix in domain
  if (/-/.test(urlDomain)) {
    result["(-) Prefix/Suffix in domain"] = "1";
  } else {
    result["(-) Prefix/Suffix in domain"] = "-1";
  }

  // 7. No. of Sub Domains
  var subDomainCount = (onlyDomain.match(/\./g) || []).length;
  if (subDomainCount == 1) {
    result["No. of Sub Domains"] = "-1";
  } else if (subDomainCount == 2) {
    result["No. of Sub Domains"] = "0";
  } else {
    result["No. of Sub Domains"] = "1";
  }

  // 8. HTTPS
  if (/https:\/\//.test(url)) {
    result["HTTPS"] = "-1";
  } else {
    result["HTTPS"] = "1";
  }

  // 9. Submitting to mail
  // var forms = document.getElementsByTagName("form");
  // var res = "-1";
  // for (var i = 0; i < forms.length; i++) {
  //   var action = forms[i].getAttribute("action");
  //   if (!action) continue;
  //   if (action.startsWith("mailto")) {
  //     res = "1";
  //     break;
  //   }
  // }
  // result["mailto"] = res;

  // 10. Using iFrame
  // var iframes = document.getElementsByTagName("iframe");
  // if (iframes.length == 0) {
  //   result["iFrames"] = "-1";
  // } else {
  //   result["iFrames"] = "1";
  // }

  // Convert result object to an array
  var resultArray = Object.values(result).map(Number); // Convert string values to numbers

  // Prepare data in the format expected by the server
  return resultArray; // Also return the array if needed
}


checkCurrentURL();
