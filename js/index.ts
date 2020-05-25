import { createShader, createProgram, resize } from './util';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const { width, height } = document.body.getBoundingClientRect();
canvas.width = width;
canvas.height = height;
const glslify = (x: TemplateStringsArray) => x.toString();
const gl = canvas.getContext('webgl');

const vertexSource = glslify`
  attribute vec2 a_position;
  // u_resolution: 从js传入的canvas.width & canvas.height
  uniform vec2 u_resolution;
  void main() {
    vec2 clipspace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);
  }
`;
const fragmentSource = glslify`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
  }
`;

// 创建 shader & program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// 绑定buffer
const positionBuffer = gl.createBuffer();
const positions = [
  ...[100, 100, 200, 200, 300, 100],
  ...[600, 300, 800, 200, 800, 300]
];
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

// 设置 resolution 变量的值
const resolutionUniformLocation = gl.getUniformLocation(
  program,
  'u_resolution'
);
gl.uniform2fv(resolutionUniformLocation, [gl.canvas.width, gl.canvas.height]);

const drawScene = (gl: WebGLRenderingContext) => {
  // 调整画布大小 & 清空画布
  resize(gl.canvas as HTMLCanvasElement);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // vertexAttribPointer 将锁定 positions 这个数组，后续将其它的数组绑定到 gl.ARRAY_BUFFER，也不会影响 'a_position' 接收到的值。
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

drawScene(gl);
