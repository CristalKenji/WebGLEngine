function initializeWebGL (vertexShaderText, fragmentShaderText, model) {

    //region Setup WebGL
    var canvas = document.getElementById('canvas');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}
    //region Create Shaders

	var vertexShader = createVertexShader(gl, vertexShaderText);
	var fragmentShader = createFragmentShader(gl, fragmentShaderText);
	var program = createShaderProgram(gl, vertexShader, fragmentShader);

    var genericVertexShaderText =
        `precision mediump float;
        attribute vec3 vertPosition;
        attribute vec2 vertTexCoord;
        
        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        
        varying vec2 fragTexCoord;
        
        void main() {
            fragTexCoord = vertTexCoord;
            gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
        }`;
    var genericFragmentShaderText =
        `precision mediump float;
        varying vec2 fragTexCoord;
        
        uniform sampler2D sampler; 
         void main() {
            //gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
            gl_FragColor = texture2D(sampler, fragTexCoord);
         }`;

	var genericVertexShader = createVertexShader(gl, genericVertexShaderText);
    var genericFragmentShader = createFragmentShader(gl, genericFragmentShaderText);
    var genericProgram = createShaderProgram(gl, genericVertexShader, genericFragmentShader);

    var shadowVertexShaderText =
		`precision mediump float;
		
		uniform mat4 mProj;
		uniform mat4 mView;
		uniform mat4 mWorld;
		
		attribute vec3 vPos;
		attribute vec3 vNorm;
		
		varying vec3 fPos;
		varying vec3 fNorm;
		
		void main()
		{
			fPos = (mWorld * vec4(vPos, 1.0)).xyz;
			fNorm = (mWorld * vec4(vNorm, 0.0)).xyz;
			
			//fPos = (mProj * mView * mWorld * vec4(vPos, 1.0)).xyz;			
			//fNorm = ( mProj * mView * mWorld * vec4(vNorm, 0.0)).xyz;
		
			//gl_Position = mProj * mView * vec4(fPos, 1.0);
			 gl_Position = mProj * mView * mWorld * vec4(vPos, 1.0);
		}`;

    /*var shadowVertexShaderText =
        `precision mediump float;
		
		uniform mat4 mProj;
		uniform mat4 mView;
		uniform mat4 mWorld;
		
		attribute vec3 vPos;
		attribute vec3 vNorm;
		
		varying vec4 fPos;
		varying vec3 fNorm;
		
		const float eps = 0.05;
		void main()
		{			
			fPos = mProj * mView * mWorld * vec4(vPos + eps * vNorm, 1.0);
			
			fNorm = (mWorld * vec4(vNorm, 0.0)).xyz;
		
			//gl_Position = mProj * mView * vec4(fPos, 1.0);
			gl_Position = mProj * mView * mWorld * vec4(vPos, 1.0);
		}`;*/

    // samplerCubeMap
	var shadowFragmentShaderText =
		`precision mediump float;

		uniform vec3 pointLightPosition;
		uniform vec4 meshColor;
		
		uniform sampler2D lightShadowMap;
		uniform vec2 shadowClipNearFar;
		
		varying vec3 fPos;
		varying vec3 fNorm;
		
		void main()
		{
			vec3 toLightNormal = normalize(pointLightPosition - fPos);
		
			float fromLightToFrag =
				(length(fPos - pointLightPosition) - shadowClipNearFar.x)
				/
				(shadowClipNearFar.y - shadowClipNearFar.x);
				
			float shadowMapValue = texture2D(lightShadowMap, -(toLightNormal.xy + vec2(-0.4, -0.4))).r;
		
			float lightIntensity = 0.6;
			if ((shadowMapValue + 0.1) >= fromLightToFrag) {
				lightIntensity += 0.4 * max(dot(fNorm, toLightNormal), 0.0);
			}
		
			gl_FragColor = vec4(meshColor.rgb * lightIntensity, meshColor.a);
			//gl_FragColor = vec4(vec3(shadowMapValue) , 1.0);
		}`;
   /* var shadowFragmentShaderText =
        `precision mediump float;

		uniform vec3 pointLightPosition;
		uniform vec4 meshColor;
		
		uniform sampler2D lightShadowMap;
		uniform vec2 shadowClipNearFar;
		
		varying vec4 fPos;
		varying vec3 fNorm;
		
		void main()
		{
			vec3 texturePosition = (fPos.xyz / fPos.w + 1.0) / 2.0;
			vec3 shadowColour = texture2D(lightShadowMap, texturePosition.xy).xyz;
			
			float lightIntensity = 0.2;
			if(texturePosition.z > shadowColour.z) {
			    lightIntensity = 0.9;
			}		
			//gl_FragColor = vec4(meshColor.rgb * lightIntensity, meshColor.a);
			gl_FragColor = vec4(vec3(shadowColour) , 1.0);
		}`;*/

	var shadowVertexShader = createVertexShader(gl, shadowVertexShaderText);
	var shadowFragmentShader = createFragmentShader(gl, shadowFragmentShaderText);
	this.ShadowProgram = createShaderProgram(gl, shadowVertexShader, shadowFragmentShader);

	this.ShadowProgram.uniforms = {
		mProj: 	gl.getUniformLocation(this.ShadowProgram, 'mProj'),
		mView: 	gl.getUniformLocation(this.ShadowProgram, 'mView'),
		mWorld: gl.getUniformLocation(this.ShadowProgram, 'mWorld'),

		pointLightPosition: gl.getUniformLocation(this.ShadowProgram, 'pointLightPosition'),
		meshColor: 			gl.getUniformLocation(this.ShadowProgram, 'meshColor'),
		lightShadowMap: 	gl.getUniformLocation(this.ShadowProgram, 'lightShadowMap'),
		shadowClipNearFar: 	gl.getUniformLocation(this.ShadowProgram, 'shadowClipNearFar'),
	};

	this.ShadowProgram.attribs = {
		vPos: 	gl.getAttribLocation(this.ShadowProgram, 'vPos'),
		vNorm: 	gl.getAttribLocation(this.ShadowProgram, 'vNorm'),
	};

    var shadowMapVertexShaderText =
        `precision mediump float;
        uniform mat4 mProj;
        uniform mat4 mView;
        uniform mat4 mWorld;
        
        attribute vec3 vPos;
        
        varying vec3 fPos;
        void main()
        {
            fPos = (mWorld * vec4(vPos, 1.0)).xyz;
            gl_Position = mProj * mView * vec4(fPos, 1.0);
        }`;

    var shadowMapFragmentShaderText =
        `precision mediump float;
        uniform vec3 pointLightPosition;
        uniform vec2 shadowClipNearFar;
        varying vec3 fPos;        
        void main()
        {
            vec3 fromLightToFrag = (fPos - pointLightPosition);        
            float lightFragDist = (length(fromLightToFrag) - shadowClipNearFar.x) / (shadowClipNearFar.y - shadowClipNearFar.x);        
            gl_FragColor = vec4(lightFragDist, lightFragDist, lightFragDist, 1.0);
        }`;

    var shadowMapVertexShader = createVertexShader(gl, shadowMapVertexShaderText);
    var shadowMapFragmentShader = createFragmentShader(gl, shadowMapFragmentShaderText);
    var shadowMapProgram = createShaderProgram(gl, shadowMapVertexShader, shadowMapFragmentShader);

    //var shadowMapTextureSize = 1024;
    var shadowMapTextureSize = 2048;
    //endregion

    //region Create Buffer

    var susanVertices = model.meshes[0].vertices;
	var susanIndices = [].concat.apply([], model.meshes[0].faces);
    var susanTexCoords = model.meshes[0].texturecoords[0];
    var susanNormals = model.meshes[0].normals;

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
	gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, true, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(normalAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // ShadowMapBuffer
    var shadowMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowMapTexture);

	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowMapTextureSize, shadowMapTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowMapTextureSize, shadowMapTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    //gl.bindTexture(gl.TEXTURE_2D, null);


    var shadowMapFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowMapTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var shadowMapRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowMapTextureSize, shadowMapTextureSize);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.bindTexture(gl.TEXTURE_2D, null);
    // Plane
    var plane_vertices = [
        -3.0, -3.0,  -3.0,
        3.0, -3.0,  -3.0,
        3.0,  3.0,  -3.0,
        -3.0,  3.0,  -3.0
    ];
    plane_indices = [0,  1,  2, 0,  2,  3];

    var plane_normals = [
        0.0, 0.0,  1.0,
        0.0, 0.0,  1.0,
        0.0, 0.0,  1.0,
        0.0, 0.0,  1.0
    ];

    var plane_vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plane_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane_vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var plane_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(plane_indices), gl.STATIC_DRAW);

    var plane_texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plane_texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

   /* var coord = gl.getAttribLocation(genericProgram, "vertPosition");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);*/

    gl.bindBuffer(gl.ARRAY_BUFFER, plane_vertexBuffer);
    var plane_positionAttribLocation = gl.getAttribLocation(genericProgram, 'vertPosition');
    gl.vertexAttribPointer(plane_positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(plane_positionAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, plane_texCoordBuffer);
    var plane_texCoordAttribLocation = gl.getAttribLocation(genericProgram, 'vertTexCoord');
    gl.vertexAttribPointer(plane_texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(plane_texCoordAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //endregion

    //region Create Texture
    const texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function() {
        handleLoadedTexture(texture);
    };
    texture.image.crossOrigin = '';
    texture.image.src = './resource/texture/SusanTexture.png';

    function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    const plane_texture = gl.createTexture();
    plane_texture.image = new Image();
    plane_texture.image.onload = function() {
        handleLoadedTexture(plane_texture);
    };
    plane_texture.image.crossOrigin = '';
    plane_texture.image.src = './resource/texture/test.png';

    function handleLoadedTexture(plane_texture) {
        gl.bindTexture(gl.TEXTURE_2D, plane_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plane_texture.image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
	//gl.useProgram(program);

    //endregion



    //region Matrix Stuff

    var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
    var identityMatrix = new Float32Array(16);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);



    var plane_worldMatrix =  new Float32Array(16);
    var plane_viewMatrix = new Float32Array(16);
    var plane_projectionMatrix =  new Float32Array(16);

    mat4.identity(plane_worldMatrix);
    mat4.identity(plane_viewMatrix);
    mat4.identity(plane_projectionMatrix);

    // Parameter
    var eye = [0, 0, 8]; 	// Position of the viewer
    var center = [0, 0, 0]; //Point the viewer is looking at
    var up = [0, 1, 0]; 	// vec3 pointing up

    var fovy = 45;
	var aspect = canvas.clientWidth / canvas.clientHeight;
	var near = 0.1;
	var far = 1000.0;


	var mainCamera = new Camera(eye, center, up);
	setCamera(mainCamera);
	
    var lightPosition = vec3.fromValues(0, 0, 5);
    //var lightPosition = vec3.fromValues(0, 0, 5);

    //var shadowMapCamera = new Camera(eye, center, up);
	var shadowMapCamera = new Camera(lightPosition, vec3.add(vec3.create(), lightPosition, vec3.fromValues(0, 0, -1)), vec3.fromValues(0, 1, 0));
    var shadowMapViewMatrix = mat4.create(); // shadowMapCamera.getViewMatrix;
    //var shadowMapClipNearFar = vec2.fromValues(3, 15);
    var shadowMapClipNearFar = vec2.fromValues(0.05, 15.0);
    var shadowMapProjectionMatrix = mat4.create();
    mat4.perspective(shadowMapProjectionMatrix, glMatrix.toRadian(45), 1.0, shadowMapClipNearFar[0], shadowMapClipNearFar[1]);

	mat4.identity(worldMatrix);
	//mat4.lookAt(viewMatrix, eye, center, up);
	mainCamera.getViewMatrix(viewMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(fovy), aspect, near, far);
    mat4.identity(identityMatrix);


    mainCamera.getViewMatrix(plane_viewMatrix);
    mat4.perspective(plane_projectionMatrix, glMatrix.toRadian(fovy), aspect, near, far);
   /* mat4.multiply(plane_wordlViewMatrix, worldMatrix, viewMatrix);
    mat4.multiply(plane_worldViewProjection, plane_wordlViewMatrix, projMatrix);
    console.log("PlaneMatrix: " + plane_worldViewProjection);*/


    gl.useProgram(program);
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

	gl.useProgram(genericProgram);
    var plane_matWorldUniformLocation = gl.getUniformLocation(genericProgram, 'mWorld');
    var plane_matViewUniformLocation = gl.getUniformLocation(genericProgram, 'mView');
    var plane_matProjUniformLocation = gl.getUniformLocation(genericProgram, 'mProj');

    gl.uniformMatrix4fv(plane_matWorldUniformLocation, false, plane_worldMatrix);
    gl.uniformMatrix4fv(plane_matViewUniformLocation, false, plane_viewMatrix);
    gl.uniformMatrix4fv(plane_matProjUniformLocation, false, plane_projectionMatrix);


    // ShadowMap
    gl.useProgram(shadowMapProgram);
    var shadowMap_matWorldUniformLocation = gl.getUniformLocation(shadowMapProgram, 'mWorld');
    var shadowMap_matViewUniformLocation = gl.getUniformLocation(shadowMapProgram, 'mView');
    var shadowMap_matProjUniformLocation = gl.getUniformLocation(shadowMapProgram, 'mProj');
    var shadowMap_pointLightPosition = gl.getUniformLocation(shadowMapProgram, 'pointLightPosition');
    var shadowMap_shadowClipNearFar = gl.getUniformLocation(shadowMapProgram, 'shadowClipNearFar');

    var shadowMap_vPos = gl.getAttribLocation(shadowMapProgram, 'vPos');

    //endregion

    //region Lighting
    gl.useProgram(program);
	var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
    var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sunlightIntensity');
	var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sunlightDirection');

	gl.uniform3f(ambientUniformLocation, 0.2, 0.2, 0.2);
    gl.uniform3f(sunlightIntUniformLocation, 0.5, 0.5, 0.5);
    gl.uniform3f(sunlightDirUniformLocation, 0.0, 0.0, 0.0);

    //endregion

	//
	// Main render loop
	//

	//var angle = 0;
	var previousFrame = performance.now();
	var deltaTime = 0;


    var loop = function (currentFrameTime) {
        deltaTime = currentFrameTime - previousFrame;
		_Update(deltaTime);
		previous = currentFrameTime;
		/*angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);*/

		_GenerateShadowMap();
		_Render();

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

    var _Update = function(deltaTime) {

        mainCamera.getViewMatrix(viewMatrix);
        mainCamera.getViewMatrix(plane_viewMatrix);

        mat4.rotateY(yRotationMatrix, identityMatrix, deltaTime / 1000 * 2 * Math.PI * 0.08);
        mat4.rotateX(xRotationMatrix, identityMatrix, deltaTime / 1000 * 2 * Math.PI * 0.08);
        mat4.mul(worldMatrix, yRotationMatrix, identityMatrix);
        //mat4.mul(worldMatrix, xRotationMatrix, identityMatrix);
    };

    var _GenerateShadowMap = function() {


        gl.useProgram(shadowMapProgram);

		gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFrameBuffer);
        //gl.bindTexture(gl.TEXTURE_2D, shadowMapTexture);
        //gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderBuffer);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.viewport(0, 0, shadowMapTextureSize, shadowMapTextureSize);

        gl.uniform2fv(shadowMap_shadowClipNearFar, shadowMapClipNearFar);
        gl.uniform3fv(shadowMap_pointLightPosition, lightPosition);
        gl.uniformMatrix4fv(shadowMap_matProjUniformLocation, false, shadowMapProjectionMatrix);
        gl.uniformMatrix4fv(shadowMap_matViewUniformLocation, false, shadowMapCamera.getViewMatrix(shadowMapViewMatrix));


		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowMapTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowMapRenderBuffer);

        gl.clearColor(0, 0 , 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        // Draw Monkey
        gl.uniformMatrix4fv(shadowMap_matWorldUniformLocation, false, worldMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(shadowMap_vPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shadowMap_vPos);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Draw Plane
        gl.uniformMatrix4fv(shadowMap_matWorldUniformLocation, false, plane_worldMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, plane_vertexBuffer);
        gl.vertexAttribPointer(shadowMap_vPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shadowMap_vPos);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane_indexBuffer);
        gl.drawElements(gl.TRIANGLES, plane_indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		//console.log(shadowMapTexture);

        // Unbind Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
	};

    let me = this;

    var _Render = function() {


		//gl.useProgram(program);
    	// Clear back buffer
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        //gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        // Draw Monkey
        gl.useProgram(program);

        gl.uniformMatrix4fv(matWorldUniformLocation, false,worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, false, camera.getViewMatrix(viewMatrix));
        gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(positionAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(texCoordAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, true, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(normalAttribLocation);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);



		gl.useProgram(me.ShadowProgram);
		gl.uniformMatrix4fv(me.ShadowProgram.uniforms.mProj, false, projMatrix);
		gl.uniformMatrix4fv(me.ShadowProgram.uniforms.mView, false, camera.getViewMatrix(viewMatrix));
		gl.uniformMatrix4fv(me.ShadowProgram.uniforms.mWorld, false, plane_worldMatrix);
		gl.uniform3fv(me.ShadowProgram.uniforms.pointLightPosition, lightPosition);
		gl.uniform2fv(me.ShadowProgram.uniforms.shadowClipNearFar, shadowMapClipNearFar);
		gl.uniform1i(me.ShadowProgram.uniforms.lightShadowMap, 0);
		gl.uniform4fv(me.ShadowProgram.uniforms.meshColor, vec4.fromValues(1,1,1,1));

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, shadowMapTexture);

        gl.bindBuffer(gl.ARRAY_BUFFER, plane_vertexBuffer);
        gl.vertexAttribPointer(me.ShadowProgram.attribs.vPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(me.ShadowProgram.attribs.vPos);


        var plane_normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, plane_normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane_normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(me.ShadowProgram.attribs.vNorm, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(me.ShadowProgram.attribs.vNorm);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane_indexBuffer);

        gl.drawElements(gl.TRIANGLES, plane_indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);




        // Draw Plane

        /*gl.useProgram(genericProgram);
        gl.uniformMatrix4fv(plane_matWorldUniformLocation, false, plane_worldMatrix);
        gl.uniformMatrix4fv(plane_matViewUniformLocation, false, plane_viewMatrix);
        gl.uniformMatrix4fv(plane_matProjUniformLocation, false, plane_projectionMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, plane_texCoordBuffer);
        gl.vertexAttribPointer(plane_texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(plane_texCoordAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, plane_vertexBuffer);
        gl.vertexAttribPointer(plane_positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(plane_positionAttribLocation);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane_indexBuffer);

        gl.bindTexture(gl.TEXTURE_2D, shadowMapTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, plane_indices.length, gl.UNSIGNED_SHORT, 0);*/
	};

}



