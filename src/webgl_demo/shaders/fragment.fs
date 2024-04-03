varying highp vec4 vPosition;
varying highp vec4 vNormal;

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp vec4 uAmbientColor;
uniform highp vec4 uDiffuseColor;
uniform highp vec4 uLightPosition;

void main() {
    highp vec4 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffuseStrength = max(dot(lightDirection, normalize(vNormal)), 0.0);
    gl_FragColor = texture2D(uSampler, vTextureCoord) * (uAmbientColor + diffuseStrength * uDiffuseColor);
}