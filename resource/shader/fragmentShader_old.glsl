#version 300 es
precision mediump float;

in vec3 iResolution;
in float iTime;
out vec4 FragColor;
void main(void)
{

    float s = sin(0.01*iTime);
    FragColor = vec4(0, 0.4, 0.0, 1);
    //FragColor = vec4(color, 1);
}