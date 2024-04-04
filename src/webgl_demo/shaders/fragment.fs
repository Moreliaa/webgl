varying highp vec4 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp vec3 uAmbientColor;
uniform highp vec3 uDiffuseColor;
uniform highp vec4 uLightPosition;

void main() {
    highp vec4 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffuseStrength = max(dot(lightDirection, vec4(normalize(vNormal), 1.0)), 0.0);
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4((uAmbientColor + diffuseStrength * uDiffuseColor), 1.0);
}