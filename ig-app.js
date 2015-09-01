app.controller('igController', function($scope, Facebook, $timeout, $interval) {

  $scope.isLogin = LoginStatus.checked;
  $scope.loadingText = "loading";
  $scope.indexOfCover = 0;
  $scope.result = {
    title: 'รับแน่น กลางนิ่ง หน้าคม',
    subtitle: 'จะเจอทีมไหนก็ไม่กลัว เพราะเรารวมใจเป็นหนึ่ง',
    msg: ""
  };

  var templateSize = [{
    x: 640,
    y: 640
  }, {
    x: 851,
    y: 314
  }];

  $scope.templateIndex = 0;
  $scope.selectOnHTMLindex = 0;

  var coverSize = [{
    x: 640,
    y: 640
  }, {
    x: 851,
    y: 314
  }];
  var coversProperty = [{
    backgroundImage: "images/zigoig.jpg",
    primaryColor: "black",
    secondaryColor: "white", //#DEBB2C
  }, {
    backgroundImage: "images/zigocover.jpg",
    primaryColor: "black",
    secondaryColor: "white"
  }];

  var bg = new Image();

  $scope.selectTheme = function(index) {
    $scope.indexOfCover = index;
    drawBackground();
    $scope.redraw();
  };
  $scope.confirmShare = function() {
    $scope.shareconfirm = !$scope.shareconfirm;
  };

  $scope.shareResult = function(){
      $scope.isLoading = true;
      var c = document.getElementById("resultCanvas");
      var data = c.toDataURL('image/png');
      var encodedPng = data.substring(data.indexOf(',')+1,data.length);
      var decodedPng = Base64Binary.decode(encodedPng);
      PostImageToFacebook($scope.userToken,"result.png","image/png",decodedPng,$scope.result.msg,$scope.makeCover());
  };

  $scope.downloadImage = function() {
    downloadCanvas(this, 'resultCanvas', 'cover-football.png');
  };

  var drawBackground = function(onComplete) {
    canvas = document.getElementById('resultCanvas'); //change dimension after choose
    bg.src = coversProperty[$scope.indexOfCover].backgroundImage;
    if (bg.width > 640) {
      canvas.width = 851;
      canvas.height = 314;
      coverSize.x = 851;
      coverSize.y = 314;
    } else {
      canvas.width = 640;
      canvas.height = 640;
      coverSize.x = 640;
      coverSize.y = 640;
    }

    ctx.drawImage(bg, 0, 0, templateSize[$scope.indexOfCover].x, templateSize[$scope.indexOfCover].y);
    if (onComplete) {
      onComplete();
    }
  };

  var drawText = function(onComplete) {

    var shiftY = 0;
    var recY = 0;
    var txtY = 0;

    var centerPos = {
      x: coverSize.x / 2,
      y: coverSize.y / 2 + shiftY
    };

    var text = $scope.result.title;
    ctx.fillStyle = coversProperty[$scope.indexOfCover].primaryColor;
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;

    ctx.font = "normal 96px Fontcraft";
    if ($scope.indexOfCover == 1) {
      ctx.font = "normal 55px Fontcraft"; //106
    }
    var textWidth = (ctx.measureText(text).width);

    //for cover
    var shift = 0
    if (bg.width > 640) {
       shift = 210;
    }

    if ((textWidth + shift) > coverSize.x) {
      var fontsize = 138;
      while ((textWidth + shift) > coverSize.x - 80) {
        ctx.font = "normal " + fontsize + "px Fontcraft";
        fontsize -= 2;
        textWidth = (ctx.measureText(text).width);


        if (textWidth < coverSize.x - (80 + shift)) { //80
          ctx.fillStyle = "white";
          ctx.fillText(text, centerPos.x, centerPos.y - 30); //30
        }
      }

    } else {
      if ($scope.indexOfCover == 1) {
        ctx.fillStyle = "white";
        ctx.fillText(text, centerPos.x, centerPos.y - 25); //32
      } else {
        ctx.fillStyle = "white";
        ctx.fillText(text, centerPos.x, centerPos.y - 25); //30
      }
    }


    ctx.font = "normal 42px MAX_PINJOHN";
    if (bg.width > 640) { //for cover
      ctx.font = "normal 38px MAX_PINJOHN";
    }

    var subText = $scope.result.subtitle;
    var subtextWidth = (ctx.measureText(subText).width);
    var rectHeight = 46;

    if (bg.width > 640) {
      rectHeight = 38;
    }

    ctx.beginPath();

    if (bg.width > 640) {
      recY = centerPos.y - 15
      txtY = centerPos.y + 15;
    } else {
      recY = centerPos.y - 5;
      txtY = centerPos.y + 30;
    }

    ctx.rect((centerPos.x - subtextWidth / 2) - 20, recY, subtextWidth + 40, rectHeight);
    ctx.fillStyle = coversProperty[$scope.indexOfCover].primaryColor;
    ctx.fill();
    ctx.fillStyle = coversProperty[$scope.indexOfCover].secondaryColor;
    ctx.fillText(subText, centerPos.x, txtY);

  }

  $scope.redraw = function(index) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.rect(0, 0, c.width, c.height);
    drawBackground();
    drawText();
  };


  $scope.logout = function() {
    Facebook.logout(function(response) {
      getLoginStatus();
    });

  };

  $scope.login = function() {
    Facebook.login(function(response) {
      if (response.status == 'connected') {
        $scope.isLogin = LoginStatus.loggin;

        getLoginStatus();
      }
    }, {
      scope: 'publish_actions,user_photos',
      return_scopes: true
    })
  };



  var setDimension = function() {
    coverSize = templateSize[$scope.templateIndex];
    if (window.devicePixelRatio == 2 || true) {
      c.width = coverSize.x * 2;
      c.height = coverSize.y * 2;
      c.style.width = coverSize + "px";
      ctx.scale(2, 2);

    }

  };
  var getLoginStatus = function() {
    c = document.getElementById("resultCanvas");
    ctx = c.getContext("2d");

    setDimension();
    $scope.redraw();
    $scope.$watch('result', function(newVal, oldVal) {
      $scope.redraw();
    }, true);
    $interval(function() {
      $scope.redraw();
    }, 3000);
    Facebook.getLoginStatus(function(response) {

      if (response.status === 'connected') {
        $scope.isLogin = LoginStatus.loggin;
        $scope.userToken = response.authResponse.accessToken;

        Facebook.api('me/', function(res) {

        });

      } else {
        console.log();
        $scope.isLogin = LoginStatus.logout;
      }
    })
  };

  setTimeout(function() {
    if (!IsLoadedFonts('MAX_PINJOHN')) {

    }
  }, 100);
  getLoginStatus();

  document.getElementById('download').addEventListener('click', function() {
    downloadCanvas(this, 'resultCanvas', 'football.png');
  }, false);
}); //end angular script


function IsLoadedFonts() {
  var Args = arguments;
  var obj = document.getElementById('fontCanvas');
  var ctx = obj.getContext("2d");
  var baseFont = (/chrome/i.test(navigator.userAgent)) ? 'time new roman' : 'arial';
  //................
  function getImg(fon) {
    ctx.clearRect(0, 0, (obj).width, (obj).height);
    ctx.fillStyle = 'rgba(0,0,0,1.0)';
    ctx.fillRect(0, 0, 40, 40);
    ctx.font = '20px ' + fon;
    ctx.textBaseline = "top";
    ctx.fillStyle = 'rgba(255,255,255,1.0)';
    ctx.fillText('\u0630', 18, 5);
    return ctx.getImageData(0, 0, 40, 40);
  };
  //..............
  for (var i1 = 0; i1 < Args.length; i1++) {
    data1 = getImg(Args[i1]);
    data2 = getImg(baseFont);
    var isLoaded = false;
    //...........
    for (var i = 0; i < data1.data.length; i++) {
      if (data1.data[i] != data2.data[i]) {
        isLoaded = true;
        break;
      }
    }
    //..........
    if (!isLoaded)
      return false;
  }
  return true;
};
