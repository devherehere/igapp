var app = angular.module('post',[]);

app.controller( 'UserAction' ,[ '$scope' , 'BuildPost' ,function( $scope , BuildPost ){

$scope.templateIndex = 0;
$scope.indexOfCover = 0;
$scope.result = {
  title: BuildPost.result.title ,
  subtitle: BuildPost.result.subtitle,
  msg: ""
};

angular.element(document).ready(function(){
  $scope.init();
});

$scope.init = function () {
  BuildPost.drawBackground($scope.templateIndex);
  BuildPost.drawText($scope);
}

$scope.change = function () {
  BuildPost.redraw($scope);
}

$scope.selectTheme = function(index) {
  $scope.templateIndex = index;
  BuildPost.redraw($scope);
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
  //downloadCanvas(this, 'resultCanvas', 'cover-football.png');
};
  //downloadCanvas(this, 'resultCanvas', 'football.png');
}])

.factory('BuildPost',function () {
  var BuildPost = [];

  BuildPost.ctx = document.getElementById('resultCanvas').getContext("2d");

  BuildPost.result = {
    title: 'รับแน่น กลางนิ่ง หน้าคม2',
    subtitle: 'จะเจอทีมไหนก็ไม่กลัว เพราะเรารวมใจเป็นหนึ่ง2',
    msg: ""
  };


  BuildPost.coverSize = [{
    x: 640,
    y: 640
  }, {
    x: 851,
    y: 314
  }];

  BuildPost.coversProperty = [{
    backgroundImage: "images/zigoig.jpg",
    primaryColor: "black",
    secondaryColor: "white", //#DEBB2C
  }, {
    backgroundImage: "images/zigocover.jpg",
    primaryColor: "black",
    secondaryColor: "white"
  }];

  var bg = new Image();

  function getImg(fon) {
    BuildPost.ctx.clearRect(0, 0, (obj).width, (obj).height);
    BuildPost.ctx.fillStyle = 'rgba(0,0,0,1.0)';
    BuildPost.ctx.fillRect(0, 0, 40, 40);
    BuildPost.ctx.font = '20px ' + fon;
    BuildPost.ctx.textBaseline = "top";
    BuildPost.ctx.fillStyle = 'rgba(255,255,255,1.0)';
    BuildPost.ctx.fillText('\u0630', 18, 5);
    return BuildPost.ctx.getImageData(0, 0, 40, 40);
  };

   BuildPost.drawBackground = function(index) {
     canvas = document.getElementById('resultCanvas')
    bg.src = BuildPost.coversProperty[index].backgroundImage;
    if (bg.width > 640) {
      canvas.width = 851;
      canvas.height = 314;
      BuildPost.coverSize.x = 851;
      BuildPost.coverSize.y = 314;
    } else {
      canvas.width = 640;
      canvas.height = 640;
      BuildPost.coverSize.x = 640;
      BuildPost.coverSize.y = 640;
    }

    BuildPost.ctx.drawImage(bg, 0, 0, BuildPost.coverSize.x, BuildPost.coverSize.y);

  }

   BuildPost.drawText = function($scope) {

    var shiftY = 0;
    var recY = 0;
    var txtY = 0;

    var centerPos = {
      x: BuildPost.coverSize[$scope.templateIndex].x / 2,
      y: BuildPost.coverSize[$scope.templateIndex].y / 2 + shiftY
    };

    var text = $scope.result.title;
    BuildPost.ctx.fillStyle = BuildPost.coversProperty[$scope.templateIndex].primaryColor;
    BuildPost.ctx.textAlign = 'center';
    BuildPost.ctx.lineWidth = 1;

    BuildPost.ctx.font = "normal 96px Fontcraft";
    if ($scope.templateIndex == 1) {
      BuildPost.ctx.font = "normal 55px Fontcraft"; //106
    }
    var textWidth = (BuildPost.ctx.measureText(text).width);

    //for cover
    var shift = 0
    if (bg.width > 640) {
       shift = 210;
    }

    if ((textWidth + shift) > BuildPost.coverSize[$scope.templateIndex].x) {
      var fontsize = 138;
      while ((textWidth + shift) > BuildPost.coverSize[$scope.templateIndex].x - 80) {
        BuildPost.ctx.font = "normal " + fontsize + "px Fontcraft";
        fontsize -= 2;
        textWidth = (BuildPost.ctx.measureText(text).width);


        if (textWidth < BuildPost.coverSize[$scope.templateIndex].x - (80 + shift)) { //80
          BuildPost.ctx.fillStyle = "white";
          BuildPost.ctx.fillText(text, centerPos.x, centerPos.y - 30); //30
        }
      }

    } else {
      if ($scope.indexOfCover == 1) {
        BuildPost.ctx.fillStyle = "white";
        BuildPost.ctx.fillText(text, centerPos.x, centerPos.y - 25); //32
      } else {
        BuildPost.ctx.fillStyle = "white";
        BuildPost.ctx.fillText(text, centerPos.x, centerPos.y - 25); //30
      }
    }


    BuildPost.ctx.font = "normal 42px MAX_PINJOHN";
    if (bg.width > 640) { //for cover
      BuildPost.ctx.font = "normal 38px MAX_PINJOHN";
    }

    var subText = $scope.result.subtitle;
    var subtextWidth = (BuildPost.ctx.measureText(subText).width);
    var rectHeight = 46;

    if (bg.width > 640) {
      rectHeight = 38;
    }

    BuildPost.ctx.beginPath();

    if (bg.width > 640) {
      recY = centerPos.y - 15
      txtY = centerPos.y + 15;
    } else {
      recY = centerPos.y - 5;
      txtY = centerPos.y + 30;
    }

    BuildPost.ctx.rect((centerPos.x - subtextWidth / 2) - 20, recY, subtextWidth + 40, rectHeight);
    BuildPost.ctx.fillStyle = BuildPost.coversProperty[$scope.templateIndex].primaryColor;
    BuildPost.ctx.fill();
    BuildPost.ctx.fillStyle = BuildPost.coversProperty[$scope.templateIndex].secondaryColor;
    BuildPost.ctx.fillText(subText, centerPos.x, txtY);

  }

  BuildPost.redraw = function($scope) {

    BuildPost.ctx.clearRect(0, 0, BuildPost.ctx.width, BuildPost.ctx.height);
    BuildPost.ctx.rect(0, 0, BuildPost.ctx.width, BuildPost.ctx.height);
    BuildPost.drawBackground($scope.templateIndex);
    BuildPost.drawText($scope);
  }

     BuildPost.setDimension = function() {
      coverSize = templateSize[$scope.templateIndex];
      if (window.devicePixelRatio == 2 || true) {
        c.width = coverSize.x * 2;
        c.height = coverSize.y * 2;
        c.style.width = coverSize + "px";
        BuildPost.ctx.scale(2, 2);

      }
    }

  return BuildPost;
});
