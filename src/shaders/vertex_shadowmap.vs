# version 300 es

in vec4 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uOrthoMatrix;

void main() {
    gl_Position = uOrthoMatrix * uViewMatrix * uModelMatrix * aPosition;
}