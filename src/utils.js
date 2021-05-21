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
export function createColorPicker(elContainer, elInput, allowEmpty, rb) {
    let inputId = elInput.attr('id');
    let instance = {
        shown: false,
        paletteId: inputId + '_select'

    };
    let colors = rb.getProperty('colors');
    let strColorPalette = '<div class="rbroColorPalette rbroHidden">';
    for (let color of colors) {
        strColorPalette += `<span style="color: ${color}" data-value="${color}" class="rbroColorPaletteItem"></span>`;
    }
    if (allowEmpty) {
        strColorPalette += `<span data-value="clear" class="rbroClearColorPalette">${rb.getLabel('clear')}</span>`;
    }
    strColorPalette += '</div>';
    let elColorPalette = $(strColorPalette)
        .click(event => {
            let color = event.target.dataset.value;
            if (color) {
                if (color === 'clear') {
                    elInput.val('').trigger('change');
                } else {
                    elInput.val(color).trigger('change');
                }
            }
            elColorPalette.addClass('rbroHidden');
            event.stopImmediatePropagation();
        });
    let elColorButton = $(`<div id="${instance.paletteId}" class="rbroColorPicker"></div>`)
        .click(event => {
            elColorPalette.toggleClass('rbroHidden');
            instance.shown = !instance.shown;
        });
    elContainer.prepend(elColorButton);
    elContainer.append(elColorPalette);

    elInput.focus(event => {
        elContainer.addClass('rbroActive');
    });
    elInput.blur(event => {
        elContainer.removeClass('rbroActive');
    });

    instance.documentClickListener = function(event) {
        let targetId = event.target.id;
        // close all open color palettes except if it was just opened by clicking the select button
        if (instance.shown && targetId !== instance.paletteId) {
            elColorPalette.addClass('rbroHidden');
            instance.shown = false;
        }
    };
    document.addEventListener('click', instance.documentClickListener);
    instance.destroy = function() {
        if (instance.documentClickListener) {
            document.removeEventListener('click', instance.documentClickListener);
            instance.documentClickListener = null;
        }
    };
    return instance;
}

export function destroyColorPicker(instance) {
    document.removeEventListener(instance.documentClickListener);
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
