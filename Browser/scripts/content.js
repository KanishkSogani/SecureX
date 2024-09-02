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
function extractURLFeatures(url) {
  // Object to hold results
  var result = {};

  // Get the domain from the URL
  var urlDomain = (new URL(url)).hostname;

  // (1) IP Address Check
  var patt1 = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
  var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;
  var ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

  if (ip.test(urlDomain) || patt1.test(urlDomain) || patt2.test(urlDomain)) { 
      result["IP Address"] = "1";
  } else {
      result["IP Address"] = "-1";
  }

  // (2) URL Length
  if (url.length < 54) {
      result["URL Length"] = "-1";
  } else if (url.length >= 54 && url.length <= 75) {
      result["URL Length"] = "0";
  } else {
      result["URL Length"] = "1";
  }

  // (3) Tiny URL
  var onlyDomain = urlDomain.replace('www.', '');
  if (onlyDomain.length < 7) {
      result["Tiny URL"] = "1";
  } else {
      result["Tiny URL"] = "-1";
  }

  // (4) @ Symbol
  patt = /@/;
  if (patt.test(url)) { 
      result["@ Symbol"] = "1";
  } else {
      result["@ Symbol"] = "-1";
  }

  // (5) Redirecting using //
  if (url.lastIndexOf("//") > 7) {
      result["Redirecting using //"] = "1";
  } else {
      result["Redirecting using //"] = "-1";
  }

  // (6) Prefix/Suffix in domain
  patt = /-/;
  if (patt.test(urlDomain)) { 
      result["(-) Prefix/Suffix in domain"] = "1";
  } else {
      result["(-) Prefix/Suffix in domain"] = "-1";
  }

  // (7) No. of Sub Domains
  if ((onlyDomain.match(RegExp('\\.', 'g')) || []).length == 1) { 
      result["No. of Sub Domains"] = "-1";
  } else if ((onlyDomain.match(RegExp('\\.', 'g')) || []).length == 2) { 
      result["No. of Sub Domains"] = "0";    
  } else {
      result["No. of Sub Domains"] = "1";
  }

  // (8) HTTPS
  patt = /https:\/\//;
  if (patt.test(url)) {
      result["HTTPS"] = "-1";
  } else {
      result["HTTPS"] = "1";
  }

  // (9) Domain Registration Length (Placeholder)
  result["Domain Registration Length"] = "0"; // Placeholder logic

  // (10) Favicon
  var favicon = undefined;
  var nodeList = document.getElementsByTagName("link");
  for (var i = 0; i < nodeList.length; i++) {
      if ((nodeList[i].getAttribute("rel") == "icon") || (nodeList[i].getAttribute("rel") == "shortcut icon")) {
          favicon = nodeList[i].getAttribute("href");
      }
  }
  if (!favicon) {
      result["Favicon"] = "-1";
  } else if (favicon.length == 12) {
      result["Favicon"] = "-1";
  } else {
      patt = RegExp(urlDomain, 'g');
      if (patt.test(favicon)) {
          result["Favicon"] = "-1";
      } else {
          result["Favicon"] = "1";
      }
  }

  // (11) Non-Standard Port
  result["Port"] = "-1"; // Assuming not using a non-standard port

  // (12) HTTPS in URL's domain part
  patt = /https/;
  if (patt.test(onlyDomain)) {
      result["HTTPS in URL's domain part"] = "1";
  } else {
      result["HTTPS in URL's domain part"] = "-1";
  }

  // (13) Request URL
  var imgTags = document.getElementsByTagName("img");
  var phishCount = 0;
  var legitCount = 0;
  patt = RegExp(onlyDomain, 'g');

  for (var i = 0; i < imgTags.length; i++) {
      var src = imgTags[i].getAttribute("src");
      if (!src) continue;
      if (patt.test(src)) {
          legitCount++;
      } else if (src.charAt(0) == '/' && src.charAt(1) != '/') {
          legitCount++;
      } else {
          phishCount++;
      }
  }
  var totalCount = phishCount + legitCount;
  var outRequest = (phishCount / totalCount) * 100;

  if (outRequest < 22) {
      result["Request URL"] = "-1";
  } else if (outRequest >= 22 && outRequest < 61) {
      result["Request URL"] = "0";
  } else {
      result["Request URL"] = "1";
  }

  // (14) URL of Anchor
  var aTags = document.getElementsByTagName("a");
  phishCount = 0;
  legitCount = 0;
  for (var i = 0; i < aTags.length; i++) {
      var hrefs = aTags[i].getAttribute("href");
      if (!hrefs) continue;
      if (patt.test(hrefs)) {
          legitCount++;
      } else if (hrefs.charAt(0) == '#' || (hrefs.charAt(0) == '/' && hrefs.charAt(1) != '/')) {
          legitCount++;
      } else {
          phishCount++;
      }
  }
  totalCount = phishCount + legitCount;
  outRequest = (phishCount / totalCount) * 100;

  if (outRequest < 31) {
      result["Anchor"] = "-1";
  } else if (outRequest >= 31 && outRequest <= 67) {
      result["Anchor"] = "0";
  } else {
      result["Anchor"] = "1";
  }

  // (15) Links in script and link
  var sTags = document.getElementsByTagName("script");
  var lTags = document.getElementsByTagName("link");

  phishCount = 0;
  legitCount = 0;

  for (var i = 0; i < sTags.length; i++) {
      var sTag = sTags[i].getAttribute("src");
      if (sTag != null) {
          if (patt.test(sTag)) {
              legitCount++;
          } else if (sTag.charAt(0) == '/' && sTag.charAt(1) != '/') {
              legitCount++;
          } else {
              phishCount++;
          }
      }
  }

  for (var i = 0; i < lTags.length; i++) {
      var lTag = lTags[i].getAttribute("href");
      if (!lTag) continue;
      if (patt.test(lTag)) {
          legitCount++;
      } else if (lTag.charAt(0) == '/' && lTag.charAt(1) != '/') {
          legitCount++;
      } else {
          phishCount++;
      }
  }

  totalCount = phishCount + legitCount;
  outRequest = (phishCount / totalCount) * 100;

  if (outRequest < 17) {
      result["Script & Link"] = "-1";
  } else if (outRequest >= 17 && outRequest <= 81) {
      result["Script & Link"] = "0";
  } else {
      result["Script & Link"] = "1";
  }

  // (16) Server Form Handler (SFH)
  var forms = document.getElementsByTagName("form");
  var res = "-1";

  for (var i = 0; i < forms.length; i++) {
      var action = forms[i].getAttribute("action");
      if (!action || action == "") {
          res = "1";
          break;
      } else if (!(action.charAt(0) == "/" || patt.test(action))) {
          res = "0";
      }
  }
  result["SFH"] = res;

  // (17) Submitting to mail
  res = "-1";
  for (var i = 0; i < forms.length; i++) {
      var action = forms[i].getAttribute("action");
      if (!action) continue;
      if (action.startsWith("mailto")) {
          res = "1";
          break;
      }
  }
  result["mailto"] = res;

  // (23) Using iFrame
  var iframes = document.getElementsByTagName("iframe");
  result["iFrames"] = (iframes.length == 0) ? "-1" : "1";

  // Convert results to an array
  var featureArray = [
      parseInt(result["IP Address"]),
      parseInt(result["URL Length"]),
      parseInt(result["Tiny URL"]),
      parseInt(result["@ Symbol"]),
      parseInt(result["Redirecting using //"]),
      parseInt(result["(-) Prefix/Suffix in domain"]),
      parseInt(result["No. of Sub Domains"]),
      parseInt(result["HTTPS"]),
      parseInt(result["Domain Registration Length"]),
      parseInt(result["Favicon"]),
      parseInt(result["Port"]),
      parseInt(result["HTTPS in URL's domain part"]),
      parseInt(result["Request URL"]),
      parseInt(result["Anchor"]),
      parseInt(result["Script & Link"]),
      parseInt(result["SFH"]),
      parseInt(result["mailto"]),
      parseInt(result["iFrames"])
  ];

  return featureArray;
}
