function initializeWebGL (vertexShaderText, fragmentShaderText) {

    //region Setup WebGL
    var canvas = document.getElementById('canvas');
	var gl = canvas.getContext('webgl2');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	var vertexShader = createVertexShader(gl, vertexShaderText);
	var fragmentShader = createFragmentShader(gl, fragmentShaderText);
	var program = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    /*======== Defining and storing the geometry ===========*/
    var plane_vertices = [
        -1.0, -1.0,  0.0,
        1.0, -1.0,   0.0,
        1.0,  1.0,   0.0,
        -1.0,  1.0,  0.0
    ];
    plane_indices = [0,  1,  2, 0,  2,  3];

    /*======== Creating Buffers ===========*/
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane_vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(plane_indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

   /* var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0]), gl.STATIC_DRAW);*/
    /*======= Associating shaders to buffer objects =======*/

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var positionAttribLocation = gl.getAttribLocation(program, 'coordinates');
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /*gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, true, 0,0);
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);*/

    var resolutionLocation = gl.getUniformLocation(program, "iResolution");
    var deltaTimeLocation = gl.getUniformLocation(program, "iTime");


    var mousePositionLocation = gl.getUniformLocation(program, "mousePosition");
    var radiansLocation = gl.getUniformLocation(program, "radians");
    //region Matrix Stuff

    var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
    var identityMatrix = new Float32Array(16);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

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
	
    //var lightPosition = vec3.fromValues(0, 0, 5);

	mat4.identity(worldMatrix);
	mainCamera.getViewMatrix(viewMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(fovy), aspect, near, far);
    mat4.identity(identityMatrix);


    gl.useProgram(program);
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

	var cameraEyeLocation       = gl.getUniformLocation(program, "cameraEye");
    var cameraCenterLocation    = gl.getUniformLocation(program, "cameraCenter");
    var cameraUpLocation        = gl.getUniformLocation(program, "cameraUp");

    gl.uniform3f(cameraEyeLocation, eye.x, eye.y, eye.z);
    gl.uniform3f(cameraCenterLocation, center.x, center.y, center.z);
    gl.uniform3f(cameraUpLocation, up.x, up.y, up.z);
    //endregion

    /*======== Main render loop ===========*/
	var previousFrame = performance.now();
	var deltaTime = 0;

	var degree = 0;
	var radians = 0;

    var loop = function (currentFrameTime) {

        deltaTime = currentFrameTime - previousFrame;

		_Update(deltaTime);

		//console.log("currentFrameTime:" + currentFrameTime/ 1000);

        previousFrame = currentFrameTime;
        gl.uniform1f(deltaTimeLocation, currentFrameTime * 0.001);
		_Render();

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

    var _Update = function(deltaTime) {

        //mainCamera.getViewMatrix(viewMatrix);

        //gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);

        gl.uniform2f(mousePositionLocation, mousePositionX, mousePositionY);

        //degree = (degree < 360)? degree += 1 : degree = 0;

        //degree = mousePositionX * 360;
        degree = mousePositionX * 2 * Math.PI;

        //gl.uniform1f(radiansLocation, degree * Math.PI / 180);
        gl.uniform1f(radiansLocation, degree);

        //console.log(degree);

    };

    var _Render = function() {

        //gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clearColor(0.3, 0.15, 0.5, 1.0);

    	// Clear back buffer
        //gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 0.0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.drawElements(gl.TRIANGLES, plane_indices.length, gl.UNSIGNED_SHORT, 0);

	};

}



