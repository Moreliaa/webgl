varying highp vec3 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

varying highp vec3 vLightColorGouraud;

uniform sampler2D uSampler;
uniform highp vec3 uObjectColor;

uniform bool uIsTextured;
uniform bool uIsPhongShading;
uniform bool uIsBlinnPhongShading;

struct Material {
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
    highp float shininess;
};

uniform Material uMaterial;

uniform highp float uDiffuseStrength;


uniform highp vec3 uLightPosition;
uniform highp vec3 uCameraPosition;

void main() {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(uLightPosition - vPosition);
    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag = 0.0;
    if (diffFrag > 0.0) {
        if (uIsBlinnPhongShading) {
            highp vec3 halfVector = normalize(viewDirection + lightDirection);
            specFrag = pow(max(dot(halfVector, norm), 0.0), uMaterial.shininess);
        } else {
            specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uMaterial.shininess);
        }
    }

    highp vec4 objectColor;
    if (uIsTextured) {
        objectColor = texture2D(uSampler, vTextureCoord);
    } else {
        objectColor = vec4(uObjectColor, 1.0);
    }


    highp vec4 lightColor;
    if (uIsPhongShading) {
        lightColor = vec4((uMaterial.ambientColor + uDiffuseStrength * diffFrag * uMaterial.diffuseColor  + specFrag * uMaterial.specularColor), 1.0);
    } else {
        lightColor = vec4(vLightColorGouraud, 1.0);
    }

    gl_FragColor = objectColor * lightColor;
}