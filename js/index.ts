import * as glUtils from './glUtils';
import m3, { Matrix3 } from './m3';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const { width, height } = document.body.getBoundingClientRect();
canvas.width = width;
canvas.height = height;
const glslify = (x: TemplateStringsArray) => x.toString();
const gl = canvas.getContext('webgl');

window.onresize = () => glUtils.resize(gl.canvas as HTMLCanvasElement);
['resize', 'orientationchange'].forEach((event) => {
  window.addEventListener(event, () =>
    glUtils.resize(gl.canvas as HTMLCanvasElement)
  );
});

// u_resolution: 从js传入的canvas.width & canvas.height
const vertexSource = glslify`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform mat3 u_Matrix3;
  void main() {
    gl_Position = vec4((u_Matrix3 * vec3(a_position, 1)).xy, 0, 1);
  }
`;
const fragmentSource = glslify`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.3, 0.65, 1, 1);
  }
`;

// 创建 shader & program
const program = glUtils.setupProgram(gl, vertexSource, fragmentSource);
gl.useProgram(program);

// 绑定buffer
const positionBuffer = gl.createBuffer();
const positions = [
  ...[0, 0, 200, 200, 200, 0]
];
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(positions), gl.STATIC_DRAW);
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

// 设置 resolution 变量的值
// const resolutionUniformLocation = gl.getUniformLocation(
//   program,
//   'u_resolution'
// );
const Matrix3Location = gl.getUniformLocation(program, 'u_Matrix3');

const drawScene = (gl: WebGLRenderingContext) => {
  // 调整画布大小
  glUtils.resize(gl.canvas as HTMLCanvasElement);
  // gl.uniform2fv(resolutionUniformLocation, [gl.canvas.width, gl.canvas.height]);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 计算变换矩阵
  const Matrix3Set = {
    translation: m3.translation(100, 0),
    rotation: m3.rotation(m3.degToRad(-90)),
    scale: m3.scaling(1, 1),
    projection: m3.projection(gl.canvas.width, gl.canvas.height),
  };
  // 清空画布
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 给 a_position attribute 传值
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 对 positions数组中的点进行平移、旋转、缩放等变换。尽管数组的顺序是从左到右，但实际变换的顺序是从右到左。
  // const transformQueue = ['translation', 'scale', 'rotation'];
  const transformQueue = [
    'projection',
    'recoverOriginTranslation',
    'scale',
    'translation',
    'rotation',
    'changeOriginTranslation',
  ];
  const finalMatrix3 = transformQueue.reduce<Matrix3>((acc, transform) => {
    const matrix = Matrix3Set[transform];
    return matrix ? m3.multiply(acc, matrix) : acc;
  }, m3.identity());
  gl.uniformMatrix3fv(Matrix3Location, false, finalMatrix3);
  // vertexAttribPointer 将锁定 positions 这个数组，后续将其它的数组绑定到 gl.ARRAY_BUFFER，也不会影响 'a_position' 接收到的值。
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.UNSIGNED_SHORT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

drawScene(gl);
