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
        const className = event.target.className;
        let pos = className ? className.indexOf('decimalPlaces') : -1;
        if (pos !== -1) {
            pos += 13;
            const pos2 = className.indexOf(' ', pos);
            let places;
            if (pos2 !== -1) {
                places = parseInt(className.substring(pos, pos2), 10);
            } else {
                places = parseInt(className.substring(pos), 10);
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
        const sel = document.selection.createRange();
        sel.text = text;
        element.focus();
    } else if (element.selectionStart || element.selectionStart === 0) {
        const startPos = element.selectionStart;
        const endPos = element.selectionEnd;
        const scrollTop = element.scrollTop;
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

/**
 * Read image data from given image and call loadCallback with image data and filename.
 *
 * The image will be converted to WebP format to reduce image size. if imageMaxSize property is set and
 * the image width or height is larger than this value the image will be downscaled so that
 * width/height are both <= maxImageSize.
 *
 * @param {File} file - image file to load.
 * @param {function(string, string)} loadCallback - callback is executed with image data and filename when loading
 * image was successful.
 * @param {ReportBro} rb - ReportBro instance.
 */
export function readImageData(file, loadCallback, rb) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const maxImageSize = rb.getProperty('imageMaxSize');
            if (maxImageSize && (img.width > maxImageSize || img.height > maxImageSize)) {
                if (img.width > img.height) {
                    img.height = img.height * (maxImageSize / img.width);
                    img.width = maxImageSize;
                } else {
                    img.width = img.width * (maxImageSize / img.height);
                    img.height = maxImageSize;
                }
            }

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let imageData = canvas.toDataURL('image/webp');
            if (imageData.substring(0, 15) !== 'data:image/webp') {
                if (rb.getProperty('imageRequireWebPFormat')) {
                    imageData = null;
                    alert(rb.getLabel('docElementLoadImageWebPErrorMsg'));
                } else {
                    if (imageData.length > e.target.result.length) {
                        imageData = e.target.result;
                    }
                }
            }

            if (imageData) {
                loadCallback(imageData, file.name);
            }
        }
        img.src = e.target.result;
    };
    fileReader.onerror = function(e) {
        alert(rb.getLabel('docElementLoadImageErrorMsg'));
    };
    fileReader.readAsDataURL(file);
}

/**
 * Populate option tags for all available styles.
 * @param {Element} elStyle - dom element of the styles drop down. If there are existing options they will be removed.
 * @param {String} styleType - if set then only styles which match the given type will be populated, e.g.
 * a text properties panel should only should text styles.
 * @param {?String} selectedValue - selected style id, if set it is used to set the option for this style as selected.
 * @param {ReportBro} rb - ReportBro instance.
 */
export function populateStyleSelect(elStyle, styleType, selectedValue, rb) {
    const styles = rb.getStyles();
    emptyElement(elStyle);
    elStyle.append(createElement('option', { value: '' }, rb.getLabel('styleNone')));
    for (let style of styles) {
        if (!styleType || style.getValue('type') === styleType) {
            const option = createElement('option', { value: style.getId() }, style.getName());
            if (selectedValue && selectedValue === String(style.getId())) {
                option.selected = true;
            }
            elStyle.append(option);
        }
    }
}


class Token {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}

Token.type = {
    operator: 'operator',
    bracketOpen: 'bracketOpen',
    bracketClose: 'bracketClose',
    boolean: 'boolean',
    number: 'number',
    string: 'string',
    undefined: 'undefined',
    field: 'field',
};

Token.operator = {
    and: '&&',
    or: '||',
    equal: '==',
    notEqual: '!=',
    negate: '!',
};

/**
 * Extract token list of input string.
 *
 * A token can be value (string, boolean, etc.) or an operator or bracket to group expressions.
 * If an object field is referenced then the actual value will be set for the token in case the obj parameter
 * is set, otherwise the value contains the field name.
 *
 * @param {string} input - input string containing a logical expression.
 * @param {?DocElement} obj - object containing values which can be accessed by field reference, if null then
 * a token with the field name will be added for field reference, otherwise the token contains
 * the actual field value.
 * @returns {Token[]} list of tokens
 */
export function tokenize(input, obj) {
    let scanner = 0;
    const tokens = [];

    while (scanner < input.length) {
        const char = input[scanner];

        if (/[0-9]/.test(char)) {
            let digits = '';

            while (scanner < input.length && /[0-9.]/.test(input[scanner])) {
                digits += input[scanner++];
            }

            const number = parseFloat(digits);
            tokens.push(new Token(number, Token.type.number));
            continue;
        }

        if (/[a-zA-Z]/.test(char)) {
            // parse identifier, can be any of those:
            // * true / false: boolean value
            // * type: will be replaced by object type
            // * field: used to reference object field value
            let word = '';

            while (scanner < input.length && /[a-zA-Z0-9_]/.test(input[scanner])) {
                word += input[scanner++];
            }

            if (word === 'true') {
                tokens.push(new Token(true, Token.type.boolean));
            } else if (word === 'false') {
                tokens.push(new Token(false, Token.type.boolean));
            } else if (word === 'docElementType') {
                if (obj !== null) {
                    // insert object type as string
                    tokens.push(new Token(obj.getElementType(), Token.type.string));
                } else {
                    // add string placeholder for object type
                    tokens.push(new Token('', Token.type.string));
                }
            } else {
                if (obj === null) {
                    // return token for field with field name as value
                    tokens.push(new Token(word, Token.type.field));
                } else {
                    // get object field value by field name and set value for token
                    const val = obj.getValue(word);
                    let tokenType;
                    if (typeof val === 'number') {
                        tokenType = Token.type.number;
                    } else if (typeof val === 'string') {
                        tokenType = Token.type.string;
                    } else if (typeof val === 'boolean') {
                        tokenType = Token.type.boolean;
                    } else {
                        tokenType = Token.type.undefined;
                    }
                    tokens.push(new Token(val, tokenType));
                }
            }
            continue;
        }

        if (char === "'") {
            // parse string
            let str = '';
            scanner++;
            while (scanner < input.length && input[scanner] !== "'") {
                str += input[scanner++];
            }
            if (scanner >= input.length) {
                throw new Error(`Unterminated string token in input ${input}`);
            }

            tokens.push(new Token(str, Token.type.string));
            scanner++;
            continue;
        }

        if (char === '(' || char === ')') {
            // parse brackets
            tokens.push(new Token(char, char === '(' ? Token.type.bracketOpen : Token.type.bracketClose));
            scanner++;
            continue;
        }

        if (/[!=|&]/.test(char)) {
            // parse operator
            scanner++;
            if (char === '!' && (scanner >= input.length || input[scanner] !== '=')) {
                // unary operator, only supported single char operator
                tokens.push(new Token(Token.operator.negate, Token.type.operator));
                continue;
            }
            if (scanner < input.length) {
                const nextChar = input[scanner];
                if (char === '!' && nextChar === '=') {
                    tokens.push(new Token(Token.operator.notEqual, Token.type.operator));
                    scanner++;
                } else if (char === '=' && nextChar === '=') {
                    tokens.push(new Token(Token.operator.equal, Token.type.operator));
                    scanner++;
                } else if (char === '|' && nextChar === '|') {
                    tokens.push(new Token(Token.operator.or, Token.type.operator));
                    scanner++;
                } else if (char === '&' && nextChar === '&') {
                    tokens.push(new Token(Token.operator.and, Token.type.operator));
                    scanner++;
                } else {
                    throw new Error(`Invalid token ${nextChar} at position ${scanner}`);
                }
            } else {
                throw new Error(`Invalid token ${char} at end of input`);
            }
            continue;
        }

        if (char === ' ') {
            scanner++;
            continue;
        }
        throw new Error(`Invalid token ${char} at position ${scanner}`);
    }
    return tokens;
}

/**
 * Convert list of tokens from infix notation to Reverse Polish Notation.
 * @param {Token[]} tokens - input tokens in infix notation order.
 * @returns {Token[]} tokens in RPN order
 */
function toRPN(tokens) {
    const operators = [];
    const out = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === Token.type.operator) {
            while (shouldUnwindOperatorStack(operators, token)) {
                out.push(operators.pop());
            }
            operators.push(token);
        } else if (token.type === Token.type.bracketOpen) {
            operators.push(token);
        } else if (token.type === Token.type.bracketClose) {
            while (operators.length > 0 && operators[operators.length - 1] !== Token.type.bracketOpen) {
                out.push(operators.pop());
            }
            operators.pop();
        } else {
            out.push(token);
        }
    }

    for (let i = operators.length - 1; i >= 0; i--) {
        out.push(operators[i]);
    }
    return out;
}

const precedence = { '!': 4, '!=': 3, '==': 3, '||': 2, '&&': 1 };

function shouldUnwindOperatorStack(operators, nextToken) {
    if (operators.length === 0) {
        return false;
    }

    const lastOperator = operators[operators.length - 1];
    return precedence[lastOperator.value] >= precedence[nextToken.value];
}

/**
 * Evaluate tokens in Revers Polish Notation order.
 * @param {Token[]} rpn - tokens in RPN order.
 * @returns {boolean} evaluated expression result as boolean value
 */
function evalRPN(rpn) {
    const stack = [];

    for (let i = 0; i < rpn.length; i++) {
        const token = rpn[i];

        if (token.type === Token.type.operator) {
            stack.push(operate(token, stack));
            continue;
        }

        // token is an operand (string, boolean, number)
        stack.push(token);
    }

    const finalToken = stack.pop();
    // if result is not of type boolean (e.g. by testing if a field value is set)
    // then convert result to boolean
    if (finalToken.type === Token.type.boolean) {
        return finalToken.value;
    } else {
        return !!finalToken.value;
    }
}

/**
 * Perform operation of given operator on stack.
 * @param {Token} operator
 * @param {Token[]} stack
 * @returns {Token} result as token with boolean type.
 */
function operate(operator, stack) {
    const a = stack.pop();
    const val1 = a.value;
    let val2;
    // negate is the only supported unary operator and therefor does not need a second operand
    if (operator.value !== Token.operator.negate) {
        const b = stack.pop();
        val2 = b.value;
    }

    // the returned token result is always a boolean value
    switch (operator.value) {
        case Token.operator.and:
            return new Token(val2 && val1, Token.type.boolean);
        case Token.operator.or:
            return new Token(val2 || val1, Token.type.boolean);
        case Token.operator.equal:
            return new Token(val2 === val1, Token.type.boolean);
        case Token.operator.notEqual:
            return new Token(val2 !== val1, Token.type.boolean);
        case Token.operator.negate:
            return new Token(!val1, Token.type.boolean);
        default:
            throw new Error(`Invalid operator: ${operator}`);
    }
}

/**
 * Simple expression evaluator for logical expressions.
 *
 * Based on https://github.com/chidiwilliams/expression-evaluator
 * described in this post: https://chidiwilliams.com/post/evaluator/
 * Adapted to our needs by evaluating logical instead of mathematical expressions.
 *
 * Example: "format == 'EAN8' || format == 'EAN13'"
 * Quotes are not part of the expression and only show beginning and end of input string.
 * This example evaluates to true if obj.format contains the string "EAN8" or "EAN13"
 *
 * @param {string} input - expression to evaluate, the expression can contain fields (identifier name) of
 * the given object as well as numbers, true/false, strings (with apostrophe) and the special
 * identifier *type* which is used to access the element type of the given object.
 * @param {DocElement} obj - object containing values which can be accessed by field reference.
 * @returns {boolean} evaluated expression result as boolean value
 */
export function evaluateExpression(input, obj) {
    return evalRPN(toRPN(tokenize(input, obj)));
}
