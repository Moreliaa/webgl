struct Light {
    highp vec3 ambientColor;
    highp vec3 diffuseColor;
    highp vec3 specularColor;
};

uniform Light uLight;

void main() {
    gl_FragColor = vec4(uLight.ambientColor + uLight.diffuseColor, 1.0);
}