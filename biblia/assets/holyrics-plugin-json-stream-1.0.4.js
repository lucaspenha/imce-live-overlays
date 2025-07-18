if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

var refreshIsRunning = false;
var defaultValues = {
    type: 'empty',
    color: '#FAFAFA',
    background: '#000000',
    font: 'Arial',
    bold: false,
    halign: 'center',
    valign: 'middle',
    alert_color: '#FAFAFA',
    alert_background: '#000000',
    alert_font: 'Arial',
    alert_bold: false,
    alert_height: "10%",
    alert_velocity: 40,
    text: '',
    alert: '',
    img64: '',
    img_format: 'jpeg',
    img_id: '',
    page_count: '',
    header: '',
    font_max_rows: 10,
    custom_class: '',
    $system_var_music_title: '',
    $system_var_music_artist: '',
    $system_var_music_author: '',
    $system_var_music_copyright: '',
    $system_var_text_title: ''
};
var fields = {};
var alert_velocity = 40;
var valign_diff = 0;
var vpadding = 8;
var currentText = '';
var currentAlert = '';
var currentImg64 = '';
var currentPageCount = '';
var htmlType = 0;
var countError = 0;
var transparentMode = false;
var imgDisplayNone = null;
var displayErrors = '_true';
var cssHash = "0";

//transition
var transition_on = false;

function bodyOnload() {
    var keys = Object.keys(defaultValues);
    for (var i = 0; i < keys.length; i++) {
        fields[keys[i]] = defaultValues[keys[i]];
    }
    //refresh();
    setInterval('refresh()', 100);
}

function refresh() {
    if (refreshIsRunning === true) {
        return null;
    }
    refreshIsRunning = true;
    $.ajax({
        type: 'GET',
        url: 'text.json',
        data: {
            html_type: htmlType,
            img_id: fields['img_id'],
            css_hash: cssHash
        },
        cache: false,
        async: true,
        dataType: 'json',
        timeout: 2000,
        success: function (response) {
            try {
                if (response.reload === "_true") {
                    location.reload();
                }
            } catch (err) {
                //ignore
            }
            try {
                refreshCallback(response.map);
            } catch (err) {
                //ignore
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
            refreshCallback('ajax-error');
        }
    });
}

var current_json = null;

function refreshCallback(json) {
    try {
        if (transition_on === true) {
            return null;
        }
        if (json != null && json != 'ajax-error') {
            var json_str = JSON.stringify(json);
            if (current_json !== null && json_str == current_json) {
                return null;
            }
        }
        current_json = json_str;
        fillFields(json);
        update();
    } catch (err) {
	//ignore
    } finally {
        //setTimeout('refresh()', ((json == "ajax-error") ? 2000 : 100));
        var delay = (json == "ajax-error") ? 2000 : 100;
        setTimeout(function() {
            refreshIsRunning = false;
        }, delay);
    }
}

function fillFields(json) {
    if (json == null) {
        return null;
    }
    if (json == "ajax-error") {
        countError++;
        if (countError <= 5) {
            return null;
        }
        if (displayErrors === '_true') {
            fields['text'] = 'plugin offline';
        }
        //fields['alert'] = '';
    } else {
        try {
            displayErrors = json['display_errors'];
            if (displayErrors === "_false" && json['is_error'] === '_true') {
                return null;
            }
        } catch (e) {
            //ignore
        }
        countError = 0;
        var keys = Object.keys(fields);
        for (var i = 0; i < keys.length; i++) {
            var value = json[keys[i]];
            if (value === null || value === undefined) {
                fields[keys[i]] = defaultValues[keys[i]];
            } else {
                if (keys[i] == 'img64' && value == 'equals') {
                    continue;
                }
                fields[keys[i]] = value;
            }
        }
    }
    setupFields();
}

function setupFields() {
    if (fields['alert'] == null) {
        fields['alert'] = '';
    }
    fields['text'] = fields['text'].split('\n');
    var textToDisplay = fields['text'].join('<br>');
    textToDisplay = textToDisplay.replaceAll("script", "");
    fields['text'] = "<span class='" + getClassFromType(fields['type'], textToDisplay) + " " + fields['custom_class'] + "'>" + textToDisplay + "</span>";
    if (fields['header'].length > 0) {
        var header = fields['header'].split('\n');
        fields['text'] = "<span class='header bible-header-custom' style='font-size: 70%'>" + header.join('<br>') + "</span>" + fields['text'];
    }
    if (fields['type'] === 'MUSIC') {
        if (fields['page_count'].length > 0) {
            fields['text'] += "<span class='page-count page-count-custom'>" + fields['page_count'] + "</span>";
        }
    }
    if (fields['bold']) {
        fields['text'] = "<b>" + fields['text'] + "</b>";
    }
    if (fields['img64'] != null && fields['img64'].length > 0) {
        var imageFormat = getImageFormat(fields['img_format']);
        fields['text'] = "<img src='data:image/" + imageFormat + ";base64," + fields['img64'] + "' class='image-custom " + getClassFromType(fields['type'], "") + "' id='img64'>";
    }
    if (fields['alert_bold'] && fields['alert'] != null && fields['alert'].length > 0) {
        fields['alert'] = "<b>" + fields['alert'] + "</b>";
    }
}

function updateOnResize() {
    try {
        currentText += '<span></span>';
        currentAlert += '<span></span>';
        currentImg64 += '<span></span>';
        update();
    } catch (err) {
        //ignore
    }
}
function update() {
    updateStyle();
    updateExtraInfo();
    var alertUpdated = updateAlert();
    updateDisplay(alertUpdated);
}

function updateExtraInfo() {
    try {
        var arr = ['music_title', 'music_artist', 'music_author', 'music_copyright', 'text_title'];
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            var element = document.getElementById(arr[i]);
            var newValue = escapeHTML(fields["$system_var_" + arr[i]]);
            if (element.innerHTML != newValue) {
                element.innerHTML = newValue;
            }
        }
    } catch (e) {
        //ignore
    }
}

function updateStyle() {
    try {
        var display = document.getElementById("display");
        var alert = document.getElementById("alert");

        display.style.color = fields['color'];
        display.style.textAlign = fields['halign'];

        if (fields['background'] == '#FFFFFF' || isImgTransparency()) {
            display.style.backgroundColor = null;
            transparentMode = true;
        } else {
            display.style.backgroundColor = fields['background'];
        }

        document.getElementById("visible").style.fontFamily = fields['font'];
        document.getElementById("invisible").style.fontFamily = fields['font'];

        alert.style.fontFamily = fields['alert_font'];
        alert.style.color = fields['alert_color'];
        alert.style.backgroundColor = fields['alert_background'];
        updateAlertFontSize();

        updateVAlign();
    } catch (err) {
        //ignore
    }
}

function isImgTransparency() {
    try {
        if (imgDisplayNone === null) {
            var img64 = document.getElementById('img64');
            if (img64 == null) {
                return fields['img64'] != null && fields['img64'].length > 0;
            }
            imgDisplayNone = getComputedStyle(img64, null).display == 'none';
        }
        return transparentMode && imgDisplayNone && fields['background'] == 'black';
    } catch (err) {
        return false;
    }
}

function updateVAlign() {
    var visibleJQuery = jQuery('#visible');
    var y = vpadding;
    switch (fields['valign']) {
        case 'middle':
            y += (valign_diff / 2.0);
            break;
        case 'bottom':
            y += valign_diff;
            break;
    }
    var oldY = parseInt(visibleJQuery.css("padding-top"), 10);
    if (oldY !== y) {
        visibleJQuery.css({paddingTop: y + 'px'});
    }
}

function updateAlert() {
    var divAlert = document.getElementById("alert");

    var showAlert = fields['alert'].length > 0;
    var currentAlertNotEmpty = currentAlert.length > 0;
    var alertEquals = currentAlert === fields['alert'];
    var durationEquals = alert_velocity === fields['alert_velocity'];

    var _return = false;
    if (showAlert !== currentAlertNotEmpty || !alertEquals) {
        _return = true;
        updateAlertHeight(showAlert);
        updateAlertFontSize();
    }
    if (!alertEquals) {
        currentAlert = fields['alert'];
        divAlert.innerHTML = "<span id='animation'>" + fields['alert'] + "</span>";
        document.getElementById("alert-invisible").innerHTML = "<span style='white-space:nowrap'>" + fields['alert'] + "</span>";
    }
    if (!alertEquals || !durationEquals) {
        updateAlertAnimation();
    }
    return _return;
}

function updateAlertHeight(showAlert) {
    var divDisplay = document.getElementById("display");
    var divAlert = document.getElementById("alert");
    var alertHeight = parseInt(fields['alert_height'], 10);
    if (showAlert) {
        divDisplay.style.height = (100 - alertHeight) + '%';
        divAlert.style.height = alertHeight + '%';
        if (fields['background'] == fields['alert_background']) {
            divAlert.style.borderTop = '3px ' + fields['color'] + ' dashed';
        } else {
            divAlert.style.borderTop = '0px black solid';
        }
    } else {
        divDisplay.style.height = '100%';
        divAlert.style.height = '0%';
        divAlert.style.borderTop = '0px black solid';
    }
    divAlert.style.top = ((100 - alertHeight) + '%');
}

function updateAlertFontSize() {
    try {
        var divAlert = document.getElementById("alert");
        var divAlertInvisible = document.getElementById("alert-invisible");
        divAlertInvisible.style.font = fields['alert_font'];

        var divAlertInvisibleJQuery = jQuery('#alert-invisible');
        var height = parseInt(jQuery('#alert').height(), 10);
        var maxHeight = Math.max(height - 16, 2);
        var fontSize = maxHeight;
        do {
            divAlertInvisible.style.fontSize = --fontSize + 'px';
        } while (fontSize > 2 && parseInt(divAlertInvisibleJQuery.height(), 10) > maxHeight);
        if (parseInt(divAlert.style.fontSize, 10) != fontSize) {
            divAlert.style.fontSize = fontSize + 'px';
            divAlert.style.lineHeight = height + 'px';
        }
    } catch (err) {
        //ignore
    }
}

function updateDisplay(forceUpdate) {
    updateText(forceUpdate);
    updatePageCount();
}

function updateText(forceUpdate) {
    if (!forceUpdate && (fields['text'] === currentText || fields['text'] === currentImg64)) {
        return false;
    }
    if (fields['text'].startsWith('<img src=\'data:image')) {
        updateImg64();
        return false;
    }
    vpadding = 8;

    var divVisible = document.getElementById("visible");
    var divInvisible = document.getElementById("invisible");
    var divVisibleJQuery = jQuery('#visible');
    var divInvisibleJQuery = jQuery('#invisible');
    var divDisplayJQuery = jQuery('#display');

    var hpadding = parseInt(divVisibleJQuery.css("padding-left"), 10);
    if (hpadding != 2) {
        divVisibleJQuery.css("padding-left", "2%");
        divVisibleJQuery.css("padding-right", "2%");
    }
    var rows = fields['text'].split('<br>');

    var maxHeight = parseInt(divDisplayJQuery.height(), 10) - (vpadding * 2);
    var maxWidth = parseInt(divVisibleJQuery.width(), 10) + 8;
    var fontSize = maxHeight / Math.max(rows.length, Math.max(100.0 / fields['font_max_rows'], 3));
    
    divInvisible.innerHTML = fields['text'];
    divInvisible.style.fontSize = fontSize + 'px';
        
    //deprecated
    /*
    var minFontSize = 4;
    do {
        fontSize -= 2;
        divInvisible.style.fontSize = fontSize + "px";
        var currentHeight = parseInt(divInvisibleJQuery.height(), 10);
        var currentWidth = parseInt(divInvisible.scrollWidth, 10);
    } while (fontSize > minFontSize && (currentHeight > maxHeight || currentWidth > maxWidth));
     */
    //binary search | fast method
    setupFontHeightDivInvisible(fontSize, maxWidth, maxHeight, divInvisible, divInvisibleJQuery);
    var displayHeight = divDisplayJQuery.height();
    
    var animation_delay = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--animation_out_delay'));
    if (animation_delay > 0) {
        currentText = fields['text'];
        currentImg64 = '';
        var transition_text_pending = divInvisible.innerHTML;
        var transition_font_size_pending = divInvisible.style.fontSize;
        if (transition_on === false) {
            transition_on = true;

            divVisibleJQuery.addClass("animation_out");
            setTimeout(function () {
                transition_on = false;

                divVisibleJQuery.removeClass("animation_out");
                jQuery('#visible').height(displayHeight + 'px');
                valign_diff = 0;
                if (displayHeight > divInvisibleJQuery.height() + (vpadding * 2)) {
                    valign_diff = (displayHeight - (divInvisibleJQuery.height() + (vpadding * 2)));
                }
                vpadding = 8;
                updateVAlign();
                divVisible.style.fontSize = transition_font_size_pending;
                divVisible.innerHTML = transition_text_pending;
            }, animation_delay);
        }
        return null;
    }
    jQuery('#visible').height(displayHeight + 'px');
    divVisible.innerHTML = '';
    valign_diff = 0;
    if (displayHeight > divInvisibleJQuery.height() + (vpadding * 2)) {
        valign_diff = (displayHeight - (divInvisibleJQuery.height() + (vpadding * 2)));
    }
    vpadding = 8;
    updateVAlign();

    divVisible.style.fontSize = divInvisible.style.fontSize;
    divVisible.style.fontSize = fontSize;

    currentText = fields['text'];
    currentImg64 = '';
    divVisible.innerHTML = divInvisible.innerHTML;
}

function setupFontHeightDivInvisible(initialFontSize, maxWidth, maxHeight, divInvisible, divInvisibleJQuery) {
    var w = 0, h = 0;
    var candidate = initialFontSize - 2;
    divInvisible.style.fontSize = candidate + "px";
    h = parseInt(divInvisibleJQuery.height(), 10);
    w = parseInt(divInvisible.scrollWidth, 10);
    if ((h <= maxHeight && w <= maxWidth)) {
        return null;
    }
    var minFontSize = 4;
    var range = initialFontSize + 10;
    var middle = parseInt(range / 2);
    var left = ((range % 2 == 0) ? (middle - 1) : middle);
    var right = ((range % 2 == 0) ? middle : middle++);
    do {
        candidate = (middle - 1);
        divInvisible.style.fontSize = candidate + "px";
        h = parseInt(divInvisibleJQuery.height(), 10);
        w = parseInt(divInvisible.scrollWidth, 10);
        if ((maxWidth == w) && (maxHeight == h)) {
            return null;
        }
        if ((w > maxWidth) || (h > maxHeight)) {
            if (left == 0) {
                for (var i = candidate; i > 0; i--) {
                    divInvisible.style.fontSize = i + "px";
                    h = parseInt(divInvisibleJQuery.height(), 10);
                    w = parseInt(divInvisible.scrollWidth, 10);
                    if ((w <= maxWidth) && (h <= maxHeight)) {
                        return null;
                    }
                }
                candidate = minFontSize;
                divInvisible.style.fontSize = minFontSize + "px";
                return null;
            }
            right = parseInt(left / 2);
            left = ((left % 2 == 0) ? (right - 1) : right);
            middle -= (right + 1);
        } else {
            if (right == 0) {
                for (var i = candidate; i <= range; i++) {
                    divInvisible.style.fontSize = i + "px";
                    h = parseInt(divInvisibleJQuery.height(), 10);
                    w = parseInt(divInvisible.scrollWidth, 10);
                    if ((w > maxWidth) || (h > maxHeight)) {
                        divInvisible.style.fontSize = (i - 1) + "px";
                        return null;
                    }
                }
                candidate = range;
                divInvisible.style.fontSize = range + "px";
                return null;
            }
            if (right % 2 == 0) {
                right = parseInt(right / 2);
                left = (right - 1);
            } else {
                right = parseInt(right / 2);
                left = right;
            }
            middle += (left + 1);
        }
    } while (true);
}

function updatePageCount() {
    try {
        var div = document.getElementById('page-count');
        var arr = fields['page_count'].split(';');
        if (fields['type'] != 'MUSIC' || arr[2].length <= 0) {
            div.style.visibility = 'hidden';
            return false;
        }
        if (true || fields['page_count'] === currentPageCount) {
            return false;
        }
        var divInvisible = document.getElementById('page-count-invisible');
        var divInvisibleJQuery = jQuery('#page-count-invisible');
        var height = parseInt(divInvisibleJQuery.height(), 10);
        var maxHeight = Math.max(height, 2);
        var fontSize = maxHeight;
        divInvisible.innerHTML = arr[2];
        do {
            divInvisible.style.fontSize = --fontSize + 'px';
        } while (fontSize > 2 && parseInt(divInvisibleJQuery.height(), 10) > maxHeight);
        if (parseInt(div.style.fontSize, 10) != fontSize) {
            div.style.fontSize = fontSize + 'px';
            div.style.lineHeight = height + 'px';
        }
        currentPageCount = fields['page_count'];
        div.innerHTML = divInvisible.innerHTML;
        div.style.visibility = 'visible';
    } catch (err) {
        //ignore
    }
}

function updateHeader() {
    try {
        var div = document.getElementById('page-count');
        var arr = fields['page_count'].split(';');
        if (fields['type'] != 'MUSIC' || arr[2] <= 0) {
            div.style.visibility = 'hidden';
            return false;
        }
        var divInvisible = document.getElementById('page-count-invisible');
        var divInvisibleJQuery = jQuery('#page-count-invisible');
        var height = parseInt(divInvisibleJQuery.height(), 10);
        var maxHeight = Math.max(height, 2);
        var fontSize = maxHeight;
        divInvisible.innerHTML = arr[2];
        do {
            divInvisible.style.fontSize = --fontSize + 'px';
        } while (fontSize > 2 && parseInt(divInvisibleJQuery.height(), 10) > maxHeight);
        if (parseInt(div.style.fontSize, 10) != fontSize) {
            div.style.fontSize = fontSize + 'px';
            div.style.lineHeight = height + 'px';
        }
        div.innerHTML = divInvisible.innerHTML;
        div.style.visibility = 'visible';
    } catch (err) {
        //ignore
    }
}

function updateImg64() {
    var divVisibleJQuery = jQuery('#visible');

    var hpadding = parseInt(divVisibleJQuery.css("padding-left"), 10);
    if (hpadding > 0) {
        divVisibleJQuery.css("padding-left", "0%");
        divVisibleJQuery.css("padding-right", "0%");
    }

    var divVisible = document.getElementById("visible");
    currentText = '';
    currentImg64 = fields['text'];
    divVisible.innerHTML = fields['text'];
    valign_diff = 0;
    vpadding = 0;
    divVisibleJQuery.height(jQuery('#display').height() + 'px');
    updateVAlign();
}

function updateAlertAnimation() {
    alert_velocity = fields['alert_velocity'];
    var pps = alert_velocity * 1.5;
    var animation = document.getElementById('animation');
    if (animation == null) {
        return;
    }
    var animationJQuery = $('#animation');
    var alertWidth = $('#alert').width();

    var textWidth = animation.offsetWidth - parseInt(animationJQuery.css("padding-left"), 10);

    if (textWidth >= alertWidth - 16) {
        animationJQuery.css("padding-left", "100%");
        var duration = ((alertWidth + textWidth) / pps) + 's';
        animation.style.animationDuration = duration;
        animationJQuery.css("-webkit-animation-duration", duration);
    } else {
        animation.style.webkitAnimationName = "none";
        animation.style.animationName = "none";
        animationJQuery.css("padding-left", "0%");
    }
}

function getClassFromType(type, textToDisplay) {
    if (type == null) {
        return "empty_slide";
    }
    switch (type) {
        case "MUSIC":
            return "music_slide";
        case "TEXT":
            return "text_slide";
        case "BIBLE":
            return "bible_slide";
        case "ANNOUNCEMENT":
            return "announcement_slide";
        case "IMAGE":
            return "image_slide";
        case "CP":
            if (textToDisplay === null || textToDisplay === '') {
                return "communication_panel_slide";
            }
            if (textToDisplay.indexOf("<br>") >= 0) {
                return "communication_panel_slide";
            }
            var regex = /((^\d{1,2}:\d{2})|(^\d{1,2}:\d{2}(:\d{2})?))/gm;
            if (textToDisplay.search(regex) >= 0) {
                return "communication_panel_slide communication_panel_clock_slide";
            } else {
                return "communication_panel_slide";
            }
        default:
            return "empty_slide";
    }
}

function getImageFormat(imageFormat) {
    if (imageFormat == null) {
        return "jpeg";
    }
    switch (imageFormat) {
        case "jpeg":
        case "png":
        case "gif":
            return imageFormat;
        default:
            return "jpeg";
    }
}