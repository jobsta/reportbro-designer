import DocElement from './DocElement';
import SetValueCmd from '../commands/SetValueCmd';
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
        this.content = '';
        this.format = 'CODE128';
        this.displayValue = true;
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;
        this.setInitialData(initialData);
        this.name = this.rb.getLabel('docElementBarCode');
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    setup() {
        super.setup();
        this.createElement();
        if (this.content !== '') {
            this.updateBarCode();
        }
        this.updateDisplay();
        this.updateStyle();
    }

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);
        if (field === 'content' ||field === 'format' || field === 'displayValue' || field === 'height') {
            this.updateBarCode();
            this.updateDisplay();
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'x', 'y', 'height', 'content', 'format', 'displayValue',
            'printIf', 'removeEmptyElement',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
    }

    getElementType() {
        return DocElement.type.barCode;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y),
                width: this.rb.toPixel(width), height: this.rb.toPixel(height) };
            this.el.css(props);
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['N', 'S'];
    }

    getXTagId() {
        return 'rbro_bar_code_element_position_x';
    }

    getYTagId() {
        return 'rbro_bar_code_element_position_y';
    }

    getHeightTagId() {
        return 'rbro_bar_code_element_height';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroBarCodeElement"></div>`);
        this.elBarCode = $('<canvas></canvas>');
        this.el.append(this.elBarCode);
        this.appendToContainer();
        this.updateBarCode();
        super.registerEventHandlers();
    }

    remove() {
        super.remove();
    }

    updateBarCode() {
        let valid = false;
        let options = { format: this.format, height: this.displayValue ? (this.heightVal - 22) : this.heightVal,
                margin: 0, displayValue: this.displayValue };
        if (this.content !== '' && this.content.indexOf('${') === -1) {
            try {
                this.elBarCode.JsBarcode(this.content, options);
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
            } else if (this.format === 'MSI' ||this.format === 'MSI10' || this.format === 'MSI11' ||
                    this.format === 'MSI1010' || this.format === 'MSI1110' || this.format == 'pharmacode') {
                content = '1234';
            }
            this.elBarCode.JsBarcode(content, options);
        }
        this.widthVal = this.elBarCode.width();
        this.width = '' + this.widthVal;
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
        if (this.content.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_bar_code_element_content', 'content',
                utils.replaceAll(this.source, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
        if (this.printIf.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_bar_code_element_print_if', 'printIf',
                utils.replaceAll(this.printIf, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }
}
