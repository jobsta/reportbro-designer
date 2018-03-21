import Command from './Command';

/**
 * Command to set a single value of a data object.
 * @class
 */
export default class SetValueCmd {
    constructor(objId, tagId, field, value, type, rb) {
        this.objId = objId;
        this.tagId = tagId;
        this.field = field;
        this.value = value;
        this.type = type;
        this.rb = rb;

        let obj = rb.getDataObject(objId);
        this.oldValue = obj.getValue(field);
        this.firstExecution = true;
        this.select = true;
    }

    getName() {
        return 'Set value';
    }

    do() {
        if (!this.firstExecution && this.select) {
            this.rb.selectObject(this.objId, true);
        }
        this.setValue(this.value);
        this.firstExecution = false;
    }

    undo() {
        if (this.select) {
            this.rb.selectObject(this.objId, true);
        }
        this.setValue(this.oldValue);
    }

    setValue(value) {
        let obj = this.rb.getDataObject(this.objId);
        let detailData = this.rb.getDetailData();
        let isShown = (detailData !== null && detailData.getId() === this.objId);
        let elSelector = `#${this.tagId}`;
        obj.setValue(this.field, value, elSelector, isShown);

        if (this.field === 'name') {
            $(`#rbro_menu_item_name${this.objId}`).text(value);
            $(`#rbro_menu_item_name${this.objId}`).attr('title', value);
            this.rb.notifyEvent(obj, Command.operation.rename);
        } else {
            this.rb.notifyEvent(obj, Command.operation.change, this.field);
        }
        if (isShown) {
            if (this.type === SetValueCmd.type.text || this.type === SetValueCmd.type.select) {
                $(elSelector).val(value);
            } else if (this.type === SetValueCmd.type.filename) {
                $(elSelector).text(value);
                if (value === '') {
                    $(`#${this.tagId}_container`).addClass('rbroHidden');
                } else {
                    $(`#${this.tagId}_container`).removeClass('rbroHidden');
                }
            } else if (this.type === SetValueCmd.type.checkbox) {
                $(elSelector).prop('checked', value);
            } else if (this.type === SetValueCmd.type.button) {
                if (value) {
                    $(elSelector).addClass('rbroButtonActive');
                } else {
                    $(elSelector).removeClass('rbroButtonActive');
                }
            } else if (this.type === SetValueCmd.type.buttonGroup) {
                $(elSelector).find('button').removeClass('rbroButtonActive');
                $(elSelector).find(`button[value="${value}"]`).addClass('rbroButtonActive');
            } else if (this.type === SetValueCmd.type.color) {
                $(elSelector).spectrum("set", value);
            }
        }
    }

    /**
     * Disables selection of the element containing the changed field. By default an element is automatically
     * selected after one of its fields was changed.
     */
    disableSelect() {
        this.select = false;
    }

    /**
     * Returns true if the given command targets the same field. This information can be useful to avoid separate
     * commands for every keystroke in a text field and generate just one command for the whole changed text instead.
     * @param {SetValueCmd} newCmd
     * @returns {boolean}
     */
    allowReplace(newCmd) {
        return (this.type === SetValueCmd.type.text && this.objId === newCmd.objId &&
            this.tagId === newCmd.tagId && this.field === newCmd.field);
    }
}

SetValueCmd.type = {
    text: 'text',
    select: 'select',
    file: 'file',
    filename: 'filename',
    checkbox: 'checkbox',
    button: 'button',
    buttonGroup: 'buttonGroup',  // one button inside a group of buttons with only one active button
    color: 'color',
    internal: 'internal'
};
