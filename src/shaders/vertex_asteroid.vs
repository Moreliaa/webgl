# version 300 es

layout (location = 0) in mat4 iModelMatrix;
layout (location = 4) in mat3 iNormalMatrix;
layout (location = 8) in vec4 aPosition;
layout (location = 10) in vec3 aNormal;
layout (location = 12) in vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;

uniform highp vec3 uCameraPosition;

out highp vec3 vPosition;
out highp vec3 vNormal;

out highp vec2 vTextureCoord;

void main() {
    gl_Position = uPerspectiveMatrix * uViewMatrix * iModelMatrix * aPosition;
    vTextureCoord = aTextureCoord;
    vPosition = vec3(iModelMatrix * aPosition);
    vNormal = iNormalMatrix * aNormal;
}