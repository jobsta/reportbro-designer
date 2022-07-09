String.prototype.reverse = function () { return this.split('').reverse().join(''); };

/**
 * Creates HTML element specified by tagName.
 * @param {String} tagName - specifies the type of element to be created.
 * @param {?Object=} props - optional map containing properties for new element, e.g. id or class name.
 * @param {?String=} textContent - optional text content of the new element.
 * @returns {HTMLElement} the created DOM element.
 */
export function createElement(tagName, props, textContent) {
    const el = document.createElement(tagName);
    if (props) {
        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                el.setAttribute(prop, props[prop]);
            }
        }
    }
    if (textContent) {
        el.textContent = textContent;
    }
    return el;
}

/**
 * Removes all children of specified element.
 * @param {HTMLElement} el - element which will be emptied, e.g. all child nodes are removed.
 */
export function emptyElement(el) {
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

/**
 * Shortcut to create a label and append it to specified element.
 * @param {HTMLElement} el - element where label will be appended to.
 * @param {String} label - label text.
 * @param {?String=} forAttr - optional 'for' id of label.
 * @param {?Object=} props - optional map containing properties for new label, e.g. id or class name.
 */
export function appendLabel(el, label, forAttr, props) {
    const properties = props || {};
    if (forAttr) {
        properties['for'] = forAttr;
    }
    el.append(createElement('label', properties, label + ':'));
}

export function getElementOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
    };
}

export function setInputPositiveInteger(el) {
    el.addEventListener('keyup', (event) => {
        const val = event.target.value;
        const nvalue = val.replace(/[^0-9]/g, '');
        if (val !== nvalue) event.target.value = nvalue;
    });
}

export function setInputDecimal(el) {
    el.addEventListener('keyup', (event) => {
        const val = event.target.value;
        let nvalue = val.reverse().replace(/[^0-9\-\.,]|[\-](?=.)|[\.,](?=[0-9]*[\.,])/g, '').reverse();
        const className = this.className;
        let pos = className ? className.indexOf('decimalPlaces') : -1;
        if (pos !== -1) {
            pos += 13;
            const pos2 = className.indexOf(' ', pos);
            let places;
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
        if (val !== nvalue) event.target.value = nvalue;
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
    let inputId = elInput.getAttribute('id');
    let instance = {
        shown: false,
        paletteId: inputId + '_select'

    };
    let colors = rb.getProperty('colors');
    let elColorPalette = createElement('div', { class: 'rbroColorPalette rbroHidden' });
    for (let color of colors) {
        elColorPalette.append(createElement(
            'span', { style: `color: ${color}`, 'data-value': color, class: 'rbroColorPaletteItem' }));
    }
    if (allowEmpty) {
        elColorPalette.append(createElement(
            'span', { 'data-value': 'clear', class: 'rbroClearColorPalette' }, rb.getLabel('clear')));
    }
    elColorPalette.addEventListener('click', (event) => {
        let color = event.target.dataset.value;
        if (color) {
            if (color === 'clear') {
                elInput.value = '';
                elInput.dispatchEvent(new Event('change'));
            } else {
                elInput.value = color;
            }
            elInput.dispatchEvent(new Event('change'));
        }
        elColorPalette.classList.add('rbroHidden');
        event.stopImmediatePropagation();
    });
    let elColorButton = createElement('div', { id: instance.paletteId, class: 'rbroColorPicker' });
    elColorButton.addEventListener('click', (event) => {
        elColorPalette.classList.toggle('rbroHidden');
        instance.shown = !instance.shown;
    });
    elContainer.prepend(elColorButton);
    elContainer.append(elColorPalette);

    elInput.addEventListener('focus', (event) => {
        elContainer.classList.add('rbroActive');
    });
    elInput.addEventListener('blur', (event) => {
        elContainer.classList.remove('rbroActive');
    });

    instance.documentClickListener = function(event) {
        let targetId = event.target.id;
        // close all open color palettes except if it was just opened by clicking the select button
        if (instance.shown && targetId !== instance.paletteId) {
            elColorPalette.classList.add('rbroHidden');
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
    if (window.TouchEvent && event instanceof TouchEvent) {
        if (event.touches.length > 0) {
            let lastTouch = event.touches[event.touches.length - 1];
            return { x: lastTouch.pageX, y: lastTouch.pageY };
        }
    } else {
        return { x: event.pageX, y: event.pageY };
    }
    return null;
}
