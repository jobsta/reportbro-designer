import AddDeleteStyleCmd from "../commands/AddDeleteStyleCmd";
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
        this.font = Style.font.courier;
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
        return ['id', 'name', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment',
            'textColor', 'backgroundColor', 'font', 'fontSize', 'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'];
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

    setValue(field, value, elSelector, isShown) {
        this[field] = value;
        if (field.indexOf('border') !== -1) {
            Style.setBorderValue(this, field, '', value, elSelector, isShown);
        }
    }

    setBorderAll(fieldPrefix, value) {
        this[fieldPrefix + 'borderAll'] = value;
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
                    element.getId(), 'rbro_text_element_style_id', 'styleId', '', SetValueCmd.type.text, this.rb);
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
     * @param {String} elSelector - jquery selector to specify the DOM element.
     * @param {Boolean} isShown - true if the specified object is currently visible in the GUI.
     */
    static setBorderValue(obj, field, fieldPrefix, value, elSelector, isShown) {
        if (field === `${fieldPrefix}borderAll`) {
            obj.borderLeft = obj.borderTop = obj.borderRight = obj.borderBottom = value;
            if (isShown) {
                if (value) {
                    $(elSelector).parent().find('button').addClass('rbroButtonActive');
                } else {
                    $(elSelector).parent().find('button').removeClass('rbroButtonActive');
                }
            }
        } else if (field === `${fieldPrefix}borderLeft` || field === `${fieldPrefix}borderTop` ||
                field === `${fieldPrefix}borderRight` || field === `${fieldPrefix}borderBottom`) {
            if (obj.getValue(`${fieldPrefix}borderLeft`) && obj.getValue(`${fieldPrefix}borderTop`) &&
                    obj.getValue(`${fieldPrefix}borderRight`) && obj.getValue(`${fieldPrefix}borderBottom`)) {
                obj.setBorderAll(fieldPrefix, true);
                if (isShown) {
                    $(elSelector).parent().find(`button[value="${fieldPrefix}borderAll"]`).addClass('rbroButtonActive');
                }
            } else {
                obj.setBorderAll(fieldPrefix, false);
                if (isShown) {
                    $(elSelector).parent().find(`button[value="${fieldPrefix}borderAll"]`).removeClass('rbroButtonActive');
                }
            }
        }
    }
}

// Verdana, Arial
// ['Courier', 'Courier-Bold', 'Courier-BoldOblique', 'Courier-Oblique', 'Helvetica', 'Helvetica-Bold', 'Helvetica-BoldOblique', 'Helvetica-Oblique', 'Symbol', 'Times-Bold', 'Times-BoldItalic', 'Times-Italic', 'Times-Roman', 'ZapfDingbats']
Style.font = {
    courier: 'courier',
    helvetica: 'helvetica',
    timesRoman: 'times_roman'
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
