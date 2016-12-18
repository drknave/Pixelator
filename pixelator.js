window.onload = function() {

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		document.getElementById('fileApiSupport').innerHTML = "Browser supports File API :)";
	}	else {
		document.getElementById('fileApiSupport').innerHTML = "Browser does not support File API :(";
	}
}
	
function uploadFileChanged(event) {
	
	var uploadFile = event.target.files[0];
	
	if(uploadFile.type.match('image.*')) {
		var reader = new FileReader();

		var uploadedImage = document.getElementById('uploadedImage');
		uploadedImage.title = uploadFile.name;

		reader.onload = function(event) {
			uploadedImage.src = event.target.result;
			roundImageDimensions(uploadedImage);
			setUpCommonFactorOptions(uploadedImage);
		};

		reader.readAsDataURL(uploadFile);
	} else {
		alert("Only images can be uploaded.");
	}
}

function roundImageDimensions(image) {
	
	var roundingThreshold = document.getElementById('resizeThresholdSelect').value;

	var heightRemainder = image.height % roundingThreshold;
	var widthRemainder = image.width % roundingThreshold;

	image.height = image.height - heightRemainder;
	image.width = image.width - widthRemainder;
}

function roundingThresholdChanged() {
	var originalImage = document.getElementById('uploadedImage');
	roundImageDimensions(originalImage);
	setUpCommonFactorOptions(originalImage);
}

function setUpCommonFactorOptions(image) {

	var commonFactors = [];

	if(image !== null && image.width !== null && image.height !== null) {

		var minimumDimension = Math.min(image.width, image.height);

		for(var i = 1; i <= minimumDimension; i++) {
			if(image.width % i === 0 && image.height % i === 0) {
				commonFactors.push(i);
			}
		}
	}

	setCommonFactorOptionsOnUI(commonFactors);
}

function setCommonFactorOptionsOnUI(commonFactors) {

	var pixelationFactorSelect = document.getElementById('pixelationFactor');

	if(pixelationFactorSelect.options !== null) {
		for(var j = 0; j < pixelationFactorSelect.options.length; j++) {
			pixelationFactorSelect.remove(j);
		}
	}

	for(var i = 0; i < commonFactors.length; i++) {
		var option = document.createElement('option');
		option.value = commonFactors[i];
		option.innerHTML = commonFactors[i];
		document.getElementById('pixelationFactor').appendChild(option);
	}
}

function pixelationButtonClicked() {

	var originalImage = document.getElementById('uploadedImage');
	var canvas = document.getElementById('pixelatedImageCanvas');
	canvas.width = originalImage.width;
	canvas.height = originalImage.height;

	var context = canvas.getContext('2d');
	context.drawImage(originalImage, 0, 0);

	var blobSize = document.getElementById('pixelationFactor').value;
	var rows = canvas.height / blobSize;
	var columns = canvas.width / blobSize;

	for(var y = 0; y < rows; y++) {
		for(var x = 0; x < columns; x++) {
			var imageData = context.getImageData(x * blobSize, y * blobSize, blobSize, blobSize);
			pixelateBlob(imageData, blobSize);
			context.putImageData(imageData, x * blobSize, y * blobSize);
		}
	}
}

function pixelateBlob(imageData, blobSize) {

	var rSum = 0;
	var gSum = 0;
	var bSum = 0;

	for(var i = 0; i < imageData.data.length; i += 4) {
		rSum += imageData.data[i];
		gSum += imageData.data[i + 1];
		bSum += imageData.data[i + 2];
	}

	var pixelCount = imageData.data.length / 4;

	var rAverage = rSum / pixelCount;
	var gAverage = gSum / pixelCount;
	var bAverage = bSum / pixelCount;

	for(var i = 0; i < imageData.data.length; i += 4) {
		imageData.data[i] = rAverage;
		imageData.data[i + 1] = gAverage;
		imageData.data[i + 2] = bAverage;
	}
}
