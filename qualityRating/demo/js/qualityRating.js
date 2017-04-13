window.app = window.app || {};

$(function () {
	var dataGridQualityRating = ko.observableArray();
	
	function parseDataZip() {
		var _zip = JSZip();

		_zip.loadAsync(dataZip, {
			base64: true,
			optimizedBinaryString: true
		}).then(function (dataZip) {
			_zip.file(new RegExp(".json"))[0].async("string")
                .then(function (jsonData) {
                	window.app = JSON.parse(jsonData);
                	dataGridQualityRating(window.app.data.dataGridQualityRating);
                })
		});
	};

	parseDataZip();

	$(".progression-single").mediaelementplayer({
		stretching: "auto",
		audioHeight: 35,
		startVolume: 1,
		features: ["playpause", "current", "progress", "duration", "tracks", "volume"],
		isVideo: false
	});

	$.when(
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/ca-gregorian.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/numbers.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/currencies.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/likelySubtags.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/timeData.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/weekData.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/currencyData.json"),
        $.getJSON($("base")[0].href + "devextreme/js/unicode-cldr/numberingSystems.json")
    ).then(function () {
    	return [].slice.apply(arguments, [0]).map(function (result) {
    		return result[0];
    	});
    }).then(
        Globalize.load
        ).then(function () {
        	Globalize.locale("ru");

        	var lightPalette = ["#e55253", "#cbc87b", "#9ab57e", "#7e4452", "#e8c267", "#565077", "#6babac", "#ad6082"],
                greenColor = "#9ab57e",
                redColor = "#e55253",
                blueColor = "#565077",
                yellowColor = "#e8c267",
                labelColor = "#43474b",
                gridColor = "#e9e9e9",
                fontColor = "#7f7f7f",
                labelTextColor = "black",
                viewModel = {
                	dataGridQualityRating: dataGridQualityRating,
                	gridQualityRatingOptions: {
                		dataSource: dataGridQualityRating,
                		columnAutoWidth: true,
                		allowColumnResizing: true,
                		showRowLines: true,
                		showBorders: true,
                		rowAlternationEnabled: false,
                		hoverStateEnabled: true,
                		wordWrapEnabled: true,
                		stateStoring: {
                			enabled: true,
                			type: "localStorage",
                			storageKey: "gridQualityRating"
                		},
                		searchPanel: {
                			visible: true
                		},
                		selection: {
                			mode: "multiple",
                			allowSelectAll: true,
                			showCheckBoxesMode: "none"
                		},
                		export: {
                			enabled: true,
                			allowExportSelectedData: true
                		},
                		pager: {
                			visible: true,
                			allowedPageSizes: [5, 10, 15, 50],
                			showInfo: true,
                			showNavigationButtons: true,
                			showPageSizeSelector: true
                		},
                		columnChooser: {
                			enabled: true,
                			mode: "select"
                		},
                		paging: {
                			pageSize: 50
                		},
                		groupPanel: {
                			visible: true
                		},
                		grouping: {
                			autoExpandAll: false,
                			contextMenuEnabled: true
                		},
                		commonColumnSettings: { alignment: "center" },
                		columns: [{
                			dataField: "a",
                			caption: "Дата",
                			width: 85
                		}, {
                			dataField: "b",
                			caption: "Время",
                			width: 80
                		}, {
                			dataField: "c",
                			caption: "Клиент",
                		}, {
                			dataField: "d",
                			caption: "Сотрудник",
                		}, {
                			dataField: "e",
                			caption: "Внешняя линия",
                		}, {
                			dataField: "f",
                			caption: "Время разговора",
                			width: 85
                		}, {
                			dataField: "",
                			caption: "Запись",
                			width: 60
                		}],
                		onCellPrepared: function (options) {
                			var _fieldHtml = "";

                			if (options.column.caption == "Запись" && options.rowType == "data") {
                				if (options.data.g != "") {
                					_fieldHtml = "<div class='rec-actions' " + "file='" + options.data.g + "'>" +
										 "<div class='icon play action play-rec' title='Воспроизвести запись'></div>" +
										 "<div class='icon save action save-rec' title='Сохранить запись'></div></div>";
                					options.cellElement.html(_fieldHtml);
                				}
                			}
                		},
                		onInitialized: function (options) {
                			$("#gridSiteCalls").on("click", ".play-rec", function (event) {
                				var _cel = $(this).parent(),
                                    _hash = _cel.attr("file"),
                                    _urlFile = "",
                                    _dateCall = undefined,
                                    _player = $("#player");

                				event.stopPropagation();

                				if (_hash.indexOf("mp3") == -1) {
                					for (var i = 0; i < window.app.data.dataGridQualityRating.length; i++) {
                						if (window.app.data.dataGridQualityRating[i].g == _hash) {
                							var _datemas = window.app.data.dataGridQualityRating[i].a.substr(0, 10).split(".");

                							_dateCall = _datemas[2] + "/" + _datemas[1] + "/" + _datemas[0] + " " + window.app.data.dataGridQualityRating[i].b;
                						};
                					};

                					if (new Date(_dateCall) > new Date(window.app.options.urlAtsDate)) {
                						_urlFile = window.app.options.urlAtsNew + _hash;
                					} else {
                						_urlFile = window.app.options.urlAts + _hash;
                					};
                				} else {
                					_urlFile = _hash;
                				}

                				if (_hash.indexOf("mp3") == -1) {
                					$.ajax({
                						type: "GET",
                						url: "http://193.227.134.65/js/copy-records.php?link=" + _urlFile,
                						dataType: "jsonp",
                						success: function (_data) {
                							_cel.attr("file", _data[0]);
                							_player.attr("src", _data[0]);
                							$(".responsive-audio").css("display", "");
                						},
                						error: function (xhr, ajaxOptions, thrownError) {
                							//если ошибка аякса, то выведем ее
                							console.log(xhr.status);
                							console.log(thrownError);
                						}
                					});
                				} else {
                					_player.attr("src", _urlFile);
                				}
                			});

                			$("#gridSiteCalls").on("click", ".save-rec", function (event) {
                				var _cel = $(this).parent(),
                                    _hash = _cel.attr("file"),
                                    _urlFile = "";

                				event.stopPropagation();

                				if (_hash.indexOf("mp3") == -1) {
                					for (var i = 0; i < window.app.data.dataGridQualityRating.length; i++) {
                						if (window.app.data.dataGridQualityRating[i].g == _hash) {
                							var _datemas = window.app.data.dataGridQualityRating[i].a.substr(0, 10).split(".");

                							_dateCall = _datemas[2] + "/" + _datemas[1] + "/" + _datemas[0] + " " + window.app.data.dataGridQualityRating[i].b;
                						};
                					};

                					if (new Date(_dateCall) > new Date(window.app.options.urlAtsDate)) {
                						_urlFile = window.app.options.urlAtsNew + _hash;
                					} else {
                						_urlFile = window.app.options.urlAts + _hash;
                					};
                				} else {
                					_urlFile = _hash;
                				}

                				if (_hash.indexOf("mp3") == -1) {
                					$.ajax({
                						type: "GET",
                						url: 'http://193.227.134.65/js/copy-records.php?link=' + _urlFile,
                						dataType: "jsonp",
                						success: function (_data) {
                							_urlFile = _data[0];
                							_cel.attr("file", _urlFile);
                							location.href = "http://193.227.134.65/js/export-records.php?link=" + _urlFile;
                						},
                						error: function (xhr, ajaxOptions, thrownError) {
                							//если ошибка аякса, то выведем ее
                							console.log(xhr.status);
                							console.log(thrownError);
                						}
                					});
                				} else {
                					location.href = "http://193.227.134.65/js/export-records.php?link=" + _urlFile;
                				}
                			});

                			$(".responsive-audio").css("display", "none");
                		}
                	}
                };
        	ko.applyBindings(viewModel, document.getElementById("page"));
        });
});