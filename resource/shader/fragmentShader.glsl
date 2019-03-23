#version 300 es
precision mediump float;


in vec2 fragCoord;

uniform vec3 iResolution;
uniform float iTime;
out vec4 fragColor;


float iqhash( float n )
{
    return fract(sin(n)*43758.5453);
}

float noise( vec3 x )
{
    // The noise function returns a value in the range -1.0f -> 1.0f
    vec3 p = floor(x);
    vec3 f = fract(x);

    f       = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix( iqhash(n+0.0  ), iqhash(n+1.0  ),f.x),
                   mix( iqhash(n+57.0 ), iqhash(n+58.0 ),f.x),f.y),
               mix(mix( iqhash(n+113.0), iqhash(n+114.0),f.x),
                   mix( iqhash(n+170.0), iqhash(n+171.0),f.x),f.y),f.z);
}

const int octave_5 = 5;
const int octave_4 = 4;
const int octave_3 = 3;
const int octave_2 = 2;

float fmb(in vec3 p, in int octaves )
{
	vec3 texturBewegungsVektor = vec3(0.0,0.1,1.0); // TODO als Übergabeparameter
	vec3 q = p - vec3(0.0,0.1,1.0) *iTime;

	float value = 0.0;
	float amplitude = 0.5;

	for(int i=0; i < octaves; i++)
	{
		 value +=  amplitude * noise( q );
		 amplitude *= 0.5;
		 q *= 2.0;
	}
	return clamp( 1.5 - p.y - 2.0 + 1.75 * value, 0.0, 1.0 );
	//return value;
}

float map5( in vec3 p )
{
	return fmb(p, 5);
}

float map4( in vec3 p )
{
    return fmb(p, 4);
}
float map3( in vec3 p )
{
    return fmb(p, 3);
}

float map2( in vec3 p )
{
    return fmb(p, 2);
}

vec3 sundir = normalize( vec3(-1.0,0.0,-1.0) );

vec4 integrate( in vec4 sum, in float dif, in float den, in vec3 bgcol, in float t )
{
    vec4 col = vec4( mix( vec3(1.0,0.95,0.8), vec3(0.25,0.3,0.35), den ), den );
    // front to back blending
    col.a *= 0.4;
    col.rgb *= col.a;
    return sum + col*(1.0-sum.a);
}

#define MARCH(STEPS,MAPLOD) for(int i=0; i<STEPS; i++) { vec3  pos = ro + t*rd; if( pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99 ) break; float den = MAPLOD( pos ); if( den>0.01 ) { float dif =  clamp((den - MAPLOD(pos+0.3*sundir))/0.6, 0.0, 1.0 ); sum = integrate( sum, dif, den, bgcol, t ); } t += max(0.05,0.02*t); }

const int mySteps = 30;
vec4 march(in vec3 ro, in vec3 rd, in vec3 bgcol, in float t, in int octaves, in vec4 sum)
{
	for(int i=0; i< mySteps; i++)
	{
		vec3  pos = ro + t * rd;
		if( pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99 ) break;

		float den = fmb( pos, octaves );
		if( den>0.01 )
		{
			float dif =  clamp((den - fmb(pos+0.3*sundir, octaves))/0.6, 0.0, 1.0 );
			sum = integrate( sum, dif, den, bgcol, t );
		}
		t += max(0.05,0.02*t);
	}
	return sum;
}

vec4 raymarch( in vec3 ro, in vec3 rd, in vec3 bgcol, in ivec2 px )
{
	vec4 sum = vec4(0.0);

	float t = 0.0;

    MARCH(30,map5);
    MARCH(30,map4);
    MARCH(30,map3);
    MARCH(30,map2);

    return clamp( sum, 0.0, 1.0 );
}

vec4 render( in vec3 ro, in vec3 rd, in ivec2 px )
{
	vec3 col = vec3(1.0, 0.0, 0.0);
    // clouds
    vec4 res = raymarch( ro, rd, col, px );
    col = col*(1.0-res.w) + res.xyz;
    return vec4( col, 1.0 );
}


void main( void )
{
     //vec2 p = (iResolution.xy + 2.0*gl_FragCoord.xy)/ iResolution.y;

     float x = gl_FragCoord.x/iResolution.x; // 0.0 < x < 1.0
     float y = gl_FragCoord.y/iResolution.y; //

     vec3 ro = vec3(1.2, 0.1, 0.0);
     vec3 rd = normalize(vec3(x , y - 0.13, -0.4));

     fragColor = render( ro, rd, ivec2(gl_FragCoord-0.5) );


    /*
     fragColor = vec4(0.0,1.0,0.0,1.0); // green = background

     if( x > 0.5 && y > 0.5) {fragColor = vec4(1.0,0.0,0.0,1.0);} // red = upper right
     if( x < 0.5 && y < 0.5) {fragColor = vec4(0.0,0.0,1.0,1.0);} // blue = lower left
*/



}
