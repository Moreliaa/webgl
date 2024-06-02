# version 300 es

in highp vec3 aPosition;

uniform mat4 uPerspectiveMatrix;
uniform mat4 uViewMatrix;

out highp vec3 vCubeMapDirection;

void main() {
    vCubeMapDirection = aPosition;
    gl_Position = uPerspectiveMatrix * uViewMatrix * vec4(aPosition, 1.0);
}