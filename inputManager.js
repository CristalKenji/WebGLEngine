console.log('Input Manager');

var leftMBtnPressed = false;
var middleMBtnPressed = false;
var rightMBtnPressed = false;


PressedKeys = {
    Forward: false,
    Back: false,
    Left: false,
    Right: false,
    Up: false,
    Down: false,

    RotLeft: false,
    RotRight: false,
};

var mouseEventListener = true;

var camera = null;


var mousePositionX;
var mousePositionY;



var processMouseEventHandler = function(event) {
    //console.log("processMouseEventHandler");

    //console.log(event.buttons);
    //if(event.type == "mouseup" || event.type == "mouseup")
        /*
        switch (event.buttons) {
            case 1:
                leftMBtnPressed =! leftMBtnPressed;
                console.log('Left BTN pressed: ' + leftMBtnPressed);
                break;
            case 4:
                middleMBtnPressed =! middleMBtnPressed;
                console.log('Middle BTN pressed: ' + middleMBtnPressed);
                break;
            case 2:
                rightMBtnPressed =! rightMBtnPressed;
                console.log('Right BTN pressed: ' + rightMBtnPressed);
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
*/


     //getRelativeMousePosition
    function getRelativeMousePosition(event) {
        target = event.target;
        var rect = target.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    }

    var pos = getRelativeMousePosition(event);

    mousePositionX = pos.x / document.getElementById("canvas").clientWidth; // *  2 - 1;
    mousePositionY = pos.y / document.getElementById("canvas").clientHeight; //* -2 + 1;

    //console.log(mousePositionX);
};

var processKeyboardEventHandler = function(event) {
        //console.log("processKeyboardEventHandler");

    if(!camera) {
        console.log("Keine Cam im inputmanager");
        return;
    }

        switch (event.key) {
            case "w":
                //console.log('W');
                camera.moveForward(0.1);
                break;
            case "s":
                //console.log('S');
                camera.moveForward(-0.1);
                break;
            case "a":
                console.log('A');
                camera.moveRight(-0.1);
                break;
            case "d":
                //console.log('D');
                camera.moveRight(0.1);
                break;
            case "ArrowUp":
                console.log('ArrowUp');
                camera.moveUp(0.1);
                break;
            case "ArrowDown":
                console.log('ArrowDown');
                camera.moveUp(-0.1);
                break;
            case "ArrowLeft":
                console.log('ArrowLeft');
                camera.rotateRight(-0.0872665);
                break;
            case "ArrowRight":
                console.log('ArrowRight');
                camera.rotateRight(0.0872665);
                break;
            case "f":
                console.log('F');
                break;
            case "Escape":

                mouseEventListener = !mouseEventListener;
                console.log('Escape' + mouseEventListener);


                if(mouseEventListener)
                {
                    activateMouseEvents();
                } else {
                    deactivateMouseEvents();
                }

                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
    };

function activateMouseEvents()
{
    console.log('activateMouseEvents');
    document.getElementById("canvas").addEventListener('mousedown', processMouseEventHandler);
    document.getElementById("canvas").addEventListener('mouseup', processMouseEventHandler);
    document.getElementById("canvas").addEventListener("mousemove", processMouseEventHandler);

    //mouseEventListener = true;
}

function deactivateMouseEvents()
{
    console.log('deactivateMouseEvents');
    document.getElementById("canvas").removeEventListener("mousedown", processMouseEventHandler);
    document.getElementById("canvas").removeEventListener("mouseup", processMouseEventHandler);
}

function activateKeyboardEvents()
{
    console.log('activateKeyboardEvents');
    document.addEventListener("keydown", processKeyboardEventHandler);

}

function setCamera(mainCamera) {
    //console.log("Camera: " + mainCamera);
    camera = mainCamera;
}

activateMouseEvents();
activateKeyboardEvents();


