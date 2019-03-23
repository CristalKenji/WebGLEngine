#version 300 es
in vec3 coordinates;

out vec3 iResolution;
out float iTime;
    void main(void)
    {
      gl_Position = vec4(coordinates, 1.0);
    }