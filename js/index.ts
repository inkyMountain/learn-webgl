import '../index';
import * as utils from './glUtils';
import m3 from './m3';
import pikachu from '../assets/images/pikachu.png';
import leaves from '../assets/images/leaves.jpg';
import vertexSource from "../glsl/vertex.glsl";
import fragmentSource from "../glsl/fragment.glsl";

console.log('vertexSource', vertexSource);
console.log('fragmentSource', fragmentSource);
const { gl, canvas } = utils.initCanvas();

const program = utils.setupProgram(gl, vertexSource, fragmentSource);
gl.useProgram(program);

// 三角形的移动速度的速度 画板单位/s
const speed = 150;

const render = (time: number, image: Array<HTMLImageElement>) => {
  const second = time / 1000;
  utils.resize(gl.canvas as HTMLCanvasElement);
  // gl.uniform2fv(resolutionUniformLocation, [gl.canvas.width, gl.canvas.height]);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const translation = speed * second % (canvas.width - 200);

  const transformMatrix = {
    projection: m3.projection(gl.canvas.width, gl.canvas.height),
    scale: m3.scaling(1, 1),
    translation: m3.translation(100, 100),
    rotation: m3.rotation(m3.degToRad(0)),
  };
  const finalMatrix3 = Object.keys(transformMatrix).reduce<Matrix3>(
    (acc, transform) => m3.multiply(acc, transformMatrix[transform]),
    m3.identity()
  );
  gl.uniformMatrix3fv(gl.getUniformLocation(program, 'u_Matrix3'), false, finalMatrix3);

  utils.clear(gl, [255, 255, 255, 1]);

  const positionBuffer = gl.createBuffer();
  const width = image[0].width * 2;
  const height = image[0].height * 2;
  const trianglePoints = [
    0, 0,
    width, 0,
    0, height,
    0, height,
    width, 0,
    width, height,
  ];
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(trianglePoints), gl.STATIC_DRAW);
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  // vertexAttribPointer 将锁定 trianglePoints 这个数组，后续将其它的数组绑定到 gl.ARRAY_BUFFER，也不会影响 'a_position' 接收到的值。
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.UNSIGNED_SHORT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  utils.createTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[0]);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

async function runner() {
  const images = await Promise.all([utils.loadImage(pikachu), utils.loadImage(leaves)]);
  requestAnimationFrame((time) => {
    render(time, images);
  });
}

runner();
