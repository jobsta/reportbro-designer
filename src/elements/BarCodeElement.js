import DocElement from './DocElement';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import Style from '../data/Style';
import * as utils from '../utils';

/**
 * Barcode doc element. Currently only Code-128 is supported.
 * @class
 */
export default class BarCodeElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementImage'), id, 80, 80, rb);
        this.elBarCode = null;
        this.elContent = null;
        this.content = '';
        this.format = 'CODE128';
        this.displayValue = false;
        this.barWidth = '2';
        this.guardBar = false;
        this.errorCorrectionLevel = 'M';
        this.rotate = false;
        this.horizontalAlignment = Style.alignment.left;
        this.verticalAlignment = Style.alignment.top;
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_colspan = '';
        this.spreadsheet_addEmptyRow = false;
        this.setInitialData(initialData);
        this.name = this.rb.getLabel('docElementBarCode');
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        if (this.content !== '') {
            this.updateBarCode();
        }
        this.updateDisplay();
        this.updateStyle();
    }

    setValue(field, value) {
        super.setValue(field, value);
        if (field === 'content' ||field === 'format' || field === 'displayValue' ||
                field === 'barWidth' || field === 'guardBar' ||
                field === 'width' || field === 'height' || field === 'errorCorrectionLevel' || field === 'rotate') {
            this.updateBarCode();
            this.updateDisplay();
            this.updateStyle();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'x', 'y', 'width', 'height', 'content', 'format', 'displayValue',
            'barWidth', 'guardBar', 'errorCorrectionLevel',
            'printIf', 'removeEmptyElement', 'rotate', 'horizontalAlignment', 'verticalAlignment',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_colspan', 'spreadsheet_addEmptyRow'
        ];
    }

    getElementType() {
        return DocElement.type.barCode;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(x);
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = this.rb.toPixel(width);
            this.el.style.height = this.rb.toPixel(height);
        }
    }

    updateStyle() {
        this.elContent.style.textAlign = '';
        this.elContent.className = '';
        this.elContent.classList.add('rbroContentContainerHelper');
        if (!this.rotate) {
            const horizontalAlignment = this.getValue('horizontalAlignment');
            const alignClass = 'rbroDocElementAlign' + horizontalAlignment.charAt(0).toUpperCase() +
                horizontalAlignment.slice(1);
            this.elContent.classList.add(alignClass);
        } else {
            const verticalAlignment = this.getValue('verticalAlignment');
            const alignClass = 'rbroDocElementVAlign' + verticalAlignment.charAt(0).toUpperCase() +
                verticalAlignment.slice(1);
            this.elContent.classList.add(alignClass);
        }

        if (this.format !== 'QRCode' && this.rotate) {
            const verticalAlignment = this.getValue('verticalAlignment');
            const offset_x = -(this.elBarCode.width - this.widthVal) / 2;
            let offset_y = 0;
            if (verticalAlignment === Style.alignment.top) {
                offset_y = -offset_x;
            } else if (verticalAlignment === Style.alignment.bottom) {
                offset_y = offset_x;
            }
            this.elBarCode.style.transform = `translate(${offset_x}px, ${offset_y}px) rotate(90deg)`;
        } else {
            this.elBarCode.style.transform = '';
        }
     }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroBarCodeElement' });
        // content element is needed for overflow hidden which is set for rotated bar code
        this.elContent = utils.createElement('div', { id: `rbro_el_content${this.id}` });
        this.elBarCode = utils.createElement('canvas', { id: `rbro_el_barcode${this.id}` } );
        this.elContent.append(this.elBarCode);
        this.el.append(this.elContent);
        this.appendToContainer();
        this.updateBarCode();
        super.registerEventHandlers();
    }

    remove() {
        super.remove();
    }

    updateBarCode() {
        let size = this.rotate ? this.widthVal : this.heightVal;
        if (this.format === 'QRCode') {
            let content = this.content;
            if (content === '') {
                content = 'https://www.reportbro.com';
            }
            let options = {
                width: size,
                margin: 0,
                errorCorrectionLevel : this.errorCorrectionLevel
            };
            QRCode.toCanvas(this.elBarCode, content, options);
        } else {
            let valid = false;
            // height is total height for bar code element,
            // remove height for value and guard bars if necessary so the bar code plus value and guard bars
            // does not exceed the total height
            if (this.displayValue) {
                size -= 22;
            }
            if ((this.format === 'EAN8' || this.format === 'EAN13') && this.guardBar) {
                size -= 12;
            }
            let options = {
                format: this.format, height: size,
                margin: 0, displayValue: this.displayValue, width: 2
            };
            if (this.format === 'EAN8' || this.format === 'EAN13') {
                options.flat = !this.guardBar;
            } else if (this.format === 'UPC') {
                options.flat = true; // guard bars are currently not supported in reportbro-lib for UPC
            }
            const barWidthVal = utils.convertInputToNumber(this.barWidth);
            if (barWidthVal) {
                options.width = barWidthVal;
            }

            // clear width and height which is set on canvas element when barcode is generated
            this.elBarCode.style.width = '';
            this.elBarCode.style.height = '';

            if (this.content !== '' && this.content.indexOf('${') === -1) {
                try {
                    JsBarcode('#' + this.elBarCode.id, this.content, options);
                    valid = true;
                } catch (ex) {
                }
            }
            if (!valid) {
                // in case barcode cannot be created because of invalid input use default content appropriate
                // for selected format
                let content = '';
                if (this.format === 'CODE39' || this.format === 'CODE128') {
                    content = '12345678';
                } else if (this.format === 'EAN13') {
                    content = '5901234123457';
                } else if (this.format === 'EAN8') {
                    content = '96385074';
                } else if (this.format === 'EAN5') {
                    content = '12345';
                } else if (this.format === 'EAN2') {
                    content = '12';
                } else if (this.format === 'ITF14') {
                    content = '12345678901231';
                } else if (this.format === 'UPC') {
                    content = '036000291452';
                } else if (this.format === 'MSI' ||this.format === 'MSI10' || this.format === 'MSI11' ||
                        this.format === 'MSI1010' || this.format === 'MSI1110' || this.format === 'pharmacode') {
                    content = '1234';
                }
                JsBarcode('#' + this.elBarCode.id, content, options);
            }
        }
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'content', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'BarCodeElement';
    }
}
