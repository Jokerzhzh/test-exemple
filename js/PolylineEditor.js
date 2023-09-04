class PolylineEditor {
  name = "PolylineEditor";

  parentEl = null;

  points = [];

  editor = null;
  circles = new Map();
  polylines = new Map();

  width = 400;
  height = 400;

  #extra = 20;

  #pixel = { x: 0, y: 0 };

  #isAdjusting = null;
  #isAdding = null;
  #isMove = false;

  #temporaryPoint = null;

  #editor_Attributes = new Map([
    ["width", `200px`],
    ["height", `200px`],
    ["viewBox", `0 0 200 200`],
    ["xmlns", "http://www.w3.org/2000/svg"],
    ["style", "background-color: #00000075"],
  ]);

  #polyline_Attributes = new Map([
    ["fill", "none"],
    ["stroke", "black"],
    ["stroke-width", "4"],
    ["stroke-dasharray", "5"],
    ["cursor", "pointer"],
  ]);

  #circle_Attributes = new Map([
    ["r", `5`],
    ["fill", "red"],
    ["cursor", "pointer"],
  ]);

  #namespaceURI = "http://www.w3.org/2000/svg";

  constructor({ dom, points }) {
    // constructor code here
    this.parentEl = dom;

    this.#pixel = {
      x: this.#findmin(points.map((_) => _.x)) - this.#extra,
      y: this.#findmin(points.map((_) => _.y)) - this.#extra,
    };

    this.points = points.map((_) => ({
      ..._,
      x: _.x - this.#pixel.x,
      y: _.y - this.#pixel.y + this.#extra,
    }));

    this.#pixel = {
      x: this.#findmin(this.points.map((_) => _.x)),
      y: this.#findmin(this.points.map((_) => _.y)),
    };

    // this.width = this.#maxdiff(this.points.map((_) => _.x)) + this.#extra * 2;
    // this.height = this.#maxdiff(this.points.map((_) => _.y)) + this.#extra * 2;

    this.width = dom.clientWidth;
    this.height = dom.clientHeight;

    this.#editor_Attributes.set("width", `${this.width}px`);
    this.#editor_Attributes.set("height", `${this.height}px`);
    this.#editor_Attributes.set("viewBox", `0 0 ${this.width} ${this.height}`);

    this.#init();
  }

  #init() {
    // init code here
    const editor = document.createElementNS(this.#namespaceURI, "svg");
    editor.style.position = "absolute";
    editor.style.top = "0px";
    editor.style.left = "0px";
    this.#editor_Attributes.forEach((value, key) => {
      editor.setAttribute(key, value);
    });
    this.editor = editor;

    // this.#redrawEditor();

    window.addEventListener("wheel", (e) => this.#changeScale(e));

    this.#redrawCircles();

    editor.addEventListener("mousemove", (e) => {
      if (this.#isAdjusting) {
        const { clientX, clientY } = e;
        const { left, top } = this.editor.getBoundingClientRect();
        let x = clientX - left;
        let y = clientY - top;

        if (x > this.width - this.#extra) x = this.width - this.#extra;
        if (x < this.#extra) x = this.#extra;

        if (y > this.height - this.#extra) y = this.height - this.#extra;
        if (y < this.#extra) y = this.#extra;

        const circle = this.circles.get(this.#isAdjusting);
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);

        this.points = this.points.map((_) =>
          _.name === this.#isAdjusting ? { ..._, x, y } : _
        );

        this.points.forEach(({ name, x, y }, i) => {
          if (!this.points[i + 1]) return;
          const polyline = this.polylines.get(`polyline${i + 1}`);
          polyline.setAttribute(
            "points",
            `${x},${y} ${this.points[i + 1].x},${this.points[i + 1].y}`
          );
        });
      }

      if (this.#isAdding) {
        this.#isMove = true;

        const index = this.#isAdding.replace("point", "");
        this.#temporaryPoint.setAttribute("index", index);
        const polylinename = `polyline${parseInt(index) + 1}`;

        const polyline = this.polylines.get(polylinename);

        const { clientX, clientY } = e;
        const { left, top } = this.editor.getBoundingClientRect();
        let x = clientX - left;
        let y = clientY - top;

        if (x > this.width - this.#extra) x = this.width - this.#extra;
        if (x < this.#extra) x = this.#extra;

        if (y > this.height - this.#extra) y = this.height - this.#extra;
        if (y < this.#extra) y = this.#extra;

        this.#temporaryPoint.setAttribute("cx", x);
        this.#temporaryPoint.setAttribute("cy", y);

        let points = polyline.getAttribute("points").split(" ");

        if (points.length === 2) {
          points = [
            ...points.slice(0, -1),
            `${x},${y}`,
            points[points.length - 1],
          ];
        } else {
          points[1] = `${x},${y}`;
        }

        polyline.setAttribute("points", points.join(" "));
      }

      // if (this.#isAdjusting) this.#redrawEditor(e);
    });

    window.addEventListener("mouseup", (e) => {
      if (this.#temporaryPoint) editor.removeChild(this.#temporaryPoint);

      if (this.#isMove && this.#temporaryPoint) {
        const index = Number(this.#temporaryPoint.getAttribute("index"));
        const name = `point${this.points.length}`;
        const x = Number(this.#temporaryPoint.getAttribute("cx"));
        const y = Number(this.#temporaryPoint.getAttribute("cy"));

        this.points = this.points.toSpliced(index + 1, 0, {
          name,
          x,
          y,
        });

        this.#redrawCircles();
      }

      this.#isAdjusting = null;
      this.#isAdding = null;
      this.#temporaryPoint = null;
      this.#isMove = false;
    });

    this.parentEl.appendChild(editor);
  }

  #changeScale(e) {
    // method code here
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    this.points = this.points.map((_) => ({
      ..._,
      x: _.x * scale,
      y: _.y * scale,
    }));

    // this.width *= scale;
    // this.height *= scale;

    // this.#editor_Attributes.set(
    //   "width",
    //   `${this.width * scale + this.#extra}px`
    // );
    // this.#editor_Attributes.set(
    //   "height",
    //   `${this.height * scale + this.#extra}px`
    // );
    // this.#editor_Attributes.set(
    //   "viewBox",
    //   `0 0 ${this.width * scale + this.#extra} ${
    //     this.height * scale + this.#extra
    //   }`
    // );

    this.#redraw();
  }

  #redraw() {
    // redraw code here
    this.#editor_Attributes.forEach((value, key) => {
      this.editor.setAttribute(key, value);
    });

    this.points.forEach(({ name, x, y }, index) => {
      if (!this.points[index + 1]) return;
      const polyline = this.polylines.get(`polyline${index + 1}`);
      polyline.setAttribute(
        "points",
        `${x},${y} ${this.points[index + 1].x},${this.points[index + 1].y}`
      );
    });

    this.circles.forEach((circle, name) => {
      const { x, y } = this.points.find((_) => _.name === name);
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
    });
  }

  #redrawEditor(e) {
    const { movementX, movementY } = e || { movementX: 0, movementY: 0 };
    this.#pixel = {
      x: this.#pixel.x + movementX,
      y: this.#pixel.y + movementY,
    };

    this.width = this.width - movementX;
    this.height = this.height - movementY;

    this.#editor_Attributes.set("width", `${this.width}px`);
    this.#editor_Attributes.set("height", `${this.height}px`);
    this.#editor_Attributes.set("viewBox", `0 0 ${this.width} ${this.height}`);

    this.#editor_Attributes.forEach((value, key) => {
      this.editor.setAttribute(key, value);
    });
    this.editor.style.position = "absolute";
    this.editor.style.top = `${this.#pixel.y}px`;
    this.editor.style.left = `${this.#pixel.x}px`;
  }

  #redrawCircles() {
    this.circles.forEach((circle, name) => {
      circle && this.editor.removeChild(circle);
    });

    this.circles.clear();

    this.points = this.points.map((_, i) => ({
      ..._,
      name: `point${i}`,
    }));

    this.#redrawPolylines();

    this.points.forEach(({ name, x, y }) => {
      const circle = document.createElementNS(this.#namespaceURI, "circle");
      this.#circle_Attributes.forEach((value, key) => {
        circle.setAttribute(key, value);
      });
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);

      this.editor.appendChild(circle);

      circle.addEventListener("mousedown", (e) => this.#circleDown(e, name));

      circle.addEventListener("dblclick", (e) =>
        this.#circleDoubleDown(e, name)
      );

      this.circles.set(name, circle);
    });
  }

  #circleDown(e, name) {
    this.#isAdjusting = name;
  }

  #circleDoubleDown(e, name) {
    if (this.points.length <= 2) return console.warn("至少需要两个点");
    const index = Number(name.replace("point", ""));
    this.points = this.points.toSpliced(index, 1);
    this.#redrawCircles();
  }

  #redrawPolylines() {
    this.polylines.forEach((polyline, name) => {
      polyline && this.editor.removeChild(polyline);
    });

    this.polylines.clear();

    this.points.forEach(({ name, x, y }, i) => {
      if (!this.points[i + 1]) return;

      const newPolyline = document.createElementNS(
        this.#namespaceURI,
        "polyline"
      );
      this.#polyline_Attributes.forEach((value, key) => {
        newPolyline.setAttribute(key, value);
      });

      newPolyline.setAttribute(
        "points",
        `${x},${y} ${this.points[i + 1].x},${this.points[i + 1].y}`
      );

      newPolyline.addEventListener("mousedown", (e) =>
        this.#polylinedown(e, name)
      );

      this.editor.appendChild(newPolyline);

      this.polylines.set(`polyline${i + 1}`, newPolyline);
    });
  }

  #polylinedown(e, name) {
    this.#isAdding = name;

    const { clientX, clientY } = e;
    const { left, top } = this.editor.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const circle = document.createElementNS(this.#namespaceURI, "circle");
    this.#circle_Attributes.forEach((value, key) => {
      circle.setAttribute(key, value);
    });

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);

    this.#temporaryPoint = circle;

    this.editor.appendChild(this.#temporaryPoint);
  }

  #findmin(array) {
    return array.reduce((pre, cur) => (pre < cur ? pre : cur));
  }

  #findmax(array) {
    return array.reduce((pre, cur) => (pre > cur ? pre : cur));
  }

  #maxdiff(array) {
    return this.#findmax(array) - this.#findmin(array);
  }
}

const content = document.getElementById("content");

const points = new Array(2).fill(0).map((_, i) => ({
  name: `point${i}`,
  x: Math.random() * 200,
  y: Math.random() * 200,
}));

const editor = new PolylineEditor({ dom: content, points });

console.log("🚀 ~ editor:", editor);
