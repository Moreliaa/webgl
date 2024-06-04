# version 300 es

in highp vec3 vPosition;
in highp vec3 vNormal;

in highp vec2 vTextureCoord;

out highp vec4 fragColor;

uniform samplerCube uCubeMap;

uniform sampler2D uSamplerDiffuse;
uniform sampler2D uSamplerSpecular;

uniform bool uIsTextured;
uniform bool uIsPhongShading;
uniform bool uIsBlinnPhongShading;
uniform bool uIsReflection;

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

struct SpotLight {
    highp vec3 position;
    highp vec3 direction;
    highp float angleCutoffInner;
    highp float angleCutoffOuter;
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
};

uniform Material uMaterial;
uniform PointLight uLight;
uniform DirectionalLight uDirLight;
uniform SpotLight uFlashlight;

uniform bool uIsDirLighting;
uniform bool uIsFlashlight;

uniform highp vec3 uCameraPosition;

highp vec3 calcSpotLight(SpotLight light, highp vec3 texColorDiffuse, highp vec3 texColorSpecular) {
    highp vec3 lightDirection = normalize(light.position - vPosition);
    highp float dotFrag = dot(lightDirection, -normalize(light.direction));

    highp float intensity = (dotFrag - light.angleCutoffOuter) / (light.angleCutoffInner - light.angleCutoffOuter);
    intensity = clamp(intensity, 0.0, 1.0);

    highp vec3 norm = normalize(vNormal);
    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag = 0.0;
    if (diffFrag > 0.0) {
        if (uIsBlinnPhongShading) {
            highp vec3 halfVector = normalize(viewDirection + lightDirection);
            specFrag = pow(max(dot(halfVector, norm), 0.0), uMaterial.shininess);
        } else {
            highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
            specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uMaterial.shininess);
        }
    }

    highp float distanceFragToLight = length(light.position - vPosition);
    highp float attenuation = 1.0; // / (1.0 + (distanceFragToLight * light.attenuationLinear) + (pow(distanceFragToLight, 2.0) * light.attenuationSquare));

    highp vec3 ambient = (uMaterial.diffuseColor * light.ambientColor * attenuation);
    highp vec3 diffuse = (light.diffuseColor * diffFrag * uMaterial.diffuseColor * attenuation * intensity);
    highp vec3 specular = (light.specularColor * specFrag * uMaterial.specularColor * attenuation * intensity);
    return texColorDiffuse * ambient + texColorDiffuse * diffuse + texColorSpecular * specular;
}

highp vec3 calcDirLight(DirectionalLight light, highp vec3 texColorDiffuse, highp vec3 texColorSpecular) {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(-light.direction);

    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag = 0.0;
    if (diffFrag > 0.0) {
        if (uIsBlinnPhongShading) {
            highp vec3 halfVector = normalize(viewDirection + lightDirection);
            specFrag = pow(max(dot(halfVector, norm), 0.0), uMaterial.shininess);
        } else {
            highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
            specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uMaterial.shininess);
        }
    }

    highp vec3 ambient;
    highp vec3 diffuse;
    highp vec3 specular;
    ambient = (uMaterial.diffuseColor * light.ambientColor);
    diffuse = (light.diffuseColor * diffFrag * uMaterial.diffuseColor);
    specular = (light.specularColor * specFrag * uMaterial.specularColor);
    return texColorDiffuse * ambient + texColorDiffuse * diffuse + texColorSpecular * specular;
}

highp vec3 calcPointLight(PointLight light, highp vec3 texColorDiffuse, highp vec3 texColorSpecular) {
    highp vec3 norm = normalize(vNormal);
    highp vec3 lightDirection = normalize(light.position - vPosition);

    highp float diffFrag = max(dot(lightDirection, norm), 0.0);

    
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

    highp float specFrag = 0.0;
    if (diffFrag > 0.0) {
        if (uIsBlinnPhongShading) {
            highp vec3 halfVector = normalize(viewDirection + lightDirection);
            specFrag = pow(max(dot(halfVector, norm), 0.0), uMaterial.shininess);
        } else {
            highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
            specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uMaterial.shininess);
        }
    }

    highp float distanceFragToLight = length(light.position - vPosition);
    highp float attenuation = 1.0 / (1.0 + (distanceFragToLight * light.attenuationLinear) + (pow(distanceFragToLight, 2.0) * light.attenuationSquare));

    highp vec3 ambient;
    highp vec3 diffuse;
    highp vec3 specular;
    ambient = (uMaterial.diffuseColor * light.ambientColor * attenuation);
    diffuse = (light.diffuseColor * diffFrag * uMaterial.diffuseColor * attenuation);
    specular = (light.specularColor * specFrag * uMaterial.specularColor * attenuation);
    return texColorDiffuse * ambient + texColorDiffuse * diffuse + texColorSpecular * specular;
}

highp vec4 calcCubeMapReflection() {
    highp vec3 viewDirection = normalize(uCameraPosition - vPosition);
    highp vec3 norm = normalize(vNormal);
    highp vec3 cubeTexDir = reflect(-viewDirection, norm);
    return texture(uCubeMap, cubeTexDir);
}

void main() {
    highp vec4 texColorDiffuse;
    highp vec4 texColorSpecular;
    if (uIsTextured) {
        texColorDiffuse = texture(uSamplerDiffuse, vTextureCoord);
        texColorSpecular = texture(uSamplerSpecular, vTextureCoord);
        if (uIsReflection) {
            highp vec4 reflectedColor = calcCubeMapReflection();
            texColorDiffuse += reflectedColor;
            texColorSpecular += reflectedColor;
        }
    } else {
        if (uIsReflection) {
            highp vec4 reflectedColor = calcCubeMapReflection();
            texColorDiffuse = reflectedColor;
            texColorSpecular = reflectedColor;
        } else {
            texColorDiffuse = vec4(1.0,1.0,1.0,1.0);
            texColorSpecular = vec4(1.0,1.0,1.0,1.0);
        }
    }

    
    

    highp vec3 texColorDiffuseVec3 = vec3(texColorDiffuse);
    highp vec3 texColorSpecularVec3 = vec3(texColorSpecular);

    highp vec3 resultColor = calcPointLight(uLight, texColorDiffuseVec3, texColorSpecularVec3);
    if (uIsDirLighting) {
        resultColor += calcDirLight(uDirLight, texColorDiffuseVec3, texColorSpecularVec3);
    }
    if (uIsFlashlight) {
        resultColor += calcSpotLight(uFlashlight, texColorDiffuseVec3, texColorSpecularVec3);
    }


    fragColor = vec4(resultColor, texColorDiffuse.a);
}