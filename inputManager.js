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

var processMouseEventHandler = function(event) {
    //console.log("processMouseEventHandler");
    switch (event.button) {
        case 0:
            leftMBtnPressed =! leftMBtnPressed;
            console.log('Left BTN pressed: ' + leftMBtnPressed);
            break;
        case 1:
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


