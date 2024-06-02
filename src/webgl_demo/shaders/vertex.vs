# version 300 es

in vec4 aPosition;
in vec3 aNormal;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;

uniform highp vec3 uCameraPosition;

out highp vec3 vPosition;
out highp vec3 vNormal;

out highp vec2 vTextureCoord;

out highp vec3 vCubeMapDirection;

void main() {
    gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
    vTextureCoord = aTextureCoord;
    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = uNormalMatrix * aNormal;
}