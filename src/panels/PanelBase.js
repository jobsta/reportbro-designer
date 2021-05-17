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
                $(propertyId).attr('placeholder', this.differentValuesLabel);
            } else {
                $(propertyId).val(value);
                $(propertyId).attr('placeholder', '');
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
                    $(propertyId).val('');
                    $(propertyId + '_select').css('color', '');
                    $(propertyId + '_select').addClass('rbroTransparentColorSelect');
                } else {
                    $(propertyId).val('#000000');
                    $(propertyId + '_select').css('color', '#000000');
                    $(propertyId + '_select').removeClass('rbroTransparentColorSelect');
                }
            } else {
                $(propertyId).val(value);
                $(propertyId + '_select').css('color', value);
                if (value) {
                    $(propertyId + '_select').removeClass('rbroTransparentColorSelect');
                } else {
                    $(propertyId + '_select').addClass('rbroTransparentColorSelect');
                }
            }
        } else if (propertyDescriptor['type'] === SetValueCmd.type.filename) {
            if (differentValues) {
                $(propertyId).text(this.differentFilesLabel);
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
     * @param {String} [field] - affected field in case of change operation.
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
        $(`#${this.panelId} .rbroFormRow`).removeClass('rbroError');
        $(`#${this.panelId} .rbroErrorMessage`).text('');

        let obj = this.rb.getSelectedObject();
        if (obj !== null) {
            for (let error of obj.getErrors()) {
                let propertyDescriptor = this.propertyDescriptors[error.field];
                if (propertyDescriptor) {
                    if ('section' in propertyDescriptor) {
                        let sectionName = propertyDescriptor['section'];
                        $(`#${this.idPrefix}_${sectionName}_header`).addClass('rbroError');
                    }

                    let errorMsg = this.rb.getLabel(error.msg_key);
                    if (error.info) {
                        errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' +
                            error.info.replace('<', '&lt;').replace('>', '&gt;') + '</span>');
                    }

                    // highlight row containing error
                    let rowId = this.getRowId(propertyDescriptor);
                    $('#' + rowId).addClass('rbroError');
                    // show error message
                    let errorMsgId;
                    if ('errorMsgId' in propertyDescriptor) {
                        errorMsgId = propertyDescriptor['errorMsgId'];
                    } else {
                        errorMsgId = `${this.idPrefix}_${propertyDescriptor['fieldId']}_error`;
                    }
                    $('#' + errorMsgId).html(errorMsg);
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
                        if (!$(`#${this.idPrefix}_${sectionName}_header`).hasClass('rbroPanelSectionHeaderOpen')) {
                            $(`#${this.idPrefix}_${sectionName}_header`).trigger('click');
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
                    let rowOffset = elRow.offsetTop;
                    if (firstErrorRowId === '' || rowOffset < firstErrorRowOffset) {
                        firstErrorRowId = rowId;
                        firstErrorRowOffset = rowOffset;
                    }
                }
            }
            if (firstErrorRowId !== '') {
                $('#rbro_detail_panel').scrollTop(firstErrorRowOffset);
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
