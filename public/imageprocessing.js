// 전역변수 선언
var inCanvas, outCanvas, inCtx, outCtx, inPaper, outPaper; // 화면과 관련
var inFile;  // Color 파일(JPEG, PNG, BMP)
var inImage, outImage; // 입력, 출력 이미지 (3차원 배열)
var inH, inW, outH, outW; // 입력 영상, 출력 영상의 높이x폭 
var pressYN = false;
var startX, startY, endX, endY;
var imageData;
var algoNum;
var pntAry = []; // 마우스가 지나간 좌표들의 모음(대용량) ex) [[50, 50], [33, 27]...]
var pointX, pointY;

// 초기화 함수
function init() {
    inCanvas = document.getElementById('inCanvas'); // 도화지에 접근
    outCanvas = document.getElementById('outCanvas'); // 도화지에 접근
    inCtx = inCanvas.getContext('2d'); // 물감,붓이 들은 통
    outCtx = outCanvas.getContext('2d'); // 물감,붓이 들은 통
}

// 이미지 파일 불러오기
function openImage() {
    inFile = document.querySelector('#inFile');
    var selectedFile = inFile.files[0];
    var fileReader = new FileReader();
    
    fileReader.readAsDataURL(selectedFile);
    fileReader.onload = function() {
        var inPicture = new Image();
        inPicture.src = fileReader.result;
        inPicture.onload = () => {
            inH = inPicture.height;
            inW = inPicture.width;
    
            inCanvas.height = inH;
            inCanvas.width = inW;
            inCtx.drawImage(inPicture, 0, 0, inW, inH);
            var dataURI = inCanvas.toDataURL("image/*");
            document.querySelector('#inCanvas').src = dataURI;
            inImage = new Array(3);
            for(var m = 0; m < 3; m++) {
                inImage[m] = new Array(inH);
                for(var i = 0; i < inH; i++)
                    inImage[m][i] = new Array(inW);
            }
            var colorBlob = inCtx.getImageData(0, 0, inW, inH); 
            var R, G, B, Alpha;
            for(var i = 0; i < inH; i++) {
                for (var k = 0; k < inW; k++) {
                    var pos = (i * inW + k) * 4; // 1픽셀 = 4byte
                    R = colorBlob.data[pos + 0]; // R
                    G = colorBlob.data[pos + 1]; // G
                    B = colorBlob.data[pos + 2]; // B
                    // Alpha = colorBlob.data[pos + 3]; // Alpha
                    inImage[0][i][k] = R;
                    inImage[1][i][k] = G;
                    inImage[2][i][k] = B;                    
                }
            }
        }
    }
}

function display() {
    // ** 출력 메모리의 내용을 화면에 출력하기. **
    outPaper = outCtx.createImageData(outW, outH); // 캔버스에 종이 붙이기 (크기는 캔버스 동일)
    // 아웃 컨버스 부분
    outCanvas.height = outH;
    outCanvas.width = outW;
    for (var i = 0; i < outH; i++) {
        for (var k = 0; k < outW; k++) {
            var R = outImage[0][i][k]; // 0 ~ 255 사이의 값
            var G = outImage[1][i][k]; // 0 ~ 255 사이의 값
            var B = outImage[2][i][k]; // 0 ~ 255 사이의 값
            outPaper.data[(i * outW + k) * 4 + 0] = R; // Red
            outPaper.data[(i * outW + k) * 4 + 1] = G; // Green
            outPaper.data[(i * outW + k) * 4 + 2] = B; // Blue
            outPaper.data[(i * outW + k) * 4 + 3] = 255; // Alpha
        }
    }
    outCtx.putImageData(outPaper, 0, 0); // (0,0) 좌표에 붙여라.
    var dataURI = outCanvas.toDataURL("image/*");
    document.querySelector('#download').href = dataURI;
}

// 3차원 메모리 크기 설정
function arraySetting() {
    // 캔버스 크기 지정
    outH = inH;
    outW = inW;
    // 3차원 배열로 메모리 할당
    outImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        outImage[m] = new Array(outH);
        for (var i = 0; i < outH; i++)
            outImage[m][i] = new Array(outW);
    }
}

// 마우스 클릭 이동 함수
function __downMouse(event) {
    startX = event.offsetX;
    startY = event.offsetY;
    imageData = inCtx.getImageData(0, 0, inCanvas.width, inCanvas.height);
    pressYN = true;
    }
    
    function __moveMouse(event) {
    if (!pressYN)
        return;
    inCtx.putImageData(imageData, 0, 0);
    
    endX = event.offsetX;
    endY = event.offsetY;
    inCtx.beginPath(); // 선 그리기 시작
    inCtx.strokeStyle = 'blue';
    inCtx.lineWidth = 1;
    inCtx.rect(startX, startY, (endX - startX), (endY - startY))
    obj = inCtx.stroke();
    inCtx.closePath();
}

function __upMouse(event) {
    pressYN = false;
    endX = event.offsetX;
    endY = event.offsetY;
    
    if (startX > endX) {
        temp = startX;
        startX = endX;
        endX = temp;
    }
    else if (startY > endY) {
        temp = startY;
        startY = endY;
        endY = temp;
    }
    inCanvas.removeEventListener("mousedown", __downMouse, false);
    inCanvas.removeEventListener("mouseup", __upMouse, false);
    inCanvas.removeEventListener("mousemove", __moveMouse, false);
    
    switch(algoNum) {
        case 100: // 동일 사진 출력
            equalImage();
            break;
        case 101: // 사진 밝게 출력
            brightImage();
            break;
        case 102: // 사진 반전 출력
            reverseImage();
            break;
        case 103: // 사진 흑백 출력
            blackwhiteImage();
            break;
    
        case 300: // 사진 히스토그램 스트레칭
            histoStretch();
            break;
        case 301: // 사진 엔드인 탐색
            endIn();
            break;
        case 302: // 사진 파라볼라캡
            paraCap();
            break;
        case 303: // 사진 히스토그램 평활화
            histoAvg();
            break;
    }
}

// 자유 마우스 클릭 이동 함수
function pointInPolygon(pointArray, pntX, pntY) {
    crossCnt = 0;
    for (var i = 0; i < pointArray.length - 1; i++) {
        k = (i + 1);
        if ((pointArray[i][1] > pntY) != (pointArray[k][1] > pntY)) {
            atX = (((pointArray[k][0] - pointArray[i][0]) / (pointArray[k][1] - pointArray[i][1]))
                *(pntY - pointArray[i][1])) + pointArray[i][0];
            if (pntX < atX)
                crossCnt++;
        }
    }
    // 홀수면 내부에, 짝수면 외부에 있음
    if (0== (crossCnt % 2))
        return false;
    else
        return true;
}

function __downFreeMouse(event) {
        pointX = event.offsetX;
        pointY = event.offsetY;
        pntAry[0] = [pointX, pointY];
        pressYN = true;
    }
    
function __moveFreeMouse(event) {
    if (!pressYN)
        return;
    
        pointX = event.offsetX;
        pointY = event.offsetY;
        pntAry[pntAry.length] = [pointX, pointY]; // 포인트 배열의 마지막에 추가
    
        // 그려질 짧은 선 추출
        pt1 = pntAry[pntAry.length - 2];
        pt2 = pntAry[pntAry.length - 1];
    
        inCtx.beginPath();
        inCtx.strokeStyle='blue';
        inCtx.lineWidth = 2;
        inCtx.moveTo(pt1[0], pt1[1]);
        inCtx.lineTo(pt2[0], pt2[1]);
        inCtx.stroke();
        inCtx.closePath();
}

function __upFreeMouse(event) {
    pressYN = false;
    pointX = event.offsetX;
    pointY = event.offsetY;
    pntAry[pntAry.length] = [pointX, pointY];
    pntAry[pntAry.length] = pntAry[0]; // 폐합 폴리곤으로 구성
    
    // 그려질 짧은 선 추출
    pt1 = pntAry[pntAry.length - 2];
    pt2 = pntAry[pntAry.length - 1];
    
    inCtx.beginPath();
    inCtx.strokeStyle='blue';
    inCtx.lineWidth = 2;
    inCtx.moveTo(pt1[0], pt1[1]);
    inCtx.lineTo(pt2[0], pt2[1]);
    inCtx.stroke();
    inCtx.closePath();
    
    inCanvas.removeEventListener("mousedown", __downFreeMouse, false);
    inCanvas.removeEventListener("mouseup", __upFreeMouse, false);
    inCanvas.removeEventListener("mousemove", __moveFreeMouse, false);
    
    switch(algoNum) {
        case 400: // 사진 엠보싱 효과
            embossing();
            break;
        case 401: // 사진 블러링 효과
            blurring();
            break;
        case 402: // 사진 샤프닝 효과
            sharpening();
            break;
        case 403: // 사진 가우시안 필터
            gaussianFilter();
            break;
    }
}



function selectAlgorithm(selectNum) {
    algoNum = parseInt(selectNum.value)
    switch (algoNum) {
        case 100: // 동일 사진 출력
            equalImage();
            break;
        case 101: // 사진 밝게 출력
            checkMouseImage();
            break;
        case 102: // 사진 반전 출력
            checkMouseImage();
            break;
        case 103: // 사진 흑백 출력
            checkMouseImage();
            break;
        case 104: // 채도 변경
            changeSatur();
            break;
        case 105: // 컬러 추출
            pickColorImage();
            break;
    
        case 200: // 사진 상하 미러링
            mirroringUDImage();
            break;
        case 201: // 사진 좌우 미러링
            mirroringLRImage();
            break;
        case 202: // 사진 90도 회전
            rotationImage();
            break;
        case 203: // 사진 2배 줌아웃
            zoomoutImage();
            break;
        case 204: // 사진 2배 줌인
            zoominImage();
            break;
    
        case 300: // 사진 히스토그램 스트레칭
            checkMouseImage();
            break;
        case 301: // 사진 엔드인 탐색
            checkMouseImage();
            break;
        case 302: // 사진 파라볼라캡
            checkMouseImage();
            break;
        case 303: // 사진 히스토그램 평활화
            checkMouseImage();
            break;
    
        case 400: // 사진 엠보싱 효과
            checkFreeMouseImage();
            break;
        case 401: // 사진 블러링 효과
            checkFreeMouseImage();
            break;
        case 402: // 사진 샤프닝 효과
            checkFreeMouseImage();
            break;
        case 403: // 사진 가우시안 필터
            checkFreeMouseImage();
            break;
    }
}

// 마우스 공통 함수
function checkMouseImage() {
    // 마우스 사용 체크 박스를 확인해서.... 마우스 입력 여부 결정
    if(!document.getElementById("mouseChecker").checked) {
        startX = 0;
        startY = 0;
        endX = inW;
        endY = inH;
        switch(algoNum) {
            case 100: // 동일 사진 출력
                equalImage();
                break;
            case 101: // 사진 밝게 출력
                brightImage();
                break;
            case 102: // 사진 반전 출력
                reverseImage();
                break;
            case 103: // 사진 흑백 출력
                blackwhiteImage();
                break;
    
            case 300: // 사진 히스토그램 스트레칭
                histoStretch();
                break;
            case 301: // 사진 엔드인 탐색
                endIn();
                break;
            case 302: // 사진 파라볼라캡
                paraCap();
                break;
            case 303: // 사진 히스토그램 평활화
                histoAvg();
                break;
        }
        return;
    }

    inCanvas.addEventListener("mousedown", __downMouse, false);
    inCanvas.addEventListener("mouseup", __upMouse, false);
    inCanvas.addEventListener("mousemove", __moveMouse, false);
}

function checkFreeMouseImage() {
    // 마우스 사용 체크 박스를 확인해서.... 마우스 입력 여부 결정
    if(!document.getElementById("freemouseChecker").checked) {
        switch(algoNum) {
            case 400: // 사진 엠보싱 효과
                embossing();
                break;
            case 401: // 사진 블러링 효과
                blurring();
                break;
            case 402: // 사진 샤프닝 효과
                sharpening();
                break;
            case 403: // 사진 가우시안 필터
                gaussianFilter();
                break;
        }
    }
    pntAry = []; // 기존 포인트값 초기화
    inCanvas.addEventListener("mousedown", __downFreeMouse, false);
    inCanvas.addEventListener("mouseup", __upFreeMouse, false);
    inCanvas.addEventListener("mousemove", __moveFreeMouse, false);
}

// 동일 사진 출력 함수
function equalImage() {
    arraySetting();
    // 영상처리 알고리즘
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++)
                outImage[rgb][i][k] = inImage[rgb][i][k]
        }
    }
    display();
}

// 사진 밝게하는 함수
function brightImage() {
    arraySetting();
    // 영상처리 알고리즘
    var brightNum = parseInt(prompt("밝아질 값(음수는 어둡게 처리): ", "50"));
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                    if (inImage[rgb][i][k] + brightNum > 255)
                        outImage[rgb][i][k] = 255;
                    else
                        outImage[rgb][i][k] = inImage[rgb][i][k] + brightNum;
                }
                else
                    outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 사진 반전 하는 함수
function reverseImage() {
    arraySetting();
    var reverseNum = 255;
    // 영상처리 알고리즘
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                    var pixel = inImage[rgb][i][k];
                    var pixel = reverseNum - pixel;
                    outImage[rgb][i][k] = pixel;
                }
                else
                    outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 사진 흑백 처리하는 함수
function blackwhiteImage() {
    arraySetting();
    // 영상처리 알고리즘
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                    var hap = inImage[0][i][k] + inImage[1][i][k] + inImage[2][i][k];
                    var avg = parseInt(hap / 3);
                    outImage[0][i][k] = avg;
                    outImage[1][i][k] = avg;
                    outImage[2][i][k] = avg;
                }
                else
                    outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 사진 상하 미러링 하는 함수
function mirroringUDImage() {
    arraySetting();
    var mirroringH = inH - 1;
    // 영상처리 알고리즘
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                outImage[rgb][mirroringH - i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 사진 좌우 미러링 하는 함수
function mirroringLRImage() {
    arraySetting();
    var mirroringW = inW - 1;
    // 영상처리 알고리즘
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                outImage[rgb][i][mirroringW - k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 사진 90도 회전 하는 함수
function rotationImage() {
    // 캔버스 크기 지정
    outH = inW;
    outW = inH;
    // 3차원 배열로 메모리 할당
    outImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        outImage[m] = new Array(outH);
        for (var i = 0; i < outH; i++)
            outImage[m][i] = new Array(outW);
    }
    var rotationH = inH - 1;
    var rotationW = inW - 1;
    var choice = prompt("L방향으로 90도 회전 or R방향으로 90도 회전", "R");
    if (choice == "R") {
        for (var rgb = 0; rgb < 3; rgb++) {
            for (var i = 0; i < inH; i++) {
                for (var k = 0; k < inW; k++) {
                    outImage[rgb][k][rotationH - i] = inImage[rgb][i][k];
                }
            }
        }
    }
    else {
        for (var rgb = 0; rgb < 3; rgb++) {
            for (var i = 0; i < inH; i++) {
                for (var k = 0; k < inW; k++) {
                    outImage[rgb][rotationW - k][i] = inImage[rgb][i][k];
                }
            }
        }
    }
    display();
}

// 줌 아웃 하는 함수
function zoomoutImage() {
    var zoomNum = parseInt(prompt("축소할 배율 : ", "2"));
    // 캔버스 크기 지정
    outH = inH / zoomNum;
    outW = inW / zoomNum;
    // 3차원 배열로 메모리 할당
    outImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        outImage[m] = new Array(outH);
        for (var i = 0; i < outH; i++)
            outImage[m][i] = new Array(outW);
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                outImage[rgb][parseInt(i / zoomNum)][parseInt(k / zoomNum)] = inImage[rgb][i][k];
            }
        }
    }
    display();
}
// 줌 인 하는 함수
function zoominImage() {
    var zoomNum = parseInt(prompt("확대할 배율 : ", "2"));
    outH = inH * zoomNum;
    outW = inW * zoomNum;
    outImage = new Array(outH);
    // 3차원 배열로 메모리 할당
    outImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        outImage[m] = new Array(outH);
        for (var i = 0; i < outH; i++)
            outImage[m][i] = new Array(outW);
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++) {
                outImage[rgb][i][k] = inImage[rgb][parseInt(i / zoomNum)][parseInt(k / zoomNum)];
            }
        }
    }
    display();
}

// 히스토그램 스트래칭
function histoStretch() {
    arraySetting();
    // ** 영상처리 알고리즘 구현
    // 최대값, 최솟값 찾기
    for (var rgb = 0; rgb < 3; rgb++) {
        var minValue = inImage[rgb][0][0];
        var maxValue = inImage[rgb][0][0];
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if (inImage[rgb][i][k] < minValue)
                    minValue = inImage[rgb][i][k];
                if (inImage[rgb][i][k] > maxValue)
                    maxValue = inImage[rgb][i][k];
            }
        }
        // outValue =  ( inValue - minValue) / (maxValue - minValue) * 255
            for (var i = 0; i < inH; i++) {
                for (var k = 0; k < inW; k++) {
                    if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                        var inValue = inImage[rgb][i][k];
                        var outValue = (inValue - minValue) / (maxValue - minValue) * 255.0;
                        if (outValue < 0)
                            outValue = 0;
                        if (outValue > 255)
                            outValue = 255;
                        outImage[rgb][i][k] = outValue;
                    }
                    else
                        outImage[rgb][i][k] = inImage[rgb][i][k];
                }
            }
    }
    display();
}

// 엔드-인 탐색
function endIn() {
    arraySetting();
    // ** 영상처리 알고리즘 구현
    // 최대값, 최솟값 찾기
    for (var rgb = 0; rgb < 3; rgb++) {
        var minValue = inImage[rgb][0][0];
        var maxValue = inImage[rgb][0][0];
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if (inImage[rgb][i][k] < minValue)
                    minValue = inImage[rgb][i][k];
                if (inImage[rgb][i][k] > maxValue)
                    maxValue = inImage[rgb][i][k];
            }
        }
        minValue = minValue + 50;
        maxValue = maxValue - 50;
        // outValue =  ( inValue - minValue) / (maxValue - minValue) * 255
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                    var inValue = inImage[rgb][i][k];
                    var outValue = (inValue - minValue) / (maxValue - minValue) * 255.0;
                    if (outValue < 0)
                        outValue = 0;
                    if (outValue > 255)
                        outValue = 255;
                    outImage[rgb][i][k] = outValue;
                }
                else
                outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 파라볼라 (Cap)
function paraCap() {
    arraySetting();
    // ** 영상처리 알고리즘 구현
    // outV = 255 * ( inV / 127  - 1 ) * ( inV / 127  - 1 );
    var LUT = new Array(256);
    for (var i = 0; i < 256; i++) {
        var outV = 255 * (i / 127 - 1) * (i / 127 - 1);
        if (outV < 0)
            outV = 0;
        if (outV > 255)
            outV = 255;
        LUT[i] = outV;
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= i && i <= endY)) {
                    outImage[rgb][i][k] = LUT[inImage[rgb][i][k]];
                }
                else   
                    outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    display();
}

// 히스토그램 평활화 하는 함수
function histoAvg() {
    arraySetting();
    // 1단계
    var hist = new Array(256);
    for (var i = 0; i < 256; i++)
        hist[i] = 0;
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var j = 0; j < inH; j++) {
            for (var k = 0; k < inW; k++) {
                hist[inImage[rgb][j][k]] += 1;
            }
        }
    }
    // 2단계
    var sum = new Array(256);
    var sumNum = 0;
    for (var i = 0; i < 256; i++) {
        sum[i] = 0;
        sumNum += hist[i];
        sum[i] = sumNum;
    }
    // 3단계
    var n = new Array(256);
    for (var i = 0; i < 256; i++) {
        n[i] = 0;
        n[i] = parseInt(sum[i] * (1 / (inH * inW)) * 255);
    }
    // 마무리
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var j = 0; j < inH; j++) {
            for (var k = 0; k < inW; k++) {
                if ((startX <= k && k <= endX) && (startY <= j && j <= endY)) {
                    outImage[rgb][j][k] = n[inImage[rgb][j][k]];
                }
                else
                    outImage[rgb][j][k] = inImage[rgb][j][k];
            }
        }
    }
    display();
}

// 사진 엠보싱 넣는 함수
function embossing() {
    arraySetting();
    // 회선마스크 설정
    var mask = [[ -1.0, 0.0, 0.0 ],
                [  0.0, 0.0, 0.0 ],
                [  0.0, 0.0, 1.0 ]];
    // 보다 큰 배열 설정 => 회선마스크 때문에
    var exInImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exInImage[m] = new Array(inH + 2);
        for (var i = 0; i < inH + 2; i++)
            exInImage[m][i] = new Array(inW + 2);
    }  // 여기까지가 배열
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0;  i < inH + 2; i++) {
            for (var k = 0; k < inW + 2; k++)
                exInImage[rgb][i][k] = 127;
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++)
                exInImage[rgb][i + 1][k + 1] = inImage[rgb][i][k];
        }
    }
    var exOutImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exOutImage[m] = new Array(outH);
        for (var i = 0; i < inH; i++)
            exOutImage[m][i] = new Array(outW);
    }
    // 회선연산
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                var S = 0;
                for (var m = 0; m < 3; m++) {
                    for (var n = 0; n < 3; n++) {
                        S += exInImage[rgb][i + m][k + n] * mask[m][n];
                    }
                }
                exOutImage[rgb][i][k] = S;
            }
        }
    }
    // 후 처리
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++)
                exOutImage[rgb][i][k] += 127;
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++) {
                if(!document.getElementById("freemouseChecker").checked) {
                    outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                }
                else {
                    if (pointInPolygon(pntAry, k, i)) 
                        outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                    else 
                        outImage[rgb][i][k] = inImage[rgb][i][k];
                }
            }
        }
    }
    display();
}

// 사진 블러링 효과 함수
function blurring() {
    arraySetting();
    var mask = [[  1/9.0, 1/9.0, 1/9.0 ],
                [  1/9.0, 1/9.0, 1/9.0 ],
                [  1/9.0, 1/9.0, 1/9.0 ]];
    // 보다 큰 배열 설정 => 회선마스크 때문에
    var exInImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exInImage[m] = new Array(inH + 2);
        for (var i = 0; i < inH + 2; i++)
            exInImage[m][i] = new Array(inW + 2);
    }  // 여기까지가 배열
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0;  i < inH + 2; i++) {
            for (var k = 0; k < inW + 2; k++)
                exInImage[rgb][i][k] = 127;
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++)
                exInImage[rgb][i + 1][k + 1] = inImage[rgb][i][k];
        }
    }
    var exOutImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exOutImage[m] = new Array(outH);
        for (var i = 0; i < inH; i++)
            exOutImage[m][i] = new Array(outW);
    }
    // 회선연산
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                var S = 0;
                for (var m = 0; m < 3; m++) {
                    for (var n = 0; n < 3; n++) {
                        S += exInImage[rgb][i + m][k + n] * mask[m][n];
                    }
                }
                exOutImage[rgb][i][k] = S;
            }
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++) {
                if(!document.getElementById("freemouseChecker").checked) {
                    outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                }
                else {
                    if (pointInPolygon(pntAry, k, i)) 
                        outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                    else 
                        outImage[rgb][i][k] = inImage[rgb][i][k];
                }
            }
        }
    }
    display();
}

// 사진 샤프닝 효과 함수
function sharpening() {
    arraySetting();
    var mask = [[   0.0, -1.0,  0.0 ],
                [  -1.0,  5.0, -1.0 ],
                [   0.0, -1.0,  0.0 ]];
    // 보다 큰 배열 설정 => 회선마스크 때문에
    var exInImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exInImage[m] = new Array(inH + 2);
        for (var i = 0; i < inH + 2; i++)
            exInImage[m][i] = new Array(inW + 2);
    }  // 여기까지가 배열
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0;  i < inH + 2; i++) {
            for (var k = 0; k < inW + 2; k++)
                exInImage[rgb][i][k] = 127;
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++)
                exInImage[rgb][i + 1][k + 1] = inImage[rgb][i][k];
        }
    }
    var exOutImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exOutImage[m] = new Array(outH);
        for (var i = 0; i < inH; i++)
            exOutImage[m][i] = new Array(outW);
    }
    // 회선연산
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                var S = 0;
                for (var m = 0; m < 3; m++) {
                    for (var n = 0; n < 3; n++) {
                        S += exInImage[rgb][i + m][k + n] * mask[m][n];
                    }
                }
                exOutImage[rgb][i][k] = S;
            }
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++) {
                if(!document.getElementById("freemouseChecker").checked) {
                    outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                }
                else {
                    if (pointInPolygon(pntAry, k, i)) 
                        outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                    else 
                        outImage[rgb][i][k] = inImage[rgb][i][k];
                }
            }
        }
    }
    display();
}

// 사진 가우시안 스무딩 필터링 함수
function gaussianFilter() {
    arraySetting();
    // 회선마스크 설정
    var mask = [[  1/16.0, 1/8.0, 1/16.0 ],
                [  1/8.0,  1/4.0, 1/8.0 ],
                [  1/16.0, 1/8.0, 1/16.0 ]];
    // 보다 큰 배열 설정 => 회선마스크 때문에
    var exInImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exInImage[m] = new Array(inH + 2);
        for (var i = 0; i < inH + 2; i++)
            exInImage[m][i] = new Array(inW + 2);
    }  // 여기까지가 배열
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0;  i < inH + 2; i++) {
            for (var k = 0; k < inW + 2; k++)
                exInImage[rgb][i][k] = 127;
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++)
                exInImage[rgb][i + 1][k + 1] = inImage[rgb][i][k];
        }
    }
    var exOutImage = new Array(3);
    for (var m = 0; m < 3; m++) {
        exOutImage[m] = new Array(outH);
        for (var i = 0; i < inH; i++)
            exOutImage[m][i] = new Array(outW);
    }
    // 회선연산
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < inH; i++) {
            for (var k = 0; k < inW; k++) {
                var S = 0;
                for (var m = 0; m < 3; m++) {
                    for (var n = 0; n < 3; n++) {
                        S += exInImage[rgb][i + m][k + n] * mask[m][n];
                    }
                }
                exOutImage[rgb][i][k] = S;
            }
        }
    }
    for (var rgb = 0; rgb < 3; rgb++) {
        for (var i = 0; i < outH; i++) {
            for (var k = 0; k < outW; k++) {
                if(!document.getElementById("freemouseChecker").checked) {
                    outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                }
                else {
                    if (pointInPolygon(pntAry, k, i)) 
                        outImage[rgb][i][k] = parseInt(exOutImage[rgb][i][k]);
                    else 
                        outImage[rgb][i][k] = inImage[rgb][i][k];
                }
            }
        }
    }
    display();
}

// rgb => hsv로 변환하는 함수
function rgb2hsv(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;
    
    switch (max) {
        case min:
            h = 0;
            break;
        case r:
            h = (g - b) + d * (g < b ? 6: 0);
            h /= 6 * d;
            break;
        case g:
            h = (b - r) + d * 2;
            h /= 6 * d;
            break;
        case b:
            h = (r - g) + d * 4;
            h /= 6 * d;
            break;
    }
    return {
        h: h,    s: s,    v: v
    };
}

// hsv => rgb로 변환하는 함수
function hsv2rgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    
    h = h * 360;
    s = s * 100;
    v = v * 100;
    
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    h /= 360;
    s /= 100;
    v /= 100;
    
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function changeSatur() {
    arraySetting();
    // 영상처리 알고리즘
    var s_value = parseFloat(prompt("숫자 입력(0~1)", "-0.2")); 
    for (var i = 0; i < inH; i++) {
        for (var k = 0; k < inW; k++) {
            var R = inImage[0][i][k];
            var G = inImage[1][i][k];
            var B = inImage[2][i][k];
            // RGB --> HSV
            var hsv = rgb2hsv(R, G, B); // { h:120, s:0.4, v:0.3}
            var H = hsv.h;
            var S = hsv.s;
            var V = hsv.v;
            // 채도 변경
            S = S + s_value;
            // HSV --> RGB
            var rgb = hsv2rgb(H, S, V) // { r:120, g:77, b:192}
            R = rgb.r;
            G = rgb.g;
            B = rgb.b;
            // 출력 이미지에 넣기
            outImage[0][i][k] = R;
            outImage[1][i][k] = G;
            outImage[2][i][k] = B;
        }
    }
    
    display();
}

// 원하는 색상 추출 함수
function pickColorImage() {
    arraySetting();
    // 원하는 색상 정의
    var rgb = document.getElementById("areaColorValue").value;
    areaR = parseInt(rgb[1] + rgb[2], 16);
    areaG = parseInt(rgb[3] + rgb[4], 16);
    areaB = parseInt(rgb[5] + rgb[6], 16);
    areahsv = rgb2hsv(areaR, areaG, areaB);

    var areaColor = parseInt(prompt("영역범위(0 ~15):","15"));
    var areah = areahsv.h * 360;
    var areaUD = new Array(2);
    if (areah+areaColor > 360)
        areaUD[0] = parseInt(areah+areaColor - 360);
    else
        areaUD[0] = parseInt(areah+areaColor);
    if (areah-areaColor < 0)
        areaUD[1] = parseInt(areah-areaColor + 360);
    else
        areaUD[1] = parseInt(areah-areaColor);
    if (346 < areah || areah < 18) {
        areaUD.sort(function(a, b)  {
            return b - a;
        });
    }
    else {
        areaUD.sort(function(a, b)  {
            if (a > b)
                return 1;
            if (a === b)
                return 0;
            if (a < b)
                return -1;
        });
    }
    for (var i = 0; i < inH; i++) {
        for(var k = 0; k < inW; k++) {
            var hsv = rgb2hsv(inImage[0][i][k], inImage[1][i][k], inImage[2][i][k]); // {h: ~ , s: ~ , v: ~}
            var H = hsv.h;
            var S = hsv.s;
            var V = hsv.v;
            if(346 < areah || areah < 18) {
                if(areaUD[0] <= (H * 360) || (H * 360) <= areaUD[1]) {
                // RGB -> HSV
                    var rgb = hsv2rgb(H, S ,V);
                    outImage[0][i][k] = rgb.r;
                    outImage[1][i][k] = rgb.g;
                    outImage[2][i][k] = rgb.b;
                }
                else {
                    var hap = inImage[0][i][k] + inImage[1][i][k] + inImage[2][i][k];
                    var avg = parseInt(hap / 3);
                    outImage[0][i][k] = avg;
                    outImage[1][i][k] = avg;
                    outImage[2][i][k] = avg;
                }
            }
            else {
                if(areaUD[0] <= (H * 360) && (H * 360) <= areaUD[1]) {
                // RGB -> HSV
                    var rgb = hsv2rgb(H, S ,V);
                    outImage[0][i][k] = rgb.r;
                    outImage[1][i][k] = rgb.g;
                    outImage[2][i][k] = rgb.b;
                }
                else {
                    var hap = inImage[0][i][k] + inImage[1][i][k] + inImage[2][i][k];
                    var avg = parseInt(hap / 3);
                    outImage[0][i][k] = avg;
                    outImage[1][i][k] = avg;
                    outImage[2][i][k] = avg;
                }
            }
        }
    }
    display();
}
    


