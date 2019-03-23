#version 300 es
precision mediump float;

in vec3 coordinates;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

    void main(void)
    {
      gl_Position = vec4(coordinates, 1.0);
    }