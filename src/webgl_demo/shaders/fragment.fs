varying highp vec3 vPosition;
varying highp vec3 vNormal;

varying highp vec2 vTextureCoord;

varying highp vec3 vLightColorGouraud;

uniform sampler2D uSamplerDiffuse;
uniform sampler2D uSamplerSpecular;

uniform bool uIsTextured;
uniform bool uIsPhongShading;
uniform bool uIsBlinnPhongShading;

struct Material {
    highp vec3 diffuseColor;
    highp vec3 specularColor;
    highp float shininess;
};

struct Light {
    highp vec3 position;
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
};

uniform Material uMaterial;
uniform Light uLight;

uniform highp vec3 uCameraPosition;

void main() {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(uLight.position - vPosition);
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

    highp vec4 texColorDiffuse = vec4(1.0,1.0,1.0,1.0);
    highp vec4 texColorSpecular = vec4(1.0,1.0,1.0,1.0);
    if (uIsTextured) {
        texColorDiffuse = texture2D(uSamplerDiffuse, vTextureCoord);
        texColorSpecular = texture2D(uSamplerSpecular, vTextureCoord);
    }


    highp vec4 colorDiffuse;
    highp vec4 colorSpecular;
    if (uIsPhongShading) {
        colorDiffuse = vec4((uMaterial.diffuseColor * uLight.ambientColor + uLight.diffuseColor * diffFrag * uMaterial.diffuseColor), 1.0);
        colorSpecular = vec4((uLight.specularColor * specFrag * uMaterial.specularColor), 1.0);
    } else {
        colorDiffuse = vec4(vLightColorGouraud, 1.0);
    }

    gl_FragColor = texColorDiffuse * colorDiffuse + texColorSpecular * colorSpecular;
}