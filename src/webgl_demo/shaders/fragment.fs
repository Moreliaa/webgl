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

struct PointLight {
    highp vec3 position;
    highp float attenuationLinear;
    highp float attenuationSquare;
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
};

struct DirectionalLight {
    highp vec3 direction;
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
};

uniform Material uMaterial;
uniform PointLight uLight;
uniform DirectionalLight uDirLight;

uniform bool uIsDirLighting;

uniform highp vec3 uCameraPosition;

highp vec3 calcDirLight(DirectionalLight light, highp vec3 texColorDiffuse, highp vec3 texColorSpecular) {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(-light.direction);

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

    highp vec3 ambient;
    highp vec3 diffuse;
    highp vec3 specular;
    if (uIsPhongShading) {
        ambient = (uMaterial.diffuseColor * light.ambientColor);
        diffuse = (light.diffuseColor * diffFrag * uMaterial.diffuseColor);
        specular = (light.specularColor * specFrag * uMaterial.specularColor);
    } else {
        diffuse = vLightColorGouraud;
    }
    return texColorDiffuse * ambient + texColorDiffuse * diffuse + texColorSpecular * specular;
}

highp vec3 calcPointLight(PointLight light, highp vec3 texColorDiffuse, highp vec3 texColorSpecular) {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(light.position - vPosition);

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

    highp float distanceFragToLight = length(light.position - vPosition);
    highp float attenuation = 1.0 / (1.0 + (distanceFragToLight * light.attenuationLinear) + (pow(distanceFragToLight, 2.0) * light.attenuationSquare));

    highp vec3 ambient;
    highp vec3 diffuse;
    highp vec3 specular;
    if (uIsPhongShading) {
        ambient = (uMaterial.diffuseColor * light.ambientColor * attenuation);
        diffuse = (light.diffuseColor * diffFrag * uMaterial.diffuseColor * attenuation);
        specular = (light.specularColor * specFrag * uMaterial.specularColor * attenuation);
    } else {
        diffuse = vLightColorGouraud;
    }
    return texColorDiffuse * ambient + texColorDiffuse * diffuse + texColorSpecular * specular;
}

void main() {
    highp vec3 texColorDiffuse = vec3(1.0,1.0,1.0);
    highp vec3 texColorSpecular = vec3(1.0,1.0,1.0);
    if (uIsTextured) {
        texColorDiffuse = vec3(texture2D(uSamplerDiffuse, vTextureCoord));
        texColorSpecular = vec3(texture2D(uSamplerSpecular, vTextureCoord));
    }
    highp vec3 resultColor = calcPointLight(uLight, texColorDiffuse, texColorSpecular);
    if (uIsDirLighting) {
        resultColor += calcDirLight(uDirLight, texColorDiffuse, texColorSpecular);
    }
    gl_FragColor = vec4(resultColor, 1.0);
}