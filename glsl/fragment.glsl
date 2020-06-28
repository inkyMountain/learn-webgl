precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;

void main() {
  // vec4 color1 = texture2D(u_image, v_texCoord).rgba;
  // vec4 color2 = texture2D(u_image2, v_texCoord).rgba;
  // gl_FragColor = color1 * color2;
  vec4 color1 = texture2D(u_image, v_texCoord).rgba;
  gl_FragColor = color1;
  // gl_FragColor = vec4(0.3, 0.65, 1, 1);
}