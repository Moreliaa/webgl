varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(0.7, 1.0, 0.5, 1.0);
}