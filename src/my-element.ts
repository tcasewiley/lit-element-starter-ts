/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'

import { Graph } from './graph'
import { Point, Coordinate } from './types'
import { booleanColorConverter, quadrantConverter } from './util/func'



/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  _canvas = createRef<HTMLCanvasElement>()
  _code = createRef<HTMLPreElement>();

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1em;
    }

    #canvas {
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
      -webkit-transition: 0.4s;
      transition: 0.4s;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
    }

    input:checked + .slider {
      background-color: #2196f3;
    }

    input:focus + .slider {
      box-shadow: 0 0 1px #2196f3;
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
  @state()
  stylePath?: Point | undefined;

  @state()
  save = false

  @property({
    type: Boolean
  })
  edit = true

  /**
   * Width of borders
   */
  @property({
    type: Number
  })
  borderWidth?: number;

  /**
   * Width of element
   */
  @property({
    type: Number
  })
  width = 100;

  /**
   * Height of element
   */
  @property({
    type: Number
  })
  height?: number;

  /**
   * qubic or quadratic arc
   */
  @property({ type: Boolean })
  quadratic = false;

  /**
   * border color
   */
  @property({
    type: String,
    converter: booleanColorConverter
  })
  border?: string;

  /**
   * 
   * Which quadrants are emphasized
   * if any
   */
  @property({
    type: Array,
    converter: quadrantConverter
  })
  quadrants = ['D', 'i', 'S', 'C']

  override render() {
    const editControls = this.edit ? html`
    <pre ${ref(this._code)}>code</pre>
    <div class="input">
      <span>cubic</span>
      <label class="switch">
        <input @click="${this._toggle}" type="checkbox" />
        <span class="slider round"></span>
      </label>
      <span>quadratic</span>
      <br>
      <button @click="${this.save ? this._deleteArc : this._saveArc}">${this.save ? 'Delete' : 'Save'} Arc</button>
    </div>
    ` : undefined
    return html`
      <canvas ${ref(this._canvas)}>Fallback Content</canvas>
      ${editControls}
      <slot></slot>
    `
  }

  private _toggle() {
    this.quadratic = !this.quadratic
    this.save = false
    this.stylePath = undefined
    this._canvasApp()
  }

  private _saveArc() {
    this.save = true
    this._canvasApp()
  }

  private _deleteArc() {
    this.save = false
    this._canvasApp()
  }

  private _drawProfileAvatar(angle: number, vector: number) {
    console.log("avatar")

    //This needs some updating for canvas, but otherwise good
    const scale = this.width / 70
      const radians = (angle - 90) * (Math.PI / 180)
      const hyp = 12 * vector * scale
      const x = hyp * Math.cos(radians)
      const y = hyp * Math.sin(radians)

    const canvas = this._canvas.value as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const testImage = new Image()

    testImage.onload = () => {

    ctx.save()
    ctx.beginPath()
    const offsetX = 150 + x
    const offsetY = 250 + y
    const radius = 25
    ctx.arc(radius+offsetX, radius+offsetY, radius, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(testImage, 0+offsetX, 0+offsetY, radius*2, radius*2)

    ctx.beginPath()
    ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.closePath()
    ctx.restore()
      
    }

    testImage.src = 'https://image.shutterstock.com/image-vector/man-icon-vector-260nw-1040084344.jpg'

  }

  private _canvasApp() {
    // const drawCanvas = this._draw.bind(this)
    const { width, height, save } = this
    const canvas = this._canvas.value as HTMLCanvasElement
    canvas.width = width
    canvas.height = height || width
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const point: Point = {
      p1: {
        x: 100,
        y: 350,
      },
      p2: {
        x: 300,
        y: 350,
      },
      cp1: {
        x: 200,
        y: 100,
      },
    }

    if (!this.quadratic) {
      point.cp1 = {
        x: 100,
        y: 100,
      }
      point.cp2 = {
        x: 300,
        y: 100,
      }
    }

    // default styles
    const style = {
      curve: {
        width: 6,
        color: '#000',
      },
      cpline: {
        width: 2.5,
        color: '#BADA55',
        fill: 'orange'
      },
      point: {
        radius: 10,
        width: 2,
        color: '#900',
        fill: 'rgba(200, 200, 200, .5)',
        arc1: 0,
        arc2: 2 * Math.PI,
      },
    }
    let drag: keyof Point | null = null
    let dPoint: Coordinate = { x: 0, y: 0 }

    // define initial points
    const init = () => {
      // line style defaults
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      //event handles
      canvas.addEventListener('mousedown', dragStart, false)
      canvas.addEventListener('mousemove', dragging, false)
      canvas.addEventListener('mouseup', dragEnd, false)
      canvas.addEventListener('mouseout', dragEnd, false)
      console.log('predraw')
      drawScreen()
    }

    // draw screen
    const drawScreen = () => {
      const {
        point: { width, color, fill, radius, arc1, arc2 },
      } = style
      const { p1, p2, cp1, cp2 } = point
      const { cpline, curve } = style
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this._draw()

      // control lines
      ctx.lineWidth = cpline.width
      ctx.strokeStyle = cpline.color
      ctx.fillStyle = cpline.fill

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(cp1.x, cp1.y)

      if (cp2) {
        ctx.moveTo(p2.x, p2.y)
        ctx.lineTo(cp2.x, cp2.y)
      } else {
        ctx.lineTo(p2.x, p2.y)
      }
      ctx.stroke()

      // curve
      ctx.lineWidth = curve.width
      ctx.strokeStyle = curve.color
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      if (cp2) {
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y)
      } else {
        ctx.quadraticCurveTo(cp1.x, cp1.y, p2.x, p2.y)
      }


      // this.stylePath = point
      ctx.stroke()

      // control points
      for (const p in point) {
        const { x, y } = point[p as keyof Point] as Coordinate
        ctx.lineWidth = width
        ctx.strokeStyle = color
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.arc(x, y, radius, arc1, arc2, true)
        ctx.fill()
        ctx.stroke()
      }
      console.log('before drawing')
      this._drawProfileAvatar(-18, 2)
      this._drawProfileAvatar(18, 2)
      showCode()
    }

    // format string for code
    const showCode = () => {
      const { firstChild } = this._code.value as HTMLPreElement
      const {
        curve: { width, color },
      } = style
      const { p1, cp1, cp2, p2 } = point
      if (firstChild) {
        firstChild.nodeValue = `
        canvas = document.getElementById("canvas")
        ctx = canvas.getContext("2d")
        ctx.lineWidth = ${width}
        ctx.strokeStyle = "${color}"
        ctx.beginPath()
        ctx.moveTo(${p1.x}, ${p1.y})
        ${cp2
            ? `ctx.bezierCurveTo(${cp1.x}, ${cp1.y}, ${cp2.x}, ${cp2.y}, ${p2.x}, ${p2.y})`
            : `ctx.quadraticCurveTo(${cp1.x}, ${cp1.y}, ${p2.x}, ${p2.y})`
          }
        ctx.stroke()
        `
      }
    }

    // get coordinates from mouse event
    const MousePos = (event: MouseEvent) => {
      const { pageX, pageY } = event || window.event
      const { offsetLeft, offsetTop } = canvas
      return {
        x: pageX - offsetLeft,
        y: pageY - offsetTop,
      }
    }

    // start dragging
    const dragStart = (event: MouseEvent) => {
      const e = MousePos(event)
      const {
        point: { radius },
      } = style

      let dx = 0
      let dy = 0
      for (const p in point) {
        const { x, y } = point[p as keyof Point] as Coordinate
        const { x: mouseX, y: mouseY } = e
        dx = x - mouseX
        dy = y - mouseY

        if (dx * dx + dy * dy < radius * radius) {
          drag = p as keyof Point
          dPoint = e
          canvas.style.cursor = 'move'
          return
        }
      }
    }

    // dragging in progress
    function dragging(event: MouseEvent) {
      const e = MousePos(event)
      if (drag) {
        const currentPoint = point[drag]
        if (currentPoint?.x) {
          currentPoint.x += e.x - dPoint.x
        }
        if (currentPoint?.y) {
          currentPoint.y += e.y - dPoint.y
        }

        dPoint = e

        drawScreen()
      }
    }

    // stop dragging
    const dragEnd = () => {
      drag = null
      canvas.style.cursor = 'default'
      drawScreen()
    }

    if (save) {
      this.stylePath = point
    } else {
      this.stylePath = undefined
      this.save = false
    }

    drawScreen()
    init()
  }

  private _draw() {
    const { border, quadrants, borderWidth, width, height, stylePath } = this
    const canvas = this._canvas.value as HTMLCanvasElement
    canvas.width = width
    canvas.height = height || width
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const graph = new Graph({ ctx, radius: width / 2, borderWidth })

    graph.baseGraph()

    if (border) {
      graph.drawDashedBorder(border)
    }

    graph.drawQuadrants(quadrants, stylePath)

    graph.drawInternalBorder('horizontal')

    graph.drawInternalBorder('vertical')

    graph.drawLabels()
    const textInside = true
    const kerning = 0
    graph.drawPriorityLabel('COLLABORATION', 270, 'center', textInside, true, kerning)
    graph.drawPriorityLabel('ACTION', 180, 'center', textInside, true, kerning)
    graph.drawPriorityLabel('ENCOURAGEMENT', 225, 'center', textInside, true, kerning)
    graph.drawPriorityLabel('CHALLENGE', 90, 'center', textInside, true, kerning)
    graph.drawPriorityLabel('DRIVE', 135, 'center', textInside, true, kerning)
    graph.drawPriorityLabel('SUPPORT', 135, 'center', textInside, false, kerning)
    graph.drawPriorityLabel('OBJECTIVITY', 225, 'center', textInside, false, kerning)
    graph.drawPriorityLabel('RELIABILITY', 180, 'center', textInside, false, kerning)


  }

  protected override firstUpdated(
    _changedProperties: Map<string | number | symbol, unknown>
  ): void {
    const { edit } = this
    if (edit) {
      this._canvasApp()

    } else {
      this._draw()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
