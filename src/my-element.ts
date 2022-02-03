/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

interface Coordinate {
  x: number,
  y: number
}

interface Point {
  [key: string]: Coordinate,
  p1: Coordinate,
  p2: Coordinate,
  cp1: Coordinate
}


/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  @query('#canvas')
  _canvas!: HTMLCanvasElement | null;

  @query('#code')
  _code!: HTMLPreElement | null;

  @property({ type: Boolean })
  quadratic = false;


  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1em;
    }

    #canvas {
      border: 4px dashed black;
      border-radius: 50%;
    }
    /* The switch - the box around the slider */
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    /* Hide default HTML checkbox */
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    /* The slider */
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
    }

    input:checked + .slider {
      background-color: #2196F3;
    }

    input:focus + .slider {
      box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
      border-radius: 34px;
    }

    .slider.round:before {
      border-radius: 50%;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = 'World';

  /**
   * Width of borders
   */
  @property({ type: Number })
  borderWidth = 10;

  override render() {
    return html`
      <canvas id="canvas">Fallback Content</canvas>
      <pre id="code">code</pre>
      <div class="input">
        <span>cubic</span>
        <label class="switch">
          <input @click="${this._toggle}" type="checkbox">
          <span class="slider round"></span>
      </label>
          <span>quadratic</span>
      </div>
      <slot></slot>
    `;
  }

  private _toggle() {
    console.log('togg', this.quadratic)
    this.quadratic = !this.quadratic
    this._canvasApp()
    // this.requestUpdate('_quadratic', this._quadratic)
  }

  private _canvasApp() {
    // const drawCanvas = this._draw.bind(this)
    const canvas = this._canvas as HTMLCanvasElement
    canvas.height = 400
    canvas.width = 400
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    const point: Point = {
      p1: {
        x: 100,
        y: 350
      },
      p2: {
        x: 300,
        y: 350
      },
      cp1: {
        x: 200,
        y: 100
      }
    }

    if (!this.quadratic) {
      point.cp1 = {
        x: 100,
        y: 100
      }
      point.cp2 = {
        x: 300,
        y: 100
      }
    }

    // default styles
    const style = {
      curve: {
        width: 6,
        color: "#000"
      },
      cpline: {
        width: 2.5,
        color: "#BADA55"
      },
      point: {
        radius: 10,
        width: 2,
        color: "#900",
        fill: "rgba(200, 200, 200, .5)",
        arc1: 0,
        arc2: 2 * Math.PI
      }
    };
    let drag: string | null = null
    let dPoint: Coordinate = { x: 0, y: 0 }

    // define initial points
    const init = () => {

      // line style defaults
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      //event handles
      canvas.addEventListener("mousedown", dragStart, false);
      canvas.addEventListener("mousemove", dragging, false);
      canvas.addEventListener("mouseup", dragEnd, false);
      canvas.addEventListener("mouseout", dragEnd, false);

      drawScreen();
    }

    // draw screen
    const drawScreen = () => {
      const { point: { width, color, fill, radius, arc1, arc2 } } = style
      const { p1, p2, cp1, cp2 } = point
      const { cpline, curve } = style
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this._draw()

      // control lines
      ctx.lineWidth = cpline.width;
      ctx.strokeStyle = cpline.color;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(cp1.x, cp1.y);

      if (point.cp2) {
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(cp2.x, cp2.y);
      } else {
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // curve
      ctx.lineWidth = curve.width;
      ctx.strokeStyle = curve.color;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      if (cp2) {
        ctx.bezierCurveTo(
          cp1.x,
          cp1.y,
          cp2.x,
          cp2.y,
          p2.x,
          p2.y
        );
      } else {
        ctx.quadraticCurveTo(
          cp1.x,
          cp1.y,
          p2.x,
          p2.y
        );
      }
      ctx.stroke();

      // control points
      for (const p in point) {
        const { x, y } = point[p]
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          radius,
          arc1,
          arc2,
          true
        );
        ctx.fill();
        ctx.stroke();
      }

      showCode();
    }

    // format string for code
    const showCode = () => {
      const { firstChild } = this._code as HTMLPreElement
      const { curve: { width, color } } = style
      const { p1, cp1, cp2, p2 } = point
      if (firstChild) {
        firstChild.nodeValue = `
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d")
        ctx.lineWidth = ${width};
        ctx.strokeStyle = "${color}";
        ctx.beginPath();
        ctx.moveTo(${p1.x}, ${p1.y});
        ${cp2 ?
            `ctx.bezierCurveTo(${cp1.x}, ${cp1.y}, ${cp2.x}, ${cp2.y}, ${p2.x}, ${p2.y});` :
            `ctx.quadraticCurveTo(${cp1.x}, ${cp1.y}, ${p2.x}, ${p2.y});`
        }
        ctx.stroke();
        `;
      }
    }

    // get coordinates from mouse event
    const MousePos = (event: MouseEvent) => {
      const { pageX, pageY } = event || window.event;
      const { offsetLeft, offsetTop } = canvas;
      return {
        x: pageX - offsetLeft,
        y: pageY - offsetTop
      };
    }

    // start dragging
    const dragStart = (event: MouseEvent) => {
      const e = MousePos(event);
      const { point: { radius } } = style

      let dx = 0
      let dy = 0
      for (const p in point) {
        const { x, y } = point[p]
        const { x: mouseX, y: mouseY } = e
        dx = x - mouseX;
        dy = y - mouseY;

        if (dx * dx + dy * dy < radius * radius) {
          drag = p;
          dPoint = e;
          canvas.style.cursor = "move";
          return;
        }
      }
    }

    // dragging in progress
    function dragging(event: MouseEvent) {
      if (drag) {
        const e = MousePos(event);
        point[drag].x += e.x - dPoint.x;
        point[drag].y += e.y - dPoint.y;
        dPoint = e;

        drawScreen();
      }
    }

    // stop dragging
    function dragEnd() {
      drag = null;
      canvas.style.cursor = "default";
      drawScreen();
    }

    drawScreen();
    init();
  }

  private _draw() {
    const { _canvas, borderWidth } = this
    const canvas = _canvas as HTMLCanvasElement
    canvas.height = 400
    canvas.width = 400
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const cx = 200;
    const cy = 200;
    const radius = 200;
    const colors = ['rgb(0,148,201)', 'rgb(241,200,49)', 'rgb(0,149,59)', 'rgb(199,50,58)'];

    for (let i = 0; i < colors.length; i++) {
      const startAngle = i * Math.PI / 2;
      const endAngle = startAngle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.strokeStyle = 'white'
      ctx.lineWidth = borderWidth
      ctx.fill();
      ctx.stroke();
    }
  }

  protected override firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    this._canvasApp()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
