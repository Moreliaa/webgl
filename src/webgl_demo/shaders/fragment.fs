varying highp vec4 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp vec3 uAmbientColor;
uniform highp vec3 uDiffuseColor;
uniform highp vec4 uLightPosition;
uniform highp vec4 uCameraPosition;

void main() {
    highp vec4 norm = vec4(normalize(vNormal), 1.0);
    highp vec4 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffuseStrength = max(dot(lightDirection, norm), 0.0);

    highp vec4 reflectedLightDirection = reflect(-lightDirection, norm);
    highp vec4 viewDirection = normalize(uCameraPosition - vPosition);

    highp float shininess = 32.0;
    highp vec3 specularColor = uDiffuseColor;
    highp float specularStrength = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), shininess);

    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4((uAmbientColor + diffuseStrength * uDiffuseColor  + specularStrength * specularColor), 1.0);
}