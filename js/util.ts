/**
 * 这里是 WebGl 一些工具函数，用于生成shader, program，以及 canvas 的像素处理。
 */

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type); // 创建着色器对象
  gl.shaderSource(shader, source); // 提供数据源
  gl.compileShader(shader); // 编译 -> 生成着色器
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // 检测编译是否成功
  if (success) return shader;
  const shaderInfo = gl.getShaderInfoLog(shader);
  console.log('shaderInfo', shaderInfo); // 若编译失败，输出编译错误信息。
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
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// 将 canvas 的宽高与 CSS 同步。这样可以使用 CSS 来控制 canvas 显示的范围。
function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio;
  canvas.width = Math.floor(dpr * rect.width);
  canvas.height = Math.floor(dpr * rect.height);
}

export { createShader, createProgram, resize };
