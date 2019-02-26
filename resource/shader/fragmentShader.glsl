precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;
varying vec3 vPosition;

uniform vec3 ambientLightIntensity;
uniform vec3 sunlightIntensity;
uniform vec3 sunlightDirection;
uniform sampler2D sampler;

void main()
{

    vec3 diffuseColor = vec3 (1.0, 1.0, 1.0);
    vec3 specularColor = vec3 (0.3, 0.3, 0.3);
    //vec3 lightDirection = vec3 (-0.57735, -0.57735, -0.57735);
    vec3 lightDirection = vec3 (0, 0, -8);

   vec3 light = normalize(-lightDirection);
   vec3 view = normalize(-vPosition);
   vec3 normal = normalize(fragNormal);

   vec3 halfVec = normalize(light + view);
   vec3 ambient = vec3(0.2);
   vec3 lightColor = vec3(1.0, 1.0, 0.8);

   float NdotL = max(dot(normal, light), 0.0);
   vec3 diffuse = diffuseColor * NdotL * lightColor;

   float powNdotH = pow(max(dot(normal, halfVec), 0.0), 128.0);
   vec3 specular = specularColor * powNdotH * lightColor;

   vec3 color = ambient + diffuse + specular;
   color *= (texture2D(sampler, fragTexCoord)).xyz;
   gl_FragColor = vec4(color, 1.0);

    //TODO texel color mit ambient verrechnen
   //vec4 texel = texture2D(sampler, fragTexCoord);
   //vec3 lightIntensity = ambientLightIntensity + sunlightIntensity * max(dot(fragNormal, sunlightDirection), 0.0);
   //gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
    //gl_FragColor = vec4(fragNormal, 1.0);
	//gl_FragColor = texture2D(sampler, fragTexCoord);
}