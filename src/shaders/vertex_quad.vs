# version 300 es

in highp vec2 aPosition;
in highp vec2 aTextureCoord; 

out highp vec2 vTextureCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}