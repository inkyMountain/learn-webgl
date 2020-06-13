import * as utils from './glUtils';
import m3, { Matrix3 } from './m3';
import pikachu from '../assets/images/pikachu.png';
import leaves from '../assets/images/leaves.jpg';

const { gl, canvas } = utils.initCanvas();
const glslify = (x: TemplateStringsArray) => x.toString();
// 顶点着色器
const vertexSource = glslify`
attribute vec2 a_position;
vec2 position_projection;
uniform mat3 u_Matrix3;
varying vec2 v_texCoord;
attribute vec2 a_texCoord;

void main() {
  v_texCoord = a_texCoord;
  gl_Position = vec4((u_Matrix3 * vec3(a_position, 1)).xy, 0, 1);
} 
// position_projection = (u_Matrix3 * vec3(a_position, 1)).xy;
// v_texCoord = position_projection;
// gl_Position = vec4(position_projection, 0, 1);
`;
// 片段着色器
const fragmentSource = glslify`
  precision mediump float;
  // 从顶点着色器传入的纹理坐标
  varying vec2 v_texCoord;
  // 纹理
  uniform sampler2D u_image;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
    // gl_FragColor = vec4(0.3, 0.65, 1, 1);
  }
  `;

const program = utils.setupProgram(gl, vertexSource, fragmentSource);
gl.useProgram(program);

// 三角形的移动速度的速度 单位/s
const speed = 150;

const render = (time: number, image: HTMLImageElement) => {
  const second = time / 1000;
  utils.resize(gl.canvas as HTMLCanvasElement);
  // gl.uniform2fv(resolutionUniformLocation, [gl.canvas.width, gl.canvas.height]);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const translation = speed * second % (canvas.width - 200);
  const Matrix3Set = {
    translation: m3.translation(translation, 0),
    rotation: m3.rotation(m3.degToRad(0)),
    scale: m3.scaling(1, 1),
    projection: m3.projection(gl.canvas.width, gl.canvas.height),
  };

  gl.clearColor(255, 255, 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 给 a_position attribute 传值
  const positionBuffer = gl.createBuffer();
  const positions = [
    0, 0, image.width, 0, image.width, image.height,
    0, 0, image.width, image.height, 0, image.height,
  ];
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(positions), gl.STATIC_DRAW);
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const Matrix3Location = gl.getUniformLocation(program, 'u_Matrix3');
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 对 positions数组中的点进行平移、旋转、缩放等变换。尽管数组的顺序是从左到右，但实际变换的顺序是从右到左。
  const transformQueue = [
    'projection',
    'recoverOriginTranslation',
    'scale',
    'translation',
    'rotation',
    'changeOriginTranslation',
  ];
  const finalMatrix3 = transformQueue.reduce<Matrix3>(
    (acc, transform) => {
      const matrix = Matrix3Set[transform];
      return matrix ? m3.multiply(acc, matrix) : acc;
    },
    m3.identity()
  );
  gl.uniformMatrix3fv(Matrix3Location, false, finalMatrix3);
  // vertexAttribPointer 将锁定 positions 这个数组，后续将其它的数组绑定到 gl.ARRAY_BUFFER，也不会影响 'a_position' 接收到的值。
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.UNSIGNED_SHORT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

async function runner() {
  const image = await utils.loadImage(pikachu);
  requestAnimationFrame((time) => {
    render(time, image);
  });
}

runner();
