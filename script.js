var canvasOffset;
var $painting;
var $degree;
var $current_degree;
var $ms;
var degree = 0;
var picWidth;
var picHeight;
var oX;
var oY;
var stepMs = 10;
var isSpinning = false;
var lineColor;
var lineWidth;
var ctx;
var theCanvas;

$(function () {
  $painting = $('#paint');
  $degree = $('#degree');
  $current_degree = $('#current_degree');
  $ms = $('#ms');
  $save_btn = $('#save_btn');
  var $select_color = $('#select_color')
  var $select_line_width = $('#select_line_width')

  // default
  $ms.val(stepMs);
  $degree.val(0.0174533);

  var shorSide = window.innerWidth > window.innerHeight ? window.innerHeight / 1.5 :window.innerWidth;

  picWidth = shorSide * 0.95;
  picHeight = picWidth;
  oX = picWidth / 2;
  oY = picHeight / 2;

  theCanvas = document.getElementById('paint');
  ctx = theCanvas.getContext('2d');
  theCanvas.width = picWidth;
  theCanvas.height = picHeight;

  canvasOffset = $('#paint').offset();


  //color

  createDefaultCirle();

  console.log("offset left: " + canvasOffset.left + ", offset top: " + canvasOffset.top);

  var letsdraw = false;

    $painting.on('mousemove touchmove', function (e) {
    if (letsdraw === true) {

      var x_base_Weighted;
      var y_base_Weighted;

      if (e.type === 'mousemove') {
        x_base_Weighted = e.pageX - canvasOffset.left;
        y_base_Weighted = e.pageY - canvasOffset.top;
      } else {
        x_base_Weighted = e.originalEvent.changedTouches[0].pageX - canvasOffset.left;
        y_base_Weighted = e.originalEvent.changedTouches[0].pageY - canvasOffset.top;
      }

      var rotrateDegree = degree;

      // convert to relative coordinates
      var x_Relative = x_base_Weighted - oX;
      var y_Relative = oY - y_base_Weighted;

      // rotrate relative
      var x_Relative_Rotrated = x_Relative * Math.cos(rotrateDegree) - y_Relative * Math.sin(rotrateDegree);
      var y_Relative_Rotrated = x_Relative * Math.sin(rotrateDegree) + y_Relative * Math.cos(rotrateDegree);

      // convert to original coordinates
      var xResult = x_Relative_Rotrated + oX;
      var yResult = oY - y_Relative_Rotrated;

      ctx.lineTo(xResult, yResult);
      ctx.stroke();
    }
  });

  $painting.on('mousedown touchstart', function (e) {
    letsdraw = true;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
  });

  $painting.on('mouseup touchend touchcancel', function (e) {
    letsdraw = false;
  });

  $ms.on('input', function (e) {
    stepMs = parseInt(e.target.value);
  })

  $select_color.change(function (e) {
    lineColor = e.target.value;
  });

  $select_line_width.change(function (e) {
    lineWidth = e.target.value;
  });

  $save_btn.on('click', function (e) {
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = $painting[0].toDataURL();
    link.click();
    link.delete;
  });

  $('#size_up').click(function() {
    changeCanvasSize(100);
  });

  $('#size_down').click(function() {
    changeCanvasSize(-100);
  });


});

 function changeCanvasSize(px) {
  if (picWidth + px <= 0 || picHeight + px <= 0 ||
    picWidth + px >= window.innerWidth || picHeight + px >= window.innerHeight / 1.5) {
    return;
  }
  picWidth = picWidth + px;
  picHeight = picHeight + px;
  oX = picWidth / 2;
  oY = picHeight / 2;
  theCanvas.width = picWidth;
  theCanvas.height = picHeight;
  createDefaultCirle();
  canvasOffset = $('#paint').offset();
}

function createDefaultCirle() {
  createCirle(ctx, picWidth / 2, "white");
}

function createCirle(ctx, radius, color) {

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(oX, oY, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(oX, 0);
  ctx.lineTo(oX, picHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, oY);
  ctx.lineTo(picWidth, oY);
  ctx.stroke();

}

function rotratePainting() {

  degree = parseFloat($degree.val()) + degree;
  $painting.css('transform', "rotate(" + degree * (180 / Math.PI) + "deg)")
  $current_degree.html(degree);

}

async function rotrateLoop() {

  if (isSpinning) {
    isSpinning = false;
    return;
  }

  isSpinning = true;

  while (isSpinning) {
    rotratePainting();
    await delay(parseInt($ms.val()));
  }

}

const delay = async (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));
