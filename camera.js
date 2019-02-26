
var Camera = function (eye, center, up) {

    this.forward = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();

    this.eye = eye;

    vec3.subtract(this.forward, center, this.eye);
    vec3.cross(this.right, this.forward, up);
    vec3.cross(this.up, this.right, this.forward);

    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.up, this.up);
    vec3.normalize(this.right, this.right);


};

Camera.prototype.getViewMatrix = function(out) {
    var lookAt = vec3.create();
    vec3.add(lookAt, this.eye, this.forward);
    mat4.lookAt(out, this.eye, lookAt, this.up);
    return out;
};

Camera.prototype._updateOrientation = function() {

    vec3.cross(this.right, this.forward, this.up);
    vec3.cross(this.up, this.right, this.forward);

    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.up, this.up);
    vec3.normalize(this.right, this.right);
};

Camera.prototype.moveForward = function(dist) {
    vec3.scaleAndAdd(this.eye, this.eye, this.forward, dist);
};

Camera.prototype.moveUp = function(dist) {
    vec3.scaleAndAdd(this.eye, this.eye, this.up, dist);
};

Camera.prototype.moveRight = function(dist) {
    vec3.scaleAndAdd(this.eye, this.eye, this.right, dist);
};

/*Camera.prototype.rotateUp = function(deg) {

};*/

Camera.prototype.rotateRight = function(rad) {
    var rightMatrix = mat4.create();
    mat4.rotate(rightMatrix, rightMatrix, rad, vec3.fromValues(0, 1, 0));
    vec3.transformMat4(this.forward, this.forward, rightMatrix);
    this._updateOrientation();
};
