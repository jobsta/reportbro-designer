String.prototype.reverse = function () { return this.split('').reverse().join(''); };

export function setInputPositiveInteger(el) {
    el.on('keyup', function() {
        var nvalue = this.value.replace(/[^0-9]/g, '');
        if (this.value !== nvalue) this.value = nvalue;
    });
}

export function setInputDecimal(el) {
    el.on('keyup', function() {
        var nvalue = this.value.reverse().replace(/[^0-9\-\.,]|[\-](?=.)|[\.,](?=[0-9]*[\.,])/g, '').reverse();
        var className = this.className;
        var pos = className.indexOf('decimalPlaces');
        if (pos !== -1) {
            pos += 13;
            var pos2 = className.indexOf(' ', pos);
            var places;
            if (pos2 !== -1) {
                places = parseInt(className.substring(pos, pos2), 10);
            } else {
                places = parseInt(className.substr(pos), 10);
            }
            if (!isNaN(places)) {
                pos = nvalue.indexOf('.');
                if (pos === -1) {
                    pos = nvalue.indexOf(',');
                }
                if (pos !== -1 && (nvalue.length - 1 - pos) > places) {
                    nvalue = nvalue.substring(0, pos + places + 1);
                }
            }
        }
        if(this.value !== nvalue) this.value = nvalue;
    });
}

export function checkInputDecimal(val, min, max) {
    let value = parseFloat(val.replace(',', '.'));
    if (isNaN(value)) {
        return '' + min;
    } else if (value < min) {
        return '' + min;
    } else if (value > max) {
        return '' + max;
    }
    return val;
}

export function convertInputToNumber(val) {
    if (typeof(val) === 'number') {
        return val;
    }
    if (typeof(val) === 'string' && val !== '') {
        let rv = parseFloat(val.replace(',', '.'));
        if (!isNaN(rv)) {
            return rv;
        }
    }
    return 0;
}

export function roundValueToInterval(val, interval) {
    let tmp = Math.ceil(val / interval) * interval;
    if ((tmp - val) <= (interval >> 1)) {
        return tmp;
    }
    return tmp - interval;
}

export function roundValueToLowerInterval(val, interval) {
    return Math.floor(val / interval) * interval;
}

export function roundValueToUpperInterval(val, interval) {
    return Math.ceil(val / interval) * interval;
}

export function replaceAll(str, oldVal, newVal) {
    // not the fastest solution but works
    let rv = str;
    if (oldVal !== newVal) {
        while (rv.indexOf(oldVal) !== -1) {
            rv = rv.replace(oldVal, newVal);
        }
    }
    return rv;
}

export function initColorPicker(el, rb, options) {
    var allOptions = {
        showInitial: false,
        preferredFormat: "hex",
        containerClassName: "rbroColorContainer",
        replacerClassName: "rbroColorPicker",
        showPalette: true,
        showButtons: false,
        showSelectionPalette: false,  // disable showing previous selections by user
        palette: rb.getProperty('colors'),
        change: function(color) {
            el.spectrum("hide");
        },
        show: function(color) {
            el.parent().addClass('rbroActive');
        },
        hide: function(color) {
            el.parent().removeClass('rbroActive');
        }
    };
    $.extend( allOptions, options || {} );
    el.spectrum(allOptions);
    el.show();  // show original text input
    el.focus(event => {
        el.parent().addClass('rbroActive');
    });
    el.blur(event => {
        el.parent().removeClass('rbroActive');
    });
}

export function isValidColor(color) {
    // test for empty value (transparent) or # and 6 hex digits
    return !color || /^#[0-9A-F]{6}$/i.test(color);
}

export function insertAtCaret(element, text) {
    if (document.selection) {
        element.focus();
        var sel = document.selection.createRange();
        sel.text = text;
        element.focus();
    } else if (element.selectionStart || element.selectionStart === 0) {
        var startPos = element.selectionStart;
        var endPos = element.selectionEnd;
        var scrollTop = element.scrollTop;
        element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
        element.focus();
        element.selectionStart = startPos + text.length;
        element.selectionEnd = startPos + text.length;
        element.scrollTop = scrollTop;
    } else {
        element.value += text;
        element.focus();
    }
}

export function getDataTransferType(transferType, prefix) {
    let parts = transferType.split('/');
    if (parts.length >= 2 && parts[0] === prefix) {
        return parts[1];
    }
    return null;
}

export function getEventAbsPos(event) {
    if (window.TouchEvent && event.originalEvent instanceof TouchEvent) {
        if (event.touches.length > 0) {
            let lastTouch = event.touches[event.touches.length - 1];
            return { x: lastTouch.pageX, y: lastTouch.pageY };
        }
    } else {
        return { x: event.originalEvent.pageX, y: event.originalEvent.pageY };
    }
    return null;
}
