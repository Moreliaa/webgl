attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPerspectiveMatrix;

uniform bool uIsPhongShading;

uniform highp vec3 uAmbientColor;
uniform highp vec3 uDiffuseColor;
uniform highp float uDiffuseStrength;
uniform highp vec3 uSpecularColor;
uniform highp float uShininess;
uniform highp vec3 uLightPosition;
uniform highp vec3 uCameraPosition;

varying highp vec3 vPosition;
varying highp vec3 vNormal;

varying highp vec4 vColor;
varying highp vec2 vTextureCoord;

varying highp vec3 vLightColorGouraud;

void main() {
    gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
    vTextureCoord = aTextureCoord;
    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = uNormalMatrix * aNormal;

    if (!uIsPhongShading) {
        highp vec3 norm = normalize(vNormal);
        highp vec3 lightDirection = normalize(uLightPosition - vPosition);
        highp float diffFrag = max(dot(lightDirection, norm), 0.0);

        highp vec3 reflectedLightDirection = reflect(-lightDirection, norm);
        highp vec3 viewDirection = normalize(uCameraPosition - vPosition);

        highp float specFrag = 0.0;
        if (diffFrag > 0.0) {
            specFrag = pow(max(dot(reflectedLightDirection, viewDirection), 0.0), uShininess);
        }
        highp vec3 lightColor = uAmbientColor + uDiffuseStrength * diffFrag * uDiffuseColor  + specFrag * uSpecularColor;
        vLightColorGouraud = lightColor;
    }
}