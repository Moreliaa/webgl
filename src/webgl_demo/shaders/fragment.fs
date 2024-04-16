varying highp vec3 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

varying highp vec3 vLightColorGouraud;

uniform sampler2D uSampler;
uniform highp vec3 uObjectColor;

uniform bool uIsTextured;
uniform bool uIsPhongShading;
uniform bool uIsBlinnPhongShading;

uniform highp vec3 uAmbientColor;
uniform highp vec3 uDiffuseColor;
uniform highp float uDiffuseStrength;
uniform highp vec3 uSpecularColor;
uniform highp float uShininess;
uniform highp vec3 uLightPosition;
uniform highp vec3 uCameraPosition;

void main() {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag;
    if (uIsBlinnPhongShading) {
        highp vec3 halfVector = normalize(viewDirection + lightDirection);
        specFrag = pow(max(dot(halfVector, norm), 0.0), uShininess);
    } else {
        specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uShininess);
    }

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
        lightColor = vec4(vLightColorGouraud, 1.0);
    }

    gl_FragColor = objectColor * lightColor;
}