import AddDeleteStyleCmd from "../commands/AddDeleteStyleCmd";
import Command from "../commands/Command";
import SetValueCmd from "../commands/SetValueCmd";
import DocElement from "../elements/DocElement";
import * as utils from "../utils";

/**
 * Style data object. Contains all text styles (alignment, border, etc.):
 * @class
 */
export default class Style {
    constructor(id, initialData, rb) {
        this.rb = rb;
        this.id = id;
        this.name = rb.getLabel('style');
        this.panelItem = null;
        this.errors = [];

        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.strikethrough = false;
        this.horizontalAlignment = Style.alignment.left;
        this.verticalAlignment = Style.alignment.top;
        this.textColor = '#000000';
        this.backgroundColor = '';
        this.font = rb.getProperty('defaultFont');
        this.fontSize = 12;
        this.lineSpacing = 1;
        this.borderColor = '#000000';
        this.borderWidth = '1';
        this.borderAll = false;
        this.borderLeft = false;
        this.borderTop = false;
        this.borderRight = false;
        this.borderBottom = false;
        this.paddingLeft = '';
        this.paddingTop = '';
        this.paddingRight = '';
        this.paddingBottom = '';

        this.borderWidthVal = 0;

        this.setInitialData(initialData);
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return [
            'id', 'name', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment',
            'textColor', 'backgroundColor', 'font', 'fontSize', 'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'
        ];
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    getValue(field) {
        return this[field];
    }

    setValue(field, value) {
        this[field] = value;

        if (field.indexOf('border') !== -1) {
            if (field === 'borderWidth') {
                this.borderWidthVal = utils.convertInputToNumber(value);
            }
            Style.setBorderValue(this, field, '', value, this.rb);
        }

        if (field !== 'name') {
            for (let docElement of this.rb.getDocElements(true)) {
                docElement.updateChangedStyle(this.getId());
            }
        }
    }

    /**
     * Adds commands to command group parameter to set changed property value
     * for all document elements using this style.
     *
     * This should be called when a property of this style was changed so the property
     * will be updated for all document elements as well.
     *
     * @param {String} field - changed field of this style.
     * @param {Object} value - new value for given field.
     * @param {String} type - property type for SetValueCmd.
     * @param {CommandGroupCmd} cmdGroup - commands will be added to this command group.
     */
    addCommandsForChangedProperty(field, value, type, cmdGroup) {
        let strId = '' + this.getId();
        for (let docElement of this.rb.getDocElements(true)) {
            if (docElement.hasProperty('styleId')) {
                if (docElement.getValue('styleId') === strId &&
                        docElement.getValue(field) !== value) {
                    let cmd = new SetValueCmd(
                        docElement.getId(), field, value, type, this.rb);
                    cmd.disableSelect();
                    cmdGroup.addCommand(cmd);
                }
                if (docElement.getValue('cs_styleId') === strId &&
                        docElement.getValue('cs_' + field) !== value) {
                    let cmd = new SetValueCmd(
                        docElement.getId(), 'cs_' + field, value, type, this.rb);
                    cmd.disableSelect();
                    cmdGroup.addCommand(cmd);
                }
            }
        }
    }

    /**
     * Adds commands to command group parameter to delete this style and reset any references to it.
     * @param {CommandGroupCmd} cmdGroup - commands for deletion of style will be added to this command group.
     */
    addCommandsForDelete(cmdGroup) {
        let cmd;
        let elements = this.rb.getDocElements(true);
        for (let element of elements) {
            if ((element.getElementType() === DocElement.type.text ||
                    element.getElementType() === DocElement.type.tableText) && element.getValue('styleId') &&
                    utils.convertInputToNumber(element.getValue('styleId')) === this.id) {
                cmd = new SetValueCmd(
                    element.getId(), 'styleId', '', SetValueCmd.type.text, this.rb);
                cmdGroup.addCommand(cmd);
            }
        }
        cmd = new AddDeleteStyleCmd(
            false, this.toJS(), this.getId(), this.getPanelItem().getParent().getId(),
            this.getPanelItem().getSiblingPosition(), this.rb);
        cmdGroup.addCommand(cmd);
    }

    addError(error) {
        this.errors.push(error);
    }

    clearErrors() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }

    remove() {
    }

    select() {
    }

    deselect() {
    }

    toJS() {
        let ret = {};
        for (let field of this.getFields()) {
            ret[field] = this.getValue(field);
        }
        return ret;
    }

    /**
     * Updates GUI for border settings and borderAll setting of object.
     * @param {Object} obj - document element of which the border settings will be updated.
     * @param {String} field - border field which was modified.
     * @param {String} fieldPrefix - prefix of field to reuse style settings for different
     * sections (e.g. for conditional style).
     * @param {Boolean} value - new value for specified field.
     * @param {ReportBro} rb - ReportBro instance.
     */
    static setBorderValue(obj, field, fieldPrefix, value, rb) {
        let fieldWithoutPrefix = field;
        if (fieldPrefix.length > 0) {
            fieldWithoutPrefix = fieldWithoutPrefix.substr(fieldPrefix.length);
        }
        if (fieldWithoutPrefix === 'borderLeft' || fieldWithoutPrefix === 'borderTop' ||
                fieldWithoutPrefix === 'borderRight' || fieldWithoutPrefix === 'borderBottom') {
            let borderAll = (obj.getValue(`${fieldPrefix}borderLeft`) && obj.getValue(`${fieldPrefix}borderTop`) &&
                    obj.getValue(`${fieldPrefix}borderRight`) && obj.getValue(`${fieldPrefix}borderBottom`));
            let borderAllField = `${fieldPrefix}borderAll`;
            if (borderAll !== obj[borderAllField]) {
                obj[borderAllField] = borderAll;
                rb.notifyEvent(obj, Command.operation.change, borderAllField);
            }
        }
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'Style';
    }
}

// Verdana, Arial
// ['Courier', 'Courier-Bold', 'Courier-BoldOblique', 'Courier-Oblique', 'Helvetica', 'Helvetica-Bold',
// 'Helvetica-BoldOblique', 'Helvetica-Oblique', 'Symbol', 'Times-Bold', 'Times-BoldItalic', 'Times-Italic',
// 'Times-Roman', 'ZapfDingbats']
Style.font = {
    courier: 'courier',
    helvetica: 'helvetica',
    times: 'times'
};

Style.alignment = {
    // horizontal
    left: 'left',
    center: 'center',
    right: 'right',
    justify: 'justify',
    // vertical
    top: 'top',
    middle: 'middle',
    bottom: 'bottom'
};
