importScripts('subworkers.js');

self.onmessage = function(event) {
  const url = event.data.url;

  // Create a sub-worker using the SubWorker function from subworkers.js
  const subWorker = SubWorker('subWorkerTask.js'); // Sub-worker task script

  // Send data to the sub-worker
  subWorker.postMessage({ url });

  // Handle messages from the sub-worker
  subWorker.onmessage = function(e) {
    self.postMessage(e.data); // Send the result back to the main thread
  };

  subWorker.onerror = function(error) {
    console.error('Sub-worker error:', error);
    self.postMessage({ error: 'Error occurred in sub-worker' });
  };
};