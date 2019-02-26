function loadResources() // TODO use Promises instead of callbacks
{
    loadTextResource('./resource/shader/vertexShader.glsl', function(error, vertexShaderText)
    {
        if(!error)
        {
            console.log("Succsess! fragmentShaderText loaded");
            loadTextResource('./resource/shader/fragmentShader.glsl', function(error, fragmentShaderText)
            {
                if(!error)
                {
                    console.log("Succsess! vertexShaderText loaded");
                    //console.log("For init:" + vertexShaderText, fragmentShaderText);

                    loadJSONResource('./resource/model/Susan.json', function(error, susanModel)
                    {
                        if(!error)
                        {
                            //console.log(susanModel);
                            initializeWebGL(vertexShaderText, fragmentShaderText, susanModel);
                        }
                        else
                        {
                            console.error(error);
                        }
                    });
                }
                else
                {
                    console.error(error);
                }
            });
        }
        else
        {
            console.error(error);
        }
    });
}

function loadTextResource(url, callback) // TODO Promisfy
{
    var request = new XMLHttpRequest();
    request.onload = function () {
        if(request.status === 200)
        {
            //console.log(request.response);
            callback(null, request.responseText);
        }
        else
        {
            callback('Error loading resource: ' + url + ' Http Status: ' + request.status);
        }
    };
    request.open('GET', url, true);
    request.send();
}

function loadJSONResource(url, callback)
{
    loadTextResource(url, function (error, result) {
        if(!error)
        {
            try {
              callback(null, JSON.parse(result));
            }
            catch (e) {
                callback(e);
            }
        }
        else
        {
            callback(error);
        }
    });
}