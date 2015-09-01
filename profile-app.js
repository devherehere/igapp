/**
 * Created by MODEV on 8/19/15 AD.
 */

if (typeof LoginStatus == "undefined") {
  var LoginStatus = {};
  LoginStatus.checked = 0;
  LoginStatus.loggin = 1;
  LoginStatus.logout = 2;
};
var userId = '';
var profileAlbumId = '';
var c;
var ctx;
var imgX = 0;
var imgY = 0;
var app = angular.module('profileApp', ['facebook', 'ngFitText', 'ngAnimate-animate.css']);
app.config(function(FacebookProvider) {
  FacebookProvider.init('1629772610604453')
});
app.controller('profileController', function($scope, Facebook, $timeout, $http) {

  $scope.isLogin = LoginStatus.checked;
  $scope.shareconfirm = false;
  var profileImage = new Image();
  $scope.profileImageURL = 'http://graph.facebook.com/' + userId + '/picture?type=large';
  var mockUpImage = new Image();
  mockUpImage.crossOrigin = "anonymous";
  profileImage.crossOrigin = "anonymous";


  $scope.result = {
    title: 'พิมพ์ข้อความอะไรก็ได้ตรงนี้นะ'
  };
  var mockMargin = [48, 32];
  var getLoginStatus = function() {
    c = document.getElementById("resultCanvas");
    ctx = c.getContext("2d");
    c.width = 1000;
    c.height = 1000;
    ctx.scale(2, 2);
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
    var countPromise = 0;
    var promise = $interval(function() {
      $scope.redraw();
      if (countPromise == 2) {
        $interval.cancel(promise);
      }
      countPromise++;

    }, 1000);
    $scope.$watch('result', function(newVal, oldVal) {

      $scope.redraw();
    }, true);

    Facebook.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        $scope.isLogin = LoginStatus.loggin;
        $scope.userToken = response.authResponse.accessToken;
        Facebook.api('me/', function(res) {
          userId = res.id;
        });
      } else {
        $scope.isLogin = LoginStatus.logout;
      }
    })
  };
  $scope.confirmShare = function() {
    $scope.shareconfirm = !$scope.shareconfirm;
  };
  var mousedown = false;
  var mockImageURLS = ['images/davika-mock@2x.png', 'images/sunny-mock@2x.png'];
  $scope.defaultTexts = ["ตารางงานแน่นมากแต่ไม่อยากพลาด...", "แบตอ่อนทั้งคอมทั้งคน แต่ไม่อยากพลาด..."];
  $scope.loadingText = "loading";
  $scope.selectMock = function(index) {
    $scope.mock = index;

    $scope.redraw();
  };
  $scope.shareResult = function() {

    $scope.isLoading = true;
    var c = document.getElementById("resultCanvas");
    var data = c.toDataURL('image/png');
    var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
    var decodedPng = Base64Binary.decode(encodedPng);
    PostImageToFacebook($scope.userToken, "result.png", "image/png", decodedPng, "http://devherehere.github.io/igapp/", $scope.makeProfile);
  

  };

  $scope.makeProfile = function() {
    $scope.loadingText = "กำลังแชร์รูปภาพ และ ส่งคุณไปยังหน้า Facebook";
    Facebook.api('me/albums?fields=name&limit=100', function(res) {
      angular.forEach(res.data, function(item) {
        if (item.name == 'quiz@gth Photos') {
          profileAlbumId = item.id;
          Facebook.api(item.id + '/photos?fields=images,link', function(res) {
            var targetImage = res.data[0].link;
            window.location = targetImage + '&makeprofile=1';
            $scope.isLoading = false;
          });
        }
      });
    });
  }
  $scope.redraw = function(index) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.rect(0, 0, 500, 500);
    if ($scope.mock == 0) {
      ctx.fillStyle = "#653929";
    } else {
      ctx.fillStyle = "#566980";
    }
    ctx.fill();


    if (index >= 0) {
      $scope.profileImageURL = $scope.profilePictures[index].images[0].source;
      profileImage.src = $scope.profileImageURL;
      profileImage.onload = function() {
        drawProfie(drawMock);
      };
    } else {

      drawProfie(drawMock);
    }
    $scope.browseImage = false;
  };



  var drawProfie = function(onComplete) {
    if (profileImage.width <= profileImage.height) {
      console.log('1');
      imgX = 0;
      imgY = (515 / 2 - (515 * (profileImage.height / profileImage.width)) / 2) + mockMargin[$scope.mock];
      ctx.drawImage(profileImage, imgX, imgY, 500, 500 * (profileImage.height / profileImage.width));
    } else {
      imgX = 515 / 2 - (515 * (profileImage.width / profileImage.height)) / 2;
      imgY = mockMargin[$scope.mock];
      ctx.drawImage(profileImage, imgX, imgY, 500 * (profileImage.width / profileImage.height), 500);
    }
    if (onComplete) {
      onComplete();
    }
  };



  var drawMock = function(onComplete) {
    onComplete = drawText;
    mockUpImage.src = mockImageURLS[$scope.mock];
    mockUpImage.onload = function() {
      ctx.drawImage(this, 0, 0, 500, 500);
      if (onComplete) {
        onComplete();
      }
    };
  };

  var drawText = function() {
    ctx.font = "bold 22px cs_prajadregular";
    ctx.fillStyle = 'black';
    ctx.fillText($scope.result.title, 10, 23);
  };

  $scope.selectProfilePicture = function() {
    $scope.isLoading = true;
    findProfileAlbum();

  };

  function findProfileAlbum() {
    $scope.loadingText = "กำลังโหลดรูปภาพโปรไฟล์";
    Facebook.api('me/albums?fields=name&limit=100', function(res) {
      angular.forEach(res.data, function(item) {
        if (item.name == 'Profile Pictures') {
          profileAlbumId = item.id;
          Facebook.api(item.id + '/photos?fields=images', function(res) {
            console.log(res);
            $scope.profilePictures = res.data;
            $scope.browseImage = true;
            $scope.isLoading = false;
            $scope.loadingText = "";
          });
        }
      });
    });
  }

  $scope.logout = function() {
    Facebook.logout(function(response) {
      getLoginStatus();
    });

  };
  $scope.login = function() {
    console.log('yes');
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

  getLoginStatus();

});

function downloadCanvas(link, canvasId, filename) {
  link.href = document.getElementById(canvasId).toDataURL();
  link.download = filename;
};

var Base64Binary = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  /* will return a  Uint8Array type */
  decodeArrayBuffer: function(input) {
    var bytes = (input.length / 4) * 3;
    var ab = new ArrayBuffer(bytes);
    this.decode(input, ab);

    return ab;
  },

  removePaddingChars: function(input) {
    var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
    if (lkey == 64) {
      return input.substring(0, input.length - 1);
    }
    return input;
  },

  decode: function(input, arrayBuffer) {
    //get last chars to see if are valid
    input = this.removePaddingChars(input);
    input = this.removePaddingChars(input);

    var bytes = parseInt((input.length / 4) * 3, 10);

    var uarray;
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var j = 0;
    if (arrayBuffer)
      uarray = new Uint8Array(arrayBuffer);
    else
      uarray = new Uint8Array(bytes);

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    for (i = 0; i < bytes; i += 3) {
      //get the 3 octects in 4 ascii chars
      enc1 = this._keyStr.indexOf(input.charAt(j++));
      enc2 = this._keyStr.indexOf(input.charAt(j++));
      enc3 = this._keyStr.indexOf(input.charAt(j++));
      enc4 = this._keyStr.indexOf(input.charAt(j++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      uarray[i] = chr1;
      if (enc3 != 64) uarray[i + 1] = chr2;
      if (enc4 != 64) uarray[i + 2] = chr3;
    }

    return uarray;
  }
};






if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
  XMLHttpRequest.prototype.sendAsBinary = function(string) {
    var bytes = Array.prototype.map.call(string, function(c) {
      return c.charCodeAt(0) & 0xff;
    });
    this.send(new Uint8Array(bytes).buffer);
  };
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function PostImageToFacebook(authToken, filename, mimeType, imageData, message, callback) {
  // this is the multipart/form-data boundary we'll use
  var boundary = '----ThisIsTheBoundary1234567890';

  // let's encode our image file, which is contained in the var
  var formData = '--' + boundary + '\r\n'
  formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
  formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
  for (var i = 0; i < imageData.length; ++i) {
    formData += String.fromCharCode(imageData[i] & 0xff);
  }

  formData += '\r\n';
  formData += '--' + boundary + '\r\n';
  formData += 'Content-Disposition: form-data; name="message"\r\n';
  formData += 'Content-Type:text/html; charset=utf-8;\r\n\r\n';
  formData += encode_utf8(message) + '\r\n';
  formData += '--' + boundary + '--\r\n';

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true);
  xhr.onload = xhr.onerror = function() {

    if (callback) {
      callback();
    }

  };
  xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
  xhr.sendAsBinary(formData);
}
