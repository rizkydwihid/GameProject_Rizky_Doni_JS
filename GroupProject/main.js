
var score = 0;
var gameTime = 0;
var foodList = [];
var musuhList = [];
var gameAreaWidth = 1300;
var gameAreaHeight = 650;
var countMusuhEaten = 0;

//---SETTING MAIN CHARACTER----
var mainCharacter;
var mainCharWidth = 70;
var mainCharHeight = 40;
var mainCharMovementSpeed = 3;
var imgMainCharKiri = "kiri_fish.png";
var imgMainCharKanan = "fish.png";

//---SETTING FOOD----
var foodSpawnInterval = 3000;
var imgFoodKiri = "nm_kiri(1).png";
var imgFoodKanan = "nm.png";
var foodValue = 15;

//---SETTING MUSUH----
var imgMusuhKiri = "kiri_hiu.png";
var imgMusuhKanan = "kanan_hiu.png";
var musuhWidth = 150;
var musuhHeigt = 75;
var musuhSpawnInterval = 15000;
var musuhValue = 3;
var musuhGrowth = 10;


//update score pada HTML
function updateScoreHTML(){
    document.getElementById("score").innerHTML = "Score : "+score;
}

//start atau reset game
function startGame() {
    // setting ke nilai awal (saat reset game)
    myGameArea.stop();
    mainCharacter = new component(mainCharWidth, mainCharHeight, imgMainCharKanan, 10, 120, "image");
    musuhWidth = 150;
    musuhHeigt = 75;
    musuhSpawnInterval = 15000;
    musuhValue = 3;
    musuhGrowth = 10;
    score = 0;
    gameTime = 0;
    foodList = [];
    musuhList = [];
    updateScoreHTML();
    myGameArea.start();
}


//object game area
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = gameAreaWidth;
        this.canvas.height = gameAreaHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}


//object untuk komponen dalam game (ikan, food, hiu, ...)
function component(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.randomMovementFlag = Math.floor(Math.random() * 8) + 1;    
    this.x = x;
    this.y = y;
    
    //update object
    this.update = function() {
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    //tambah nilai x dan y
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.cekBatasCanvas();        
    }

    //cek batas canvas agar object tidak melewati canvas
    this.cekBatasCanvas = function() {
        let rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
        }
        if (this.y < 0){
            this.y = 0
        }
        if (this.x < 0){
            this.x = 0
        }
        let rockright = myGameArea.canvas.width - this.width;
        if (this.x > rockright) {
            this.x = rockright;
        }

    }

    //cek apakah object bertubrukan dengan object lain
    this.crashWith = function(otherobj) {
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        let otherleft = otherobj.x;
        let otherright = otherobj.x + (otherobj.width);
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + (otherobj.height);
        let crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }

    //cek apakah object lebih besar dari object lain
    this.biggerThan = function(otherObj) {
        let myWidth = this.width;
        let myHeight = this.height;
        let otherWidth = otherObj.width;
        if(myWidth > otherWidth){
            return true;
        }
        return false;
    }
}


//generate random movement
function generateRandomMovement(obj, img_kanan, img_kiri){
    if(obj.randomMovementFlag == 1){
        //timur 
        obj.x += 1
        obj.y += 0
        obj.image.src = img_kanan;
    }else if(obj.randomMovementFlag == 2){
        //timur laut 
        obj.x += 1
        obj.y += -1
        obj.image.src = img_kanan;
    }else if(obj.randomMovementFlag == 3){
        //utara 
        obj.x += 0
        obj.y += -1
    }else if(obj.randomMovementFlag == 4){
        //barat laut 
        obj.x += -1
        obj.y += -1
        obj.image.src = img_kiri;
    }else if(obj.randomMovementFlag == 5){
        //barat 
        obj.x += -1
        obj.y += 0
        obj.image.src = img_kiri;
    }else if(obj.randomMovementFlag == 6){
        //barat daya 
        obj.x += -1
        obj.y += 1
        obj.image.src = img_kiri;
    }else if(obj.randomMovementFlag == 7){
        //selatan 
        obj.x += 0
        obj.y += 1
    }else{
        //tenggara
        obj.x += 1 
        obj.y += 1
        obj.image.src = img_kanan;
    }
}


//update kondisi dalam game setiap 20 ms (50 FPS)
function updateGameArea() {
    //game area di clear dulu
    myGameArea.clear();
    mainCharacter.speedX = 0;
    mainCharacter.speedY = 0;

    //update food
    for(var i=0;i<foodList.length;i++){
        if (mainCharacter.crashWith(foodList[i])) {
            foodList.splice(i,1);
            mainCharacter.width += foodValue;
            mainCharacter.height += foodValue;
            score+=1;
            updateScoreHTML();
            continue;
        }
        //pergerakan food secara random
        generateRandomMovement(foodList[i],imgFoodKanan,imgFoodKiri)
        foodList[i].cekBatasCanvas();
        foodList[i].update();
    }

    //meningkatkan difficulty game ketika main-char sudah makan musuh 3x
    if(countMusuhEaten >= 3){
        musuhSpawnInterval -= 2000;
        musuhHeigt += musuhGrowth;
        musuhWidth += musuhGrowth;
        countMusuhEaten = 0;
    }
    
    //spawn musuh setiap interval waktu yang ditentukan
    if(gameTime % musuhSpawnInterval == 0){
        musuhList.push(new component(musuhWidth, musuhHeigt, imgMusuhKanan, Math.random() * gameAreaWidth, Math.random() * gameAreaHeight, "image"));
    }

    //spawn food setiap interval waktu yang ditentukan
    if(gameTime % foodSpawnInterval == 0){
        foodList.push(new component(30, 15, imgFoodKanan, Math.random() * gameAreaWidth, Math.random() * gameAreaHeight, "image"));
    }

    //update randomMovementFlag setiap 1 detik
    if(gameTime % 1000 == 0){
        for(var i=0;i<musuhList.length;i++){
            musuhList[i].randomMovementFlag = Math.floor(Math.random() * 8) + 1;
        }
        for(var i=0;i<foodList.length;i++){
            foodList[i].randomMovementFlag = Math.floor(Math.random() * 8) + 1;
        }
    }
    
    //update object musuh
    for(var i=0;i<musuhList.length;i++){
        if(mainCharacter.crashWith(musuhList[i])){
            if (mainCharacter.biggerThan(musuhList[i])){
                musuhList.splice(i,1);
                mainCharacter.width += musuhValue;
                mainCharacter.height += musuhValue;
                score += musuhValue;
                countMusuhEaten += 1;
                continue;
            }else{
                myGameArea.stop();
                alert("Game over\nScore anda : "+score); 
            }
        }

        //pergerakan musuh secara random
        generateRandomMovement(musuhList[i],imgMusuhKanan,imgMusuhKiri);
        musuhList[i].cekBatasCanvas();
        musuhList[i].update();
    }

    //handle pergerakan dari keyboard user
    if (myGameArea.keys && myGameArea.keys[37]) {mainCharacter.speedX = -1 * mainCharMovementSpeed; mainCharacter.image.src = imgMainCharKiri;}
    if (myGameArea.keys && myGameArea.keys[39]) {mainCharacter.speedX = mainCharMovementSpeed; mainCharacter.image.src = imgMainCharKanan;}
    if (myGameArea.keys && myGameArea.keys[38]) {mainCharacter.speedY = -1 * mainCharMovementSpeed; }
    if (myGameArea.keys && myGameArea.keys[40]) {mainCharacter.speedY = mainCharMovementSpeed; }

    //update mainChar & gameTime
    mainCharacter.newPos();    
    mainCharacter.update();
    gameTime += 20
}

function PopUp(){
    document.getElementById('ac-wrapper').style.display="none"; 
}

var audio = document.getElementById('audio_bgm');
 
document.getElementById('togglebgm').addEventListener('click', function (e)
{
e = e || window.event;
audio.muted = !audio.muted;
e.preventDefault();
}, false);

var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("rule");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}