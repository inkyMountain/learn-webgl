attribute vec2 a_position;
vec2 position_projection;
uniform mat3 u_Matrix3;
varying vec2 v_texCoord;
attribute vec2 a_texCoord;
// #pragma glslify: yyy = require(./my-function.glsl)

void main() {
  v_texCoord = a_texCoord;
  position_projection = (u_Matrix3 * vec3(a_position, 1)).xy;
  gl_Position = vec4(position_projection.xy, 0, 1);
} 