varying highp vec4 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

varying highp vec4 vLightColorGouraud;

uniform sampler2D uSampler;
uniform highp vec3 uObjectColor;

uniform bool uIsTextured;
uniform bool uIsPhongShading;

uniform highp vec3 uAmbientColor;
uniform highp vec3 uDiffuseColor;
uniform highp float uDiffuseStrength;
uniform highp vec3 uSpecularColor;
uniform highp float uShininess;
uniform highp vec4 uLightPosition;
uniform highp vec4 uCameraPosition;

void main() {
    highp vec4 norm = vec4(normalize(vNormal), 1.0);
    highp vec4 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    highp vec4 reflectedLightDirection = reflect(-lightDirection, norm);
    highp vec4 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uShininess);

    highp vec4 objectColor;
    if (uIsTextured) {
        objectColor = texture2D(uSampler, vTextureCoord);
    } else {
        objectColor = vec4(uObjectColor, 1.0);
    }


    highp vec4 lightColor;
    if (uIsPhongShading) {
        lightColor = vec4((uAmbientColor + uDiffuseStrength * diffFrag * uDiffuseColor  + specFrag * uSpecularColor), 1.0);
    } else {
        lightColor = vLightColorGouraud;
    }

    gl_FragColor = objectColor * lightColor;
}