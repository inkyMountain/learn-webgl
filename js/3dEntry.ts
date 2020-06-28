import '../index';
import * as utils from './glUtils';
import m4 from './m4';
import m3 from './m3';
import vertexSource from "../glsl/vertex-3d.glsl";
import fragmentSource from "../glsl/fragment-3d.glsl";

const { gl, canvas } = utils.initCanvas();
// 让webgl只绘制“正面”的三角形，即顶点顺序为逆时针的三角形。
gl.enable(gl.CULL_FACE);
const program = utils.setupProgram(gl, vertexSource, fragmentSource);
gl.useProgram(program);

const render = () => {
  // resize并清除上次绘制内容
  utils.resize(canvas);
  utils.clear(gl, [255, 255, 255, 1]);
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 计算平移、旋转、与缩放变换
  const transformMatrix = {
    projection: m4.orthographic(0, canvas.width, canvas.height, 0, 200, -200),
    scale: m4.scaling(1, 1, 1),
    translation: m4.translation(100, 100, 0),
    rotation: m4.yRotation(m3.degToRad(40)),
  };
  const finalMatrix3 = Object.keys(transformMatrix).reduce<Matrix4>(
    (acc, transform) => m4.multiply(acc, transformMatrix[transform]),
    m4.identity()
  );
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, finalMatrix3);

  // 传递 三角形顶点 attribute
  const triangleBuffer = gl.createBuffer();
  const trianglePoints = new Float32Array([
    // left column front
    0, 0, 0,
    30, 0, 0,
    0, 150, 0,
    0, 150, 0,
    30, 0, 0,
    30, 150, 0,
    // top rung front
    30, 0, 0,
    100, 0, 0,
    30, 30, 0,
    30, 30, 0,
    100, 0, 0,
    100, 30, 0,
    // middle rung front
    30, 60, 0,
    67, 60, 0,
    30, 90, 0,
    30, 90, 0,
    67, 60, 0,
    67, 90, 0,
    // left column back
    0, 0, 30,
    30, 0, 30,
    0, 150, 30,
    0, 150, 30,
    30, 0, 30,
    30, 150, 30,
    // top rung back
    30, 0, 30,
    100, 0, 30,
    30, 30, 30,
    30, 30, 30,
    100, 0, 30,
    100, 30, 30,
    // middle rung back
    30, 60, 30,
    67, 60, 30,
    30, 90, 30,
    30, 90, 30,
    67, 60, 30,
    67, 90, 30,
    // top
    0, 0, 0,
    100, 0, 0,
    100, 0, 30,
    0, 0, 0,
    100, 0, 30,
    0, 0, 30,
    // top rung right
    100, 0, 0,
    100, 30, 0,
    100, 30, 30,
    100, 0, 0,
    100, 30, 30,
    100, 0, 30,
    // under top rung
    30, 30, 0,
    30, 30, 30,
    100, 30, 30,
    30, 30, 0,
    100, 30, 30,
    100, 30, 0,
    // between top rung and middle
    30, 30, 0,
    30, 30, 30,
    30, 60, 30,
    30, 30, 0,
    30, 60, 30,
    30, 60, 0,
    // top of middle rung
    30, 60, 0,
    30, 60, 30,
    67, 60, 30,
    30, 60, 0,
    67, 60, 30,
    67, 60, 0,
    // right of middle rung
    67, 60, 0,
    67, 60, 30,
    67, 90, 30,
    67, 60, 0,
    67, 90, 30,
    67, 90, 0,
    // bottom of middle rung.
    30, 90, 0,
    30, 90, 30,
    67, 90, 30,
    30, 90, 0,
    67, 90, 30,
    67, 90, 0,
    // right of bottom
    30, 90, 0,
    30, 90, 30,
    30, 150, 30,
    30, 90, 0,
    30, 150, 30,
    30, 150, 0,
    // bottom
    0, 150, 0,
    0, 150, 30,
    30, 150, 30,
    0, 150, 0,
    30, 150, 30,
    30, 150, 0,
    // left side
    0, 0, 0,
    0, 0, 30,
    0, 150, 30,
    0, 0, 0,
    0, 150, 30,
    0, 150, 0
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, trianglePoints, gl.STATIC_DRAW);
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  // vertexAttribPointer 将锁定 trianglePoints 这个数组，后续将其它的数组绑定到 gl.ARRAY_BUFFER，也不会影响 'a_position' 接收到的值。
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  // 传递 面的颜色 attribute
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  const colorPoints = new Uint8Array([
    // left column front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,

    // top rung front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,

    // middle rung front
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,
    200, 70, 120,

    // left column back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // top rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // middle rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // top
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,

    // top rung right
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,

    // under top rung
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,

    // between top rung and middle
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

    // top of middle rung
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,

    // right of middle rung
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,

    // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,

    // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,

    // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,

    // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220]);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bufferData(gl.ARRAY_BUFFER, colorPoints, gl.STATIC_DRAW);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 96);
};

render();
