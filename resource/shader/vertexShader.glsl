#version 300 es
precision mediump float;

in vec3 coordinates;
in vec2 a_texcoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

out vec2 fragCoord;

    void main(void)
    {
        //fragCoord = a_texcoord;
        fragCoord = coordinates.xy;
      gl_Position = vec4(coordinates, 1.0);
    }