# version 300 es

in highp vec3 vCubeMapDirection;

uniform samplerCube uCubeMap;

out highp vec4 fragColor;

void main() {
    fragColor = texture(uCubeMap, vCubeMapDirection);
}