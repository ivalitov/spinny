var canvasOffset;
var $painting;
var $degree;
var $current_degree;
var $ms;
var degree = 0;
var picWidth = 400;
var picHeight = 400;
var stepMs = 10;
var oX = picWidth / 2;
var oY = picHeight / 2;
var isSpinning = false;
var lineColor;
var lineWidth;
var ctx;

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

  var theCanvas = document.getElementById('paint');
  ctx = theCanvas.getContext('2d');
  theCanvas.width = picWidth;
  theCanvas.height = picHeight;

  canvasOffset = $('#paint').offset();


  //color

  createDefaultCirle();

  console.log("offset left: " + canvasOffset.left + ", offset top: " + canvasOffset.top);

  var letsdraw = false;

  $painting.mousemove(function (e) {
    if (letsdraw === true) {

      var rotrateDegree = degree;

      var x_base_Weighted = e.pageX - canvasOffset.left;
      var y_base_Weighted = e.pageY - canvasOffset.top;

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

  $painting.mousedown(function () {
    letsdraw = true;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
  });

  $(window).mouseup(function () {
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


});

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
