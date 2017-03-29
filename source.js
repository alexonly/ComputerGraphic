//
var PoinstList = new Array();
var DepthList = new Array();

// Cube face data
var CubeFaces =
[
    // Front
    { a:0, b:1, c:2, i:1 },
    { a:2, b:3, c:0, i:1 },
    
    // Top
    { a:1, b:5, c:6, i:2 },
    { a:6, b:2, c:1, i:2 },
    
    // Back
    { a:5, b:4, c:7, i:3 },
    { a:7, b:6, c:5, i:3 },
    
    // Bottom
    { a:4, b:0, c:3, i:4 },
    { a:3, b:7, c:4, i:4 },
    
    // Right
    { a:3, b:2, c:6, i:5 },
    { a:6, b:7, c:3, i:5 },
    
    // Left
    { a:0, b:5, c:1, i:6 },
    { a:0, b:4, c:5, i:6 },
];


// Cube vertex data
var CubeVertex =
[
    {x:-3, y:-1, z:1},
    {x:-3, y:1, z:1},
    {x:1, y:1, z:1},
    {x:1, y:-1, z:1},
    {x:-3, y:-1, z:-1},
    {x:-3, y:1, z:-1},
    {x:1, y:1, z:-1},
    {x:1, y:-1, z:-1},
];

// Cube edge data
var CubeEdges =
[
    {i:0, j:1},
    {i:1, j:2},
    {i:2, j:3},
    {i:3, j:0},
    
    {i:4, j:5},
    {i:5, j:6},
    {i:6, j:7},
    {i:7, j:4},
    
    {i:0, j:4},
    {i:1, j:5},
    {i:2, j:6},
    {i:3, j:7},
];




// Camera position
var CameraPos = {x: 0, y: 0, z: -20};

// Camera distortion
var RatioConst = 300;

//camera rotation
var CameraRot = {x: 0, y: 0, z: 0};

function Init()
{
    // Left empty on purpose...
}

function RenderScene()
{
    // Render the background
    RenderBackground(ContextHandle);
    
    // Find the center of the image
    var CenterX = CanvasWidth / 2;
    var CenterY = CanvasHeight / 2;
    
    //slightly grow the rotations
	CameraRot.x +=0.02;
	CameraRot.y +=0.02;
	CameraRot.z +=0.02;
	//document.getElementById("xrotaRation").innerHTML  = CameraRot.x;
	//document.getElementById("yrotaRation").innerHTML  = CameraRot.y;
	//document.getElementById("zrotaRation").innerHTML  = CameraRot.z;

    // For each vertex point
    for(var i = 0; i < CubeVertex.length; i++)
    {
        var WorkingVertex = {x: CubeVertex[i].x, y: CubeVertex[i].y, z:CubeVertex[i].z};

    	//Apply rotation onto the vertex
        var Temp = WorkingVertex.x;
        WorkingVertex.x = WorkingVertex.x * Math.cos(CameraRot.z) - WorkingVertex.y * Math.sin(CameraRot.z);
        WorkingVertex.y = WorkingVertex.y * Math.cos(CameraRot.z) + Temp * Math.sin(CameraRot.z);

        Temp = WorkingVertex.z;
        WorkingVertex.z = -WorkingVertex.x * Math.sin(CameraRot.y) + WorkingVertex.z * Math.cos(CameraRot.y);
        WorkingVertex.x =  WorkingVertex.x * Math.cos(CameraRot.y) + Temp * Math.sin(CameraRot.y);

        Temp = WorkingVertex.z;
        WorkingVertex.z = WorkingVertex.y * Math.sin(CameraRot.x) + WorkingVertex.z * Math.cos(CameraRot.x);
        WorkingVertex.y = WorkingVertex.y * Math.cos(CameraRot.x) - Temp * Math.sin(CameraRot.x);


        // Apply camera translation after the rotation, so we are actually just rotating the object
        WorkingVertex.x -= CameraPos.x;
        WorkingVertex.y -= CameraPos.y;
        WorkingVertex.z -= CameraPos.z;


        // Convert from x,y,z to x,y
        // This is called a projection transform
        // We are projecting from 3D back to 2D
        var ScreenX = (RatioConst * (WorkingVertex.x)) / WorkingVertex.z;
        var ScreenY = (RatioConst * (WorkingVertex.y)) / WorkingVertex.z;
        //console.log('WorkingVertex.z : ' + WorkingVertex.z);

        // Draw this point on-screen
        //RenderPoint(ScreenX + CenterX, ScreenY + CenterY, 3);
        PoinstList[i] = {x : ScreenX + CenterX, y : ScreenY + CenterY}

        //console.log(PoinstList[i].x + ' , ' + PoinstList[i].y);

        // Save depth of point
        DepthList[i] = WorkingVertex.z;
    }


    // 1. Calculate the average depth of each face
	var AverageFaceDepth = new Array();
	for(var i = 0; i < CubeFaces.length; i++)
	{
	    // Sum and average
	    AverageFaceDepth[i] = DepthList[CubeFaces[i].a];
	    AverageFaceDepth[i] += DepthList[CubeFaces[i].b];
	    AverageFaceDepth[i] += DepthList[CubeFaces[i].c];
	    AverageFaceDepth[i] /= 3;
	}

	// 2. Sort all faces by average face depth
	// For clearity: AverageFaceDepth is our comparison variable,
	// but CubeFaces is our list we are changing
	// We are going to implement a bubble sort algorithm
	// This is very slow but is a nice proof of concept
	var IsSorted = false;
	while(!IsSorted)
	{
	    // Default us back to a sorted state
	    IsSorted = true;
	    
	    // Make sure each element[n] is < element[n+1]
	    for(var i = 0; i < AverageFaceDepth.length - 1; i++)
	    {
	        // Is element[n] < element[n+1]?
	        // This checks the opposite case: when things are inverted
	        if(AverageFaceDepth[i] > AverageFaceDepth[i+1])
	        {
	            // Not sorted
	            IsSorted = false;
	            
	            // Flip elements (both face depth and )
	            var temp = AverageFaceDepth[i];
	            AverageFaceDepth[i] = AverageFaceDepth[i+1];
	            AverageFaceDepth[i+1] = temp;
	            
	            var temp = CubeFaces[i];
	            CubeFaces[i] = CubeFaces[i+1];
	            CubeFaces[i+1] = temp;
	            
	            // Break out of for loop
	            break;
	        }
	    }
	}

	// Reverse array
	CubeFaces.reverse();





    // for(var i = 0; i < CubeEdges.length; i++) 
    // {
    // 	var Point1 = PoinstList[CubeEdges[i].i];
    // 	var Point2 = PoinstList[CubeEdges[i].j];

    // 	    // Render the edge by looking up our vertex list
    // 	RenderLine(Point1.x, Point1.y, Point2.x, Point2.y, 1);
    // 	RenderPoint(Point1.x, Point1.y, 3, {R:100, G:100, B:100});
    // 	RenderPoint(Point2.x, Point2.y, 3, {R:100, G:100, B:100});
    // }

    for(var i = 0; i < CubeFaces.length; i++)
    {
    	var PointA = PoinstList[CubeFaces[i].a];
    	var PointB = PoinstList[CubeFaces[i].b];
    	var PointC = PoinstList[CubeFaces[i].c];

    	//generate a unique face color
    	var Color = {R: (CubeFaces[i].i *50) % 255, G: (CubeFaces[i].i * 128) % 255, B: (CubeFaces[i].i * 200 % 255)}

       // Render the face by looking up our vertex list
        RenderFillTriangle(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y, 2, Color);
        RenderTriangle(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y, 2);
    
    }



}