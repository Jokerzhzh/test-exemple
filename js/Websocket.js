class WebsocketImpl {
  /**
   * @type { WebSocket }
   * @param { { host: number, wsProt: number, appProt: number } } config
   * @param { {autoRetry: boolean} } options
   */
  constructor({ host, wsProt, appProt }, options = {}) {
    if (!host || !wsProt || !appProt)
      throw new Error("host, wsProt, appProt is required");

    const { autoRetry } = options;
    this.autoRetry = autoRetry;
    this.connected = false;
    this.url = `ws://${host}:${wsProt}`;
    this.baseUrl = `http://${host}:${appProt}`;

    this.kickoff();
  }

  kickoff() {
    if (!this.closedByHand) this.dispose();
    this.websocket = new WebSocket(this.url);
    this.setupListeners();
    this.closedByHand = false;
  }

  send() {
    if (this.connected) {
      this.websocket.send(...arguments);
      log(`Client send: ${[...arguments].join(",")}`);
    }
  }

  sendJSON() {
    this.send(
      ...[...arguments].map((it) => JSON.stringify({ id: this.id, ...it }))
    );
  }

  async doRetry(ms = 1200) {
    let times = 0;
    while (true) {
      try {
        console.warn(`第${++times}次尝试`);
        const response = await fetch(new URL("/websocket-retry", this.baseUrl));
        const { serverStatus } = await response.json();
        if (!serverStatus) throw new Error("serverStatus is false");

        this.clearListeners();
        this.websocket = new WebSocket(this.url);
        this.setupListeners();
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
  }

  setupListeners() {
    this.websocket.addEventListener("open", this.onOpen);
    this.websocket.addEventListener("close", this.onClose);
    this.websocket.addEventListener("message", this.onMessage);
    this.websocket.addEventListener("error", this.onError);
  }

  clearListeners() {
    if (this.websocket) {
      this.websocket.removeEventListener("open", this.onOpen);
      this.websocket.removeEventListener("close", this.onClose);
      this.websocket.removeEventListener("message", this.onMessage);
      this.websocket.removeEventListener("error", this.onError);
    }
  }

  /**
   * 连接监听
   * @param { Event } event
   */
  onOpen = (event) => {
    this.connected = true;
  };

  /**
   * 关闭监听
   * @param { Event } event
   */
  onClose = (event) => {
    console.log("onClose:", event);
    this.connected = false;

    if (this.autoRetry && !this.closedByHand) {
      log("Server closed, retrying...");
      this.doRetry();
    }
  };

  /**
   * 消息监听
   * @param {Event} event
   */
  onMessage = (event) => {
    const { data } = event;
    // console.log("onMessage:", data);
    log(`Server respond: ${data}`);
  };

  /**
   * 错误监听
   * @param {Event} event
   */
  onError = (event) => {
    console.log("onError:", event);
    log(`Server error: ${event}`);
  };

  dispose() {
    this.connected = false;
    this.clearListeners();
    this.id = null;
    this.websocket?.close();
    this.websocket = null;
  }

  shutdown() {
    this.closedByHand = true;
    this.dispose();
    try {
      log("Client closed .");
    } catch {}
  }

  retry() {
    this.closedByHand = false;
    this.doRetry();
    log("Client closed, retrying...");
  }
}
const baseURL = window.location.href;
const response = await fetch(new URL("/env", baseURL));
const env = await response.json();
const { baseHost: host, appProt, wsProt } = env;

const websocket = new WebsocketImpl(
  { host, appProt, wsProt },
  { autoRetry: true }
);

console.log("🚀 ~ websocket:", websocket);

const openBtn = document.getElementById("Open");
openBtn.onclick = () => fetch(new URL("/openwss", baseURL)).then(getStatus);

const closeBtn = document.getElementById("Close");
closeBtn.onclick = () => fetch(new URL("/closewss", baseURL)).then(getStatus);

const openedEl = document.getElementById("Opened");
const closedEl = document.getElementById("Closed");

const textInput = document.getElementById("Text");
const sendBtn = document.getElementById("Send");
sendBtn.onclick = () => {
  const text = textInput.value;
  text && websocket.send(text);
};

const CloseWsBtn = document.getElementById("CloseWs");
CloseWsBtn.onclick = () => {
  websocket.shutdown();
};

const RetryWsBtn = document.getElementById("RetryWs");
RetryWsBtn.onclick = () => {
  websocket.retry();
};

const logEl = document.getElementById("log");

function log(text) {
  const p = document.createElement("p");
  p.innerText = text;
  logEl.appendChild(p);
}

const proxy = new Proxy(
  { wsServerStatus: false },
  {
    set(target, key, value) {
      target[key] = value;
      redraw();
      return true;
    },
  }
);

function redraw() {
  if (proxy.wsServerStatus) {
    closeBtn.style.display = "block";
    openBtn.style.display = "none";
    openedEl.style.display = "initial";
    closedEl.style.display = "none";
  } else {
    closeBtn.style.display = "none";
    openBtn.style.display = "block";
    openedEl.style.display = "none";
    closedEl.style.display = "initial";
  }
}

async function getStatus() {
  const serverStatusres = await fetch(new URL("/serverStatus", baseURL));
  const res = await serverStatusres.json();
  const { serverStatus } = res;
  proxy.wsServerStatus = serverStatus;
}

await getStatus();
