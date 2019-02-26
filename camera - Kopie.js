
var n = vec3.create();
var u = vec3.create();

class Camera {
    get viewMatrix() {
        return this._viewMatrix;
    }


    //region Variables
  /*  fovy;
    aspect;
    near;
    far;*/

   /* _eye;
    _center;
    _up;*/
/*
    viewMatrix;
    projMatrix;*/
    //endregion
    //region Getter and Setter


    //endregion


    constructor(fovy, aspect, near, far) {

        //this.transform = new Float32Array(16);
        this._viewMatrix = new Float32Array(16);
        this.projMatrix = new Float32Array(16);

        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this._eye = [0, 0, 8];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];

        this.calcViewMatrix = function() {
            mat4.lookAt(this._viewMatrix, this._eye, this.center, this.up);
        };

        this.calcViewMatrix();
        //calcProjectionMatrix();

        this.truck = function(distance) {
            vec3.subtract(n, this._eye, this.center);
            vec3.normalize(n, n);

            vec3.cross(u, this.up, n);
            vec3.normalize(u, u);

            vec3.scale(u, u, distance);


            vec3.add(this._eye, this._eye, u);
            vec3.add(this.center, this.center, u);

            this.calcViewMatrix();
        };

    }



  /*  function calcViewMatrix() {
        mat4.lookAt(this._viewMatrix, this._eye, this.center, this.up);
    }*/

}

/*function calcViewMatrix() {
    mat4.lookAt(this._viewMatrix, this._eye, this.center, this.up);
}*/

function calcProjectionMatrix() {
    mat4.perspective(this.projMatrix, glMatrix.toRadian(this.fovy), this.aspect, this.near, this.far);
}

