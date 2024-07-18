import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import * as utils from '../utils';
import Delta from 'quill-delta';

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
        // fields which are referenced in the visibleIf property
        this.visibleIfFields = [];
    }

    /**
     * Collect all fields which are referenced in the visibleIf property.
     */
    initVisibleIfFields() {
        for (const property in this.propertyDescriptors) {
            if (this.propertyDescriptors.hasOwnProperty(property)) {
                const propertyDescriptor = this.propertyDescriptors[property];
                if ('visibleIf' in propertyDescriptor) {
                    // add all fields used in visibleIf expression to visibileIfFields list of property descriptor
                    const tokens = utils.tokenize(propertyDescriptor['visibleIf'], null);
                    for (const token of tokens) {
                        if (token.type === 'field') {
                            if (!('visibleIfFields' in propertyDescriptor)) {
                                propertyDescriptor.visibleIfFields = [token.value];
                            } else if (!propertyDescriptor.visibleIfFields.includes(token.value)) {
                                propertyDescriptor.visibleIfFields.push(token.value);
                            }

                            if (!this.visibleIfFields.includes(token.value)) {
                                this.visibleIfFields.push(token.value);
                            }
                        }
                    }
                }
            }
        }
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
     * The panel is updated to show the values of the selected data objects.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        let selectedObjects = this.rb.getSelectedObjects();

        let sectionPropertyCount = {};
        let sharedProperties = {};
        for (let obj of selectedObjects) {
            let properties = obj.getProperties();
            for (let property of properties) {
                if (property in sharedProperties) {
                    sharedProperties[property] += 1;
                } else {
                    sharedProperties[property] = 1;
                }
            }
        }

        // show/hide property depending on if it is available in all selected objects
        for (let property in this.propertyDescriptors) {
            if (this.propertyDescriptors.hasOwnProperty(property)) {
                const propertyDescriptor = this.propertyDescriptors[property];
                let visibleIf = '';
                if ('visibleIf' in propertyDescriptor) {
                    visibleIf = propertyDescriptor['visibleIf'];
                }

                if (field === null || property === field ||
                        (visibleIf && propertyDescriptor.visibleIfFields.includes(field))) {
                    let show = false;
                    if (property in sharedProperties) {
                        if (sharedProperties[property] === selectedObjects.length) {
                            let value = null;
                            let differentValues = false;
                            for (let obj of selectedObjects) {
                                let objValue = obj.getUpdateValue(property, obj.getValue(property));
                                if (value === null) {
                                    value = objValue;
                                } else if (propertyDescriptor['type'] === SetValueCmd.type.richText) {
                                    if (objValue && value) {
                                        let diff = new Delta(objValue).diff(new Delta(value));
                                        if (diff.ops.length > 0) {
                                            differentValues = true;
                                            break;
                                        }
                                    }
                                } else if (objValue !== value) {
                                    differentValues = true;
                                    break;
                                }
                            }

                            if (differentValues && propertyDescriptor['type'] === SetValueCmd.type.select &&
                                    propertyDescriptor['allowEmpty']) {
                                // if values are different and dropdown has empty option then select
                                // empty dropdown option
                                value = '';
                            }
                            this.setValue(propertyDescriptor, value, differentValues);

                            if ('section' in propertyDescriptor) {
                                let sectionName = propertyDescriptor['section'];
                                if (sectionName in sectionPropertyCount) {
                                    sectionPropertyCount[sectionName] += 1;
                                } else {
                                    sectionPropertyCount[sectionName] = 1;
                                }
                            }
                            show = true;
                        } else {
                            delete sharedProperties[property];
                        }
                    }

                    if (show && visibleIf) {
                        for (let obj of selectedObjects) {
                            if (!utils.evaluateExpression(visibleIf, obj)) {
                                show = false;
                                delete sharedProperties[property];
                                break;
                            }
                        }
                    }

                    if ('singleRowProperty' in propertyDescriptor && !propertyDescriptor['singleRowProperty']) {
                        // only handle visibility of control and not of whole row.
                        // row visibility will be handled below, e.g. for button groups
                        const propertyId = `${this.idPrefix}_${propertyDescriptor['fieldId']}`;
                        if (show) {
                            document.getElementById(propertyId).classList.remove('rbroHidden');
                        } else {
                            document.getElementById(propertyId).classList.add('rbroHidden');
                        }
                    } else {
                        const rowId = this.getRowId(propertyDescriptor);
                        if (show) {
                            document.getElementById(rowId).classList.remove('rbroHidden');
                        } else {
                            document.getElementById(rowId).classList.add('rbroHidden');
                        }
                    }
                }
            }
        }

        if (field === null || this.visibleIfFields.includes(field)) {
            // only update labels, visible rows and sections if selection was changed (no specific field update)
            // or field is referenced in visibleIf property (and therefor could have
            // influence on visibility of other fields)

            // sharedProperties now only contains properties shared by all objects

            for (let property in this.propertyDescriptors) {
                if (this.propertyDescriptors.hasOwnProperty(property)) {
                    let propertyDescriptor = this.propertyDescriptors[property];
                    if ('rowId' in propertyDescriptor && 'rowProperties' in propertyDescriptor) {
                        let shownPropertyCount = 0;
                        for (let rowProperty of propertyDescriptor['rowProperties']) {
                            if (rowProperty in sharedProperties) {
                                shownPropertyCount++;
                            }
                        }
                        if ('labelId' in propertyDescriptor) {
                            let label = propertyDescriptor['defaultLabel'];
                            if (shownPropertyCount === 1) {
                                // get label of single property shown in this property group, e.g. label
                                // is changed to "Width" instead of "Size (Width, Height)" if only width property
                                // is shown and not both width and height.
                                for (let rowProperty of propertyDescriptor['rowProperties']) {
                                    if (rowProperty in sharedProperties) {
                                        label = this.propertyDescriptors[rowProperty]['singlePropertyLabel'];
                                        break;
                                    }
                                }
                            }
                            document.getElementById(propertyDescriptor['labelId']).textContent =
                                this.rb.getLabel(label) + ':';
                        }
                        if (shownPropertyCount > 0) {
                            document.getElementById(propertyDescriptor['rowId']).classList.remove('rbroHidden');
                        } else {
                            document.getElementById(propertyDescriptor['rowId']).classList.add('rbroHidden');
                        }
                    }
                }
            }
        }

        // only update section visibility when selection was changed, otherwise section could be hidden when
        // no section property was updated (i.e. no section property changed or affected by changed field)
        if (field === null) {
            // show section if there is at least one property shown in section
            for (const section of this.getSections()) {
                const sectionId = `${this.idPrefix}_${section}_section_container`;
                if (section in sectionPropertyCount) {
                    document.getElementById(sectionId).classList.remove('rbroHidden');
                } else {
                    document.getElementById(sectionId).classList.add('rbroHidden');
                }
            }
        }

        this.updateAutosizeInputs(field);
    }

    /**
     * Update size of all autosize textareas in panel.
     * @param {?String} field - affected field in case of change operation.
     */
    updateAutosizeInputs(field) {
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
     * Return available sections in the property panel.
     * @returns {[String]}
     */
    getSections() {
        return [];
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
