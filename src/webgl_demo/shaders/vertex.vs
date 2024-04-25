attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;

uniform highp vec3 uCameraPosition;

varying highp vec3 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
    vTextureCoord = aTextureCoord;
    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = uNormalMatrix * aNormal;
}