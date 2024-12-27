// adding btn.
// const btn = document.getElementById('startcam');
// btn.addEventListener("click",function(){
//     console.log("it was clicked");
// });



// const btn = document.getElementById("btn");
// btn.addEventListener("click",function(){
// location.reload();
// });
const video = document.getElementById("video");

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("models"),
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error(error);
        });
}

function getLabeledFaceDescriptions() {
    const labels = ["Bikash", "Shyam sir","Priyanka", "Messi","Monalisa"];
    return Promise.all(
        labels.map(async(label) => {
            const descriptions = [];
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
                const detections = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}


// added for demo list.
const recognizedNamesSet = new Set();
// end of added.
video.addEventListener("play", async() => {
    const labeledFaceDescriptors = await getLabeledFaceDescriptions();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector("#box").append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // added 
    let frameCount = 0;
// blinking style added.

    setInterval(async() => {
        if(frameCount % 3==0){




        const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor);
        });
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;

//added
            const para = document.getElementById("para");
            para.addEventListener("click",()=>{
                console.log("para working");
            });
            // aditional functionality. (testing.)
            // Code to print on console if recognized.
            const recognizedLabel = result.label;
            let boxColor;
            if (recognizedLabel !== "unknown") {
                console.log(`recognized : ${recognizedLabel}`);
                para.innerHTML=`recognized: ${recognizedLabel}`;
                // para.innerHTML="working";
                boxColor = "green";

   // Check if the name already exists in the table
   const existingRows = document.querySelectorAll("tbody tr");
   const nameExists = Array.from(existingRows).some(row => 
       row.cells[1].textContent === recognizedLabel
   );

   if (!nameExists) {
       // Add a new row to the table
       const tbody = document.querySelector("tbody");
       const newRow = document.createElement("tr");

       // Create cells for the new row
       const rollNoCell = document.createElement("td");
       rollNoCell.textContent = existingRows.length + 1; // Incremental roll number
       
       const nameCell = document.createElement("td");
       nameCell.textContent = recognizedLabel;
       
       const yearCell = document.createElement("td");
       yearCell.textContent = new Date().getFullYear(); // Example: Current year
       
       const timeCell = document.createElement("td");
       const currentTime = new Date().toLocaleTimeString();
       timeCell.textContent = currentTime;

       const statusCell = document.createElement("td");
       const statusSpan = document.createElement("span");
       statusSpan.className = "status present";
       statusSpan.textContent = "Present";
       statusCell.appendChild(statusSpan);

       // Append cells to the new row
       newRow.appendChild(rollNoCell);
       newRow.appendChild(nameCell);
       newRow.appendChild(yearCell);
       newRow.appendChild(timeCell);
       newRow.appendChild(statusCell);

       // Append the new row to the table body
       tbody.appendChild(newRow);
       newRow.classList.add("new");
    setTimeout(() => newRow.classList.remove("new"), 2000);
   }


                // // added list .
                // if (!recognizedNamesSet.has(recognizedLabel)) {
                //     recognizedNamesSet.add(recognizedLabel);
                //     updateRecognizedList(recognizedLabel);
                // }

            } else {
                console.log("face not recognized");
                boxColor = "red";
            }

            // ending of this adding features.




            const drawBox = new faceapi.draw.DrawBox(box, {
                label: result,

            });



            drawBox.draw(canvas);

            //added
            const landmarks = resizedDetections[i].landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            if(isBlinking(leftEye)|| isBlinking(rightEye)){
              console.log("Blink detected!");
              const  box = document.getElementById('box');
              box.style.boxShadow = "0 0 6px 6px rgba(0, 255, 0, 0.7)"; // Green glow
            }







        });
    }
    frameCount++;
}, 100);
});
// Eye Aspect Ratio (EAR) calculation
function isBlinking(eye) {
    const ear = calculateEAR(eye);
    const blinkThreshold = 0.3; // Threshold for blinking (adjust if necessary)
    return ear < blinkThreshold;
}

// Calculate Eye Aspect Ratio (EAR)
function calculateEAR(eye) {
    const A = distance(eye[1], eye[5]); // vertical distance between top and bottom eyelids
    const B = distance(eye[2], eye[4]); // horizontal distance between the outer corners of the eye
    const C = distance(eye[0], eye[3]); // horizontal distance between the inner and outer corners of the eye

    return (A + B) / (2.0 * C); // EAR formula
}

// Calculate the Euclidean distance between two points
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}


/// added to list .
function updateRecognizedList(name) {
    const namesList = document.getElementById("namesList");
    const listItem = document.createElement("li");
    listItem.textContent = name;
    namesList.appendChild(listItem);
}


