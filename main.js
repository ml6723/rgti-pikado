// Global variable definitionvar canvas;
var canvas;
var score_canvas = document.getElementById("score");
var gl;
var dart;
var target;

// shading programs
var shaderProgram;

// Buffers
var dartVertexBuffer;
var dartTextureBuffer;
var dartNormalBuffer;
var dartIndexBuffer;


var targetVertexBuffer;
var targetTextureBuffer;
var targetNormalBuffer;
var targetIndexBuffer;

// Model-view and projection matrix and model-view matrix stack
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// Variable for storing textures
var dartTexture;
var targetTexture;

// Variable that stores  loading state of textures.
var numberOfTextures = 2;
var texturesLoaded = 0;

// Helper variable for animation
var lastTime = 0;


//tipke
var currentlyPressedKeys = {};

// target radius
var radius = 2.2;

//moc meta
var moc=50;
var MAXHEIGHT=200;
var MINHEIGHT=-100;


//koordinate puscice
var zpuscice=0;
var ypuscice=0;
var xpuscice=1.2;
//razdalje do tarce, nframeov
var a=50;
var dif2=a;
var dif=0;

//zacni/koncaj animacijo
var reset=false;
var pause=true;
/**metpuscice
mat4.translate(mvMatrix,[xpuscice,ypuscice,-zpuscice]);
**/

//koordinate tarce
var zTarget = 82;

// flag to print score
var print_score = false;

var total_score = 0;

//
// score sections points calculation
//
var sections_x = [];
var sections_y = [];

var angle = 9;

for(var i=0; i<20; i++) {
    sections_x[i] = radius * Math.cos(degToRad(angle));
    sections_y[i] = 0 + radius * Math.sin(degToRad(angle));

    angle += 18;
}

sections_x[20] = sections_x[0];
sections_y[20] = sections_y[0];

//
//

function collision_detection(zDart) {
    if(zDart >= zTarget)
        return true;
    else
        return false;
}


function calculate_score() {
    var ctx = score_canvas.getContext("2d");
    ctx.clearRect(0,0, score_canvas.width, score_canvas.height);


    var scores = [10 ,15 ,2 ,17 ,3 ,19 ,7 ,16 ,8 ,11 ,14 ,9 ,12 ,5 ,20 ,1 ,18 ,4 ,13, 6];

    var distance = Math.sqrt(Math.pow(xpuscice,2) + Math.pow(ypuscice+1.21999, 2));

    var result;

    if(distance < 0.04)
        result = 50;
    else if((distance >= 0.04) && (distance <= 0.12))
        result = 25;
    else {
        for (i = 0; i < 20; i++) {
            if (is_in_triangle(xpuscice, ypuscice + 1.21999, 0, 0, sections_x[i], sections_y[i], sections_x[i + 1], sections_y[i + 1])) {
                break;
            }
        }

        result = scores[i];

        if((distance >= 1.89) && (distance <= 1.99))
            result *= 2;
        else if((distance >= 1.13) && (distance <= 1.23))
            result *= 3;
    }

    var s = "Your score: ";
    var sc = String(result);
    var final_score = s.concat(sc);

    var t = "Total score: ";
    total_score += result;
    var total = t.concat(String(total_score));

    //test

    ctx.font="30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(final_score,10,50);
    ctx.fillText(total,10,100);
}

function is_in_triangle (px,py,ax,ay,bx,by,cx,cy) {
    var v0 = [cx-ax,cy-ay];
    var v1 = [bx-ax,by-ay];
    var v2 = [px-ax,py-ay];

    var dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
    var dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
    var dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
    var dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
    var dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);

    var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);

    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return ((u >= 0) && (v >= 0) && (u + v < 1));
}



//metpuscice
/*mat4.translate(mvMatrix,[xpuscice,ypuscice,-zpuscice]);

if(zpuscice<40){
    zpuscice+=0.2;
    if (dif<a){
        ypuscice+=(0.001*(a-dif));
    }else{
        ypuscice-=(0.1*(a-dif2));
        dif--;
    }
    dif++;
}*/




function handleKeys() {
  /*
    if (currentlyPressedKeys[33]) {
        // Page Up
        positionCubeZ -= 0.05;
    }
    if (currentlyPressedKeys[34]) {
        // Page Down
        positionCubeZ += 0.05;
    }
    */
    if(pause===true) {
        if (currentlyPressedKeys[37]) {
            // Left cursor key
            xpuscice -= 0.01;
        }
        if (currentlyPressedKeys[39]) {
            // Right cursor key
            xpuscice += 0.01;
        }
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            ypuscice -= 0.01;
        }
        if (currentlyPressedKeys[40]) {
            // Down cursor key
            ypuscice += 0.01;
        }
        if (currentlyPressedKeys[77]) {
            // M
            if (moc < MAXHEIGHT) {
                moc+=0.5;
            }
        }
        if (currentlyPressedKeys[78]) {
            // N
            if (moc > MINHEIGHT) {
                moc-=0.5;
            }
        }
    }
    if (currentlyPressedKeys[32]) {
        // Space Key
        //dartThrow;
        pause=false;
    }
    if (currentlyPressedKeys[13]) {
        // enter ---reset
        zpuscice=0;
        ypuscice=getRandomfloat(-0.4,0.1);
        xpuscice=getRandomfloat(-0.4,0.1);
        a=50;
        dif2=a;
        dif=0;
        moc=50;
        pause=true;
        reset=true;
        //initBuffers();
    }
}

function getRandomfloat(min, max) {
    return Math.random() * (max - min + 0.1) + min;
}


function handleKeyDown(event) {
    // storing the pressed state for individual key
    currentlyPressedKeys[event.keyCode] = true;

    // handling single keypress for switching filters
    if (String.fromCharCode(event.keyCode) == "F") {
        filter += 1;
        if (filter == 3) {
            filter = 0;
        }
    }
}

function handleKeyUp(event) {
    // reseting the pressed state for individual key
    currentlyPressedKeys[event.keyCode] = false;
}

function dartThrow() {
    //TODO
}

// Matrix utility functions
//
// mvPush   ... push current matrix on matrix stack
// mvPop    ... pop top matrix from stack
// degToRad ... convert degrees to radians
//
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

//
// initGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initGL(canvas) {
    var gl = null;
    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch(e) {}

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
    return gl;
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);

    // Didn't find an element with the specified ID; abort.
    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == 3) {
            shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;  // Unknown shader type
    }

    // Send the source to the shader object
    gl.shaderSource(shader, shaderSource);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}



//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    // start using shading program for rendering
    gl.useProgram(shaderProgram);

    // store location of aVertexPosition variable defined in shader
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

    // turn on vertex position attribute at specified position
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // store location of aTextureCoord variable defined in shader
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

    // turn on vertex texture coordinates attribute at specified position
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    // store location of uPMatrix variable defined in shader - projection matrix
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    // store location of uMVMatrix variable defined in shader - model-view matrix
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    // store location of uSampler variable defined in shader
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

//
// setMatrixUniforms
//
// Set the uniform values in shaders for model-view and projection matrix.
//


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//
// initTextures
//
// Initialize the textures we'll be using, then initiate a load of
// the texture images. The handleTextureLoaded() callback will finish
// the job; it gets called each time a texture finishes loading.
//
function initTextures() {
    dartTexture = gl.createTexture();
    dartTexture.image = new Image();
    dartTexture.image.onload = function() {
        handleTextureLoaded(dartTexture);
    };  // async loading
    dartTexture.image.src = "metallic-blue-glitter-texture.jpg";

    targetTexture = gl.createTexture();
    targetTexture.image = new Image();
    targetTexture.image.onload = function() {
        handleTextureLoaded(targetTexture);
    };  // async loading
    targetTexture.image.src = "target.jpg";
}

function handleTextureLoaded(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Third texture usus Linear interpolation approximation with nearest Mipmap selection
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    // when texture loading is finished we can draw scene.
    texturesLoaded += 1;
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we have
// two objecta -- a simple cube and pyramidß.
//
function initBuffers() {
    // DART

    var objStr = document.getElementById('dart.obj').innerHTML;

    dart = new OBJ.Mesh(objStr);

    OBJ.initMeshBuffers(gl, dart);

    // Create a buffer for the dart's vertices.
    dartVertexBuffer = dart.vertexBuffer;

    // Select the dartVertexBuffer as the one to apply vertex
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, dartVertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dart.vertices), gl.STATIC_DRAW);

    dartVertexBuffer.itemSize = dart.vertexBuffer.itemSize;
    dartVertexBuffer.numItems = dart.vertexBuffer.numItems;


    // Map the texture onto the dart's faces.
    dartTextureBuffer = dart.textureBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, dartTextureBuffer);


    // Pass the texture coordinates into WebGL
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dart.textures), gl.STATIC_DRAW);
    dartTextureBuffer.itemSize = dart.textureBuffer.itemSize;
    dartTextureBuffer.numItems = dart.textureBuffer.numItems;

    // Build the element array buffer; this specifies the indices
    // into the vertex array for each face's vertices.
    dartIndexBuffer = dart.indexBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dartIndexBuffer);

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dart.indices), gl.STATIC_DRAW);
    dartIndexBuffer.itemSize = dart.indexBuffer.itemSize;
    dartIndexBuffer.numItems = dart.indexBuffer.numItems;

    // TARGET

    var objStr_t = document.getElementById('target.obj').innerHTML;

    target = new OBJ.Mesh(objStr_t);

    OBJ.initMeshBuffers(gl, target);

    // Create a buffer for the dart's vertices.
    targetVertexBuffer = target.vertexBuffer;

    // Select the dartVertexBuffer as the one to apply vertex
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, targetVertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(target.vertices), gl.STATIC_DRAW);

    targetVertexBuffer.itemSize = target.vertexBuffer.itemSize;
    targetVertexBuffer.numItems = target.vertexBuffer.numItems;


    // Map the texture onto the target's faces.
    targetTextureBuffer = target.textureBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, targetTextureBuffer);


    // Pass the texture coordinates into WebGL
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(target.textures), gl.STATIC_DRAW);
    targetTextureBuffer.itemSize = target.textureBuffer.itemSize;
    targetTextureBuffer.numItems = target.textureBuffer.numItems;

    // Build the element array buffer; this specifies the indices
    // into the vertex array for each face's vertices.
    targetIndexBuffer = target.indexBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, targetIndexBuffer);

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(target.indices), gl.STATIC_DRAW);
    targetIndexBuffer.itemSize = target.indexBuffer.itemSize;
    targetIndexBuffer.numItems = target.indexBuffer.numItems;

}

//
// drawScene
//
// Draw the scene.
//

function drawScene() {
    // set the rendering environment to full canvas size
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Establish the perspective with which we want to view the
    // scene. Our field of view is 45 degrees, with a width/height
    // ratio and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    mat4.identity(mvMatrix);

    // Now move the drawing position a bit to where we want to start
    // drawing the cube.

    // store current location
    mvPushMatrix();

    // translate the dart
    mat4.translate(mvMatrix, [10.0, 0.0, -20]);

    // Rotate dart before we draw.
    mat4.rotate(mvMatrix, degToRad(180), [1, 0, 0]);
    mat4.rotate(mvMatrix, degToRad(0), [0, 1, 0]);
    mat4.rotate(mvMatrix, degToRad(0), [0, 1, 1]);


    //scale dart
    mat4.scale(mvMatrix, [3,3,3]);

    document.getElementById("mocMeta").innerHTML="Moc meta: "+moc;
    //mocdisplay=moc;



    //met
    if(pause===false) {
        mat4.translate(mvMatrix, [xpuscice, ypuscice, zpuscice]);
        if (zpuscice < 20) {
            if(zpuscice == 19.5)
                print_score = true;

            zpuscice += 0.5;
            if (dif < a) {
                ypuscice -= (0.001 * (moc - dif));
            } else {
                ypuscice += (0.001 * (a - dif2));
                dif2--;
            }
            dif++;
        }
    }else{
        mat4.translate(mvMatrix, [xpuscice, ypuscice,0.0]);
    }

    if(print_score == true) {
        calculate_score();
        print_score = false;
    }






    // Draw the cube by binding the array buffer to the cube's vertices
    // array, setting attributes, and pushing it to GL.
    gl.bindBuffer(gl.ARRAY_BUFFER, dartVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, dartVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Set the texture coordinates attribute for the vertices.
    gl.bindBuffer(gl.ARRAY_BUFFER, dartTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, dartTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Specify the texture to map onto the faces.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dartTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // Draw the cube.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dartIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, dartIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

    // store current location
    mvPushMatrix();

    // translate the target
    mat4.translate(mvMatrix, [-12.0, 3.1, -100]);


    // Rotate target before we draw.
    mat4.rotate(mvMatrix, degToRad(0), [1, 0, 0]);
    mat4.rotate(mvMatrix, degToRad(180), [0, 1, 0]);
    mat4.rotate(mvMatrix, degToRad(33), [0, 0, 1]);

    //scale target
    mat4.scale(mvMatrix, [10,10,10]);

    // Draw the cube by binding the array buffer to the cube's vertices
    // array, setting attributes, and pushing it to GL.
    gl.bindBuffer(gl.ARRAY_BUFFER, targetVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, targetVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Set the texture coordinates attribute for the vertices.
    gl.bindBuffer(gl.ARRAY_BUFFER, targetTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, targetTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Specify the texture to map onto the faces.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // Draw the cube.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, targetIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, targetIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();


}

/*//
// animate
//
// Called every time before redeawing the screen.
//
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        // rotate pyramid and cube for a small amount
        rotationPyramid += (90 * elapsed) / 1000.0;
        rotationCube += (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}*/

//
// start
//
// Called when the canvas is created to get the ball rolling.
//

function start() {
    canvas = document.getElementById("glcanvas");

    gl = initGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
        gl.clearDepth(1.0);                                     // Clear everything
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

        // Initialize the shaders; this is where all the lighting for the
        // vertices and so forth is established.
        initShaders();

        // Here's where we call the routine that builds all the objects
        // we'll be drawing.
        initBuffers();

        // Next, load and set up the textures we'll be using.
        initTextures();

        // Bind keyboard handling functions to document handlers
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        // Set up to draw the scene periodically.
        setInterval(function() {
            if(texturesLoaded == numberOfTextures) {
                handleKeys();
                drawScene();
            }
        }, 15);
    }
}
