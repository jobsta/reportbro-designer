import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';

/**
 * Base class for all panels. Contains shared functionality.
 * @class
 */
export default class PanelBase {
    constructor(idPrefix, dataBaseClass, rootElement, rb) {
        this.idPrefix = idPrefix;
        this.dataBaseClass = dataBaseClass;
        this.panelId = idPrefix + '_panel';
        this.rootElement = rootElement;
        this.rb = rb;

        this.propertyDescriptors = {};  // is overriden in derived class
    }

    render(data) {
    }

    setValue(propertyDescriptor, value, differentValues) {
        let propertyId = `#${this.idPrefix}_${propertyDescriptor['fieldId']}`;

        if (differentValues) {
            $(propertyId).addClass('rbroDifferentValues');
        } else {
            $(propertyId).removeClass('rbroDifferentValues');
        }

        // set value for current property
        if (propertyDescriptor['type'] === SetValueCmd.type.text) {
            if (differentValues) {
                $(propertyId).val('');
                $(propertyId).attr('placeholder', 'different values ...');
            } else {
                $(propertyId).val(value);
                $(propertyId).attr('placeholder', '');
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.select) {
            $(propertyId).val(value);
        } else if (propertyDescriptor['type'] === SetValueCmd.type.checkbox) {
            if (differentValues) {
                $(propertyId).prop('checked', false);
            } else {
                $(propertyId).prop('checked', value);
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.button) {
            if (differentValues) {
                $(propertyId).removeClass('rbroButtonActive');
            } else {
                if (value) {
                    $(propertyId).addClass('rbroButtonActive');
                } else {
                    $(propertyId).removeClass('rbroButtonActive');
                }
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.buttonGroup) {
            $(propertyId).find('button').removeClass('rbroButtonActive');
            if (!differentValues) {
                $(propertyId).find(`button[value="${value}"]`).addClass('rbroButtonActive');
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.color) {
            if (differentValues) {
                if (propertyDescriptor['allowEmpty']) {
                    $(propertyId).spectrum("set", '');
                } else {
                    $(propertyId).spectrum("set", '#000000');
                }
            } else {
                $(propertyId).spectrum("set", value);
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.filename) {
            if (differentValues) {
                $(propertyId).text('different files ...');
                $(propertyId + '_container').removeClass('rbroHidden');
            } else {
                $(propertyId).text(value);
                if (value === '') {
                    $(propertyId + '_container').addClass('rbroHidden');
                } else {
                    $(propertyId + '_container').removeClass('rbroHidden');
                }
            }
        }
    }

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {[String]} field - affected field in case of change operation.
     */
    updateDisplay(field) {
    }

    show() {
        $('#' + this.panelId).removeClass('rbroHidden');
    }

    hide() {
        $('#' + this.panelId).addClass('rbroHidden');
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     * @param {[String]} field - affected field in case of change operation.
     */
    notifyEvent(obj, operation, field) {
        if (obj instanceof this.dataBaseClass && this.rb.isSelectedObject(obj.id) &&
                operation === Command.operation.change) {
            this.updateDisplay(field);
        }
    }

    /**
     * Updates displayed errors of currently selected data objects.
     */
    updateErrors() {
        $(`#${this.panelId} .rbroFormRow`).removeClass('rbroError');
        $(`#${this.panelId} .rbroErrorMessage`).text('');

        let selectedObjects = this.rb.getSelectedObjects();
        for (let obj of selectedObjects) {
            for (let error of obj.getErrors()) {
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' +
                        error.info.replace('<', '&lt;').replace('>', '&gt;') + '</span>');
                }
                $(`#${this.idPrefix}_${error.field}_row`).addClass('rbroError');
                $(`#${this.idPrefix}_${error.field}_error`).html(errorMsg);
            }
        }
    }

    /**
     * Is called when the selected element was changed.
     */
    selectionChanged() {
        this.updateDisplay(null);
        this.updateErrors();
    }
}
