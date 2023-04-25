/**
 * Create a unique id
 * @param {string} name - name of the channel
 * @returns - id
 */
function createId(name) {
  const key = `channel-${name}`;
  let id = +localStorage.getItem(key) || 0;
  id++;
  localStorage.setItem(key, id.toString());
  return id;
}

/**
 * Send a message to a channel
 * @param {string} msg - message to send
 * @param {BroadcastChannel} channel - channel to send to
 */
function sendMsg(msg, channel) {
  channel.postMessage({ id: channel.id, msg });
}

/**
 * Create a channel
 * @param {string} name - name of the channel
 * @param {*} id - id of the channel (optional) - if not provided, a unique id will be created
 * @param {HTMLElement} element - element to append messages to
 * @returns
 */
function createChannel(name, id, element) {
  const channel = new BroadcastChannel(name);
  channel.id = id ?? createId(name);
  channel.listeners = new Set();
  sendMsg("init", channel);

  window.onunload = () => sendMsg("destroy", channel);

  channel.onmessage = (e) => {
    const { msg, id } = e.data;

    switch (msg) {
      case "init":
        sendMsg("respond", channel);
        channel.listeners.add(id);
        break;
      case "respond":
        channel.listeners.add(id);
        break;
      case "destroy":
        channel.listeners.delete(id);
        break;
      default:
        const p = document.createElement("p");
        p.innerHTML = `${id}: ${msg}`;
        element.appendChild(p);
        break;
    }
  };

  return channel;
}
