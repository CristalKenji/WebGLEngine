#version 300 es
precision mediump float;

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

float fmb(in vec3 p, in int octaves )
{
    //TODO als Parameter an shader übergeben
	vec3 motionVector = vec3(0.9, 0.0, 0.9);

	float amplitude = 0.5;
	float gain = 2.0;

	vec3 q = p - motionVector * iTime;

	float value = 0.0;

	for(int i=0; i < octaves; i++)
	{
		 value +=  amplitude * noise( q );
		 amplitude *= 0.5;
		 q *= gain;
	}
	return clamp( 1.5 - p.y - 2.0 + 1.75 * value, 0.0, 1.0 );
}

vec4 raymarch( in vec3 ro, in vec3 rd, in vec3 bgcol, in ivec2 px )
{
    //TODO als Parameter an shader übergeben
	int rayMarchSteps = 30;
    int numberOfCloudLayer = 5;
    int octaves = 5;

	vec4 sum = vec4(0.0);
	float t = 0.0;

    for(int y = 0; y < numberOfCloudLayer; y++)
    {
        for(int i = 0; i < rayMarchSteps; i++)
        {
        	vec3  pos = ro + t*rd;

        	if( sum.a > 0.99 ) break;

        	float den = fmb( pos, octaves );

        	if( den > 0.01 )
        	{
        		vec4 col = vec4( mix( vec3(1.0, 0.95, 0.8), vec3(0.25, 0.3, 0.35), den ), den );
        		// blending
        		col.a *= 0.4;
        		col.rgb *= col.a;
        		sum += col*(1.0-sum.a);
        	}
        	t += max(0.1,0.03*t);
        }
        octaves--;
    }
    return clamp( sum, 0.0, 1.0 );
}

vec4 render( in vec3 ro, in vec3 rd, in ivec2 px )
{
    // background color
	vec3 col = vec3(0.1, 0.6, 0.85);

    // clouds
    vec4 res = raymarch( ro, rd, col, px );
    col = col*(1.0-res.w) + res.xyz;
    return vec4( col, 1.0 );
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

void main( void )
{
     float x = gl_FragCoord.x/iResolution.x; // 0.0 < x < 1.0
     float y = gl_FragCoord.y/iResolution.y;

     //vec3 ro = vec3(1.2, 0.1, 0.0);
     //vec3 rd = normalize(vec3(x , y - 0.13, -0.4));

     vec3 ro = vec3(3.5, 1.1, 0.9);
     vec3 ta = vec3( -0.0, -0.5, -0.5 );

     // camera-to-world transformation
     mat3 ca = setCamera( ro, ta, 0.0 );

     // ray direction
     vec3 rd = ca * normalize( vec3(x, y, 2.0) );

     fragColor = render( ro, rd, ivec2(gl_FragCoord-0.5) );
     //fragColor = render( ro, rd, ivec2(x-0.5, y-0.5) );
}
