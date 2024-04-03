attribute vec4 aPosition;
attribute vec4 aNormal;
attribute vec4 aColor;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;

varying highp vec4 vPosition;
varying highp vec4 vNormal;

varying highp vec4 vColor;
varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
    vTextureCoord = aTextureCoord;
    vPosition = uModelMatrix * aPosition;
    vNormal = aNormal;
}