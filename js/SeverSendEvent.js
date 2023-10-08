const eventSource = new EventSource("http://127.0.0.1:3000/stream");

eventSource.onmessage = (event) => {
  console.log(event.data);
};
