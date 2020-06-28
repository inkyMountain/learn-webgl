precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;

void main() {
  vec4 color1 = texture2D(u_image, v_texCoord).rgba;
  gl_FragColor = color1;
}