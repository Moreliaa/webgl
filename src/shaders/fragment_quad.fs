# version 300 es

in highp vec2 vTextureCoord;
uniform sampler2D uSampler;

out highp vec4 fragColor;

highp float near = 0.1; 
highp float far  = 100.0; 
  
highp float LinearizeDepth(highp float depth) 
{
    highp float z = depth * 2.0 - 1.0; // back to NDC 
    return (2.0 * near * far) / (far + near - z * (far - near));	
}

void main() {
    highp float depthValue = LinearizeDepth(texture(uSampler, vTextureCoord).r);
    //fragColor = vec4(vec3(depthValue), 1.0);
    fragColor = texture(uSampler, vTextureCoord);
}