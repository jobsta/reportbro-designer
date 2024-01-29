import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import * as utils from '../utils';

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

        this.differentValuesLabel = this.rb.getLabel('differentValues');
        this.differentFilesLabel = this.rb.getLabel('differentFiles');

        this.quill = null;
        this.controls = {};
    }

    render(data) {
    }

    /**
     * Is called when the ReportBro instance is deleted and should be used
     * to cleanup elements and event handlers.
     */
    destroy() {
    }

    setValue(propertyDescriptor, value, differentValues) {
        let propertyId = `${this.idPrefix}_${propertyDescriptor['fieldId']}`;

        if (differentValues) {
            document.getElementById(propertyId).classList.add('rbroDifferentValues');
        } else {
            document.getElementById(propertyId).classList.remove('rbroDifferentValues');
        }

        // set value for current property
        const el = document.getElementById(propertyId);
        if (propertyDescriptor['type'] === SetValueCmd.type.text) {
            if (differentValues) {
                el.value = '';
                el.setAttribute('placeholder', this.differentValuesLabel);
            } else {
                el.value = value;
                el.setAttribute('placeholder', '');
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.richText) {
            if (this.quill) {
                if (differentValues || !value) {
                    this.quill.setContents({}, 'silent');
                } else {
                    this.quill.setContents(value, 'silent');
                }
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.select) {
            el.value = value;
        } else if (propertyDescriptor['type'] === SetValueCmd.type.checkbox) {
            if (differentValues) {
                el.checked = false;
            } else {
                el.checked = value;
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.button) {
            if (differentValues) {
                el.classList.remove('rbroButtonActive');
            } else {
                if (value) {
                    el.classList.add('rbroButtonActive');
                } else {
                    el.classList.remove('rbroButtonActive');
                }
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.buttonGroup) {
            const elButtons = el.querySelectorAll('button');
            for (const elButton of elButtons) {
                elButton.classList.remove('rbroButtonActive');
            }
            if (!differentValues) {
                el.querySelector(`button[value="${value}"]`).classList.add('rbroButtonActive');
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.color) {
            const elColorSelect = document.getElementById(propertyId + '_select');
            if (differentValues) {
                if (propertyDescriptor['allowEmpty']) {
                    el.value = '';
                    elColorSelect.style.color = '';
                    elColorSelect.classList.add('rbroTransparentColorSelect');
                } else {
                    el.value = '#000000';
                    elColorSelect.style.color = '#000000';
                    elColorSelect.classList.remove('rbroTransparentColorSelect');
                }
            } else {
                el.value = value;
                elColorSelect.style.color = value;
                if (value) {
                    elColorSelect.classList.remove('rbroTransparentColorSelect');
                } else {
                    elColorSelect.classList.add('rbroTransparentColorSelect');
                }
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.filename) {
            if (differentValues) {
                el.textContent = this.differentFilesLabel;
                document.getElementById(propertyId + '_container').classList.remove('rbroHidden');
            } else {
                el.textContent = value;
                if (value === '') {
                    document.getElementById(propertyId + '_container').classList.add('rbroHidden');
                } else {
                    document.getElementById(propertyId + '_container').classList.remove('rbroHidden');
                }
            }
        }
    }

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
    }

    show() {
        document.getElementById(this.panelId).classList.remove('rbroHidden');
    }

    hide() {
        document.getElementById(this.panelId).classList.add('rbroHidden');
    }

    /**
     * Returns true if global key events are disabled.
     *
     * If rich text editor has focus we do not allow any global key events,
     * otherwise the text element would be moved or deleted when special keys like
     * cursor or backspace/del are pressed.
     * @returns {Boolean}
     */
    isKeyEventDisabled() {
        return this.quill && this.quill.hasFocus();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     * @param {String} [field] - affected field in case of change operation.
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
        const elPanel = document.getElementById(this.panelId);
        const elFormRows = elPanel.querySelectorAll('.rbroFormRow');
        const elErrorMessages = elPanel.querySelectorAll('.rbroErrorMessage');
        for (const elFormRow of elFormRows) {
            elFormRow.classList.remove('rbroError');
        }
        for (const elErrorMessage of elErrorMessages) {
            elErrorMessage.textContent = '';
        }

        let obj = this.rb.getSelectedObject();
        if (obj !== null) {
            for (let error of obj.getErrors()) {
                let propertyDescriptor = this.propertyDescriptors[error.field];
                if (propertyDescriptor) {
                    if ('section' in propertyDescriptor) {
                        let sectionName = propertyDescriptor['section'];
                        document.getElementById(`${this.idPrefix}_${sectionName}_header`).classList.add('rbroError');
                    }

                    let errorMsg = this.rb.getLabel(error.msg_key);
                    if (error.info) {
                        errorMsg = errorMsg.replaceAll('${info}', '<span class="rbroErrorMessageInfo">' +
                            error.info.replaceAll('<', '&lt;').replaceAll('>', '&gt;') + '</span>');
                    }

                    // highlight row containing error
                    let rowId = this.getRowId(propertyDescriptor);
                    document.getElementById(rowId).classList.add('rbroError');
                    // show error message
                    let errorMsgId;
                    if ('errorMsgId' in propertyDescriptor) {
                        errorMsgId = propertyDescriptor['errorMsgId'];
                    } else {
                        errorMsgId = `${this.idPrefix}_${propertyDescriptor['fieldId']}_error`;
                    }
                    document.getElementById(errorMsgId).innerHTML = errorMsg;
                }
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

    /**
     * Expands all sections in case there is an error for a field inside a section and
     * scrolls to the uppermost error.
     */
    scrollToFirstError() {
        let obj = this.rb.getSelectedObject();
        if (obj !== null) {
            // open all sections containing errors
            for (let error of obj.getErrors()) {
                let propertyDescriptor = this.propertyDescriptors[error.field];
                if (propertyDescriptor) {
                    if ('section' in propertyDescriptor) {
                        let sectionName = propertyDescriptor['section'];
                        const elHeader = document.getElementById(`${this.idPrefix}_${sectionName}_header`);
                        if (!elHeader.classList.contains('rbroPanelSectionHeaderOpen')) {
                            elHeader.dispatchEvent(new Event('click'));
                        }
                    }
                }
            }

            // scroll to first visible error
            let firstErrorRowId = '';
            let firstErrorRowOffset = -1;
            for (let error of obj.getErrors()) {
                let propertyDescriptor = this.propertyDescriptors[error.field];
                if (propertyDescriptor) {
                    let rowId = this.getRowId(propertyDescriptor);
                    let elRow = document.getElementById(rowId);
                    let rowOffset = utils.getElementOffset(elRow).top;
                    if (firstErrorRowId === '' || rowOffset < firstErrorRowOffset) {
                        firstErrorRowId = rowId;
                        firstErrorRowOffset = rowOffset;
                    }
                }
            }
            if (firstErrorRowId !== '') {
                const elErrorRow = document.getElementById(firstErrorRowId);
                elErrorRow.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    /**
     * Returns row id of html element for given property.
     * @param {String} propertyDescriptor - object containing all information about a property.
     * @returns {String}
     */
    getRowId(propertyDescriptor) {
        let rowId;
        if ('rowId' in propertyDescriptor) {
            rowId = propertyDescriptor['rowId'];
        } else {
            rowId = `${this.idPrefix}_${propertyDescriptor['fieldId']}_row`;
        }
        return rowId;
    }
}
