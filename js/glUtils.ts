/**
 * 这里是 WebGl 一些工具函数，用于生成shader, program，以及 canvas 的像素处理。
 */
interface InitInfo { gl: WebGLRenderingContext, canvas: HTMLCanvasElement; }
function initCanvas(): InitInfo {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const { width, height } = document.body.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext('webgl');
  ['resize', 'orientationchange'].forEach((event) => {
    window.addEventListener(event, () =>
      resize(gl.canvas as HTMLCanvasElement)
    );
  });
  return { gl, canvas };
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type); // 创建着色器对象
  gl.shaderSource(shader, source); // 提供数据源
  gl.compileShader(shader); // 编译 -> 生成着色器
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // 检测编译是否成功
  if (success) return shader;
  const shaderInfo = gl.getShaderInfoLog(shader);
  console.error('shaderInfo', shaderInfo); // 若编译失败，输出编译错误信息。
  gl.deleteShader(shader);
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function setupProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.linkProgram(program);
  return program;
}

// 将 canvas 的宽高与 CSS 同步。这样可以使用 CSS 来控制 canvas 显示的范围。
function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio;
  canvas.width = Math.floor(dpr * rect.width);
  canvas.height = Math.floor(dpr * rect.height);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function clear(gl: WebGLRenderingContext, color: RgbaColor) {
  gl.clearColor(...color);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

export {
  createShader,
  createProgram,
  resize,
  setupProgram,
  initCanvas,
  loadImage,
  clear,
  createTexture
};
