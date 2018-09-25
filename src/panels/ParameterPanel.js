import Command from '../commands/Command';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all parameter properties.
 * @class
 */
export default class ParameterPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render(data) {
        let panel = $('<div id="rbro_parameter_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_parameter_name_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_parameter_name">${this.rb.getLabel('parameterName')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elParameterName = $('<input id="rbro_parameter_name">')
            .change(event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null) {
                    if (elParameterName.val().trim() !== '') {
                        let newParameterName = elParameterName.val();
                        let cmdGroup = new CommandGroupCmd('Rename parameter');
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_parameter_name', 'name',
                            newParameterName, SetValueCmd.type.text, this.rb);
                        cmdGroup.addCommand(cmd);
                        let parent = obj.getParent();
                        if (parent !== null) {
                            parent.addUpdateTestDataCmdForChangedParameter(obj.getName(), newParameterName, cmdGroup);
                        }
                        // add commands to convert all values containing the currently changed parameter
                        let docElements = this.rb.getDocElements(true);
                        for (let docElement of docElements) {
                            docElement.addCommandsForChangedParameterName(obj, newParameterName, cmdGroup);
                        }
                        for (let parameter of this.rb.getParameters()) {
                            parameter.addCommandsForChangedParameterName(obj, newParameterName, cmdGroup);
                        }
                        this.rb.executeCommand(cmdGroup);
                    } else {
                        elParameterName.val(parameter.getName());
                    }
                }
            });
        elFormField.append(elParameterName);
        elFormField.append('<div id="rbro_parameter_name_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_parameter_type_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_parameter_type">${this.rb.getLabel('parameterType')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elType = $(`<select id="rbro_parameter_type">
                <option value="string">${this.rb.getLabel('parameterTypeString')}</option>
                <option value="number">${this.rb.getLabel('parameterTypeNumber')}</option>
                <option value="boolean">${this.rb.getLabel('parameterTypeBoolean')}</option>
                <option value="date">${this.rb.getLabel('parameterTypeDate')}</option>
                <option value="image">${this.rb.getLabel('parameterTypeImage')}</option>
                <option value="array">${this.rb.getLabel('parameterTypeArray')}</option>
                <option value="simple_array">${this.rb.getLabel('parameterTypeSimpleArray')}</option>
                <option value="map">${this.rb.getLabel('parameterTypeMap')}</option>
                <option value="sum">${this.rb.getLabel('parameterTypeSum')}</option>
                <option value="average">${this.rb.getLabel('parameterTypeAverage')}</option>
            </select>`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_parameter_type',
                        'type', elType.val(), SetValueCmd.type.select, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elType);
        elFormField.append('<div id="rbro_parameter_type_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_parameter_array_item_type_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_parameter_array_item_type_row">${this.rb.getLabel('parameterArrayItemType')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elArrayItemType = $(`<select id="rbro_parameter_array_item_type">
                <option value="string">${this.rb.getLabel('parameterTypeString')}</option>
                <option value="number">${this.rb.getLabel('parameterTypeNumber')}</option>
                <option value="boolean">${this.rb.getLabel('parameterTypeBoolean')}</option>
                <option value="date">${this.rb.getLabel('parameterTypeDate')}</option>
            </select>`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_parameter_array_item_type',
                        'arrayItemType', elArrayItemType.val(), SetValueCmd.type.select, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elArrayItemType);
        elFormField.append('<div id="rbro_parameter_array_item_type_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        if (this.rb.getProperty('adminMode')) {
            elDiv = $('<div class="rbroFormRow" id="rbro_parameter_eval_row"></div>');
            elDiv.append(`<label for="rbro_parameter_eval">${this.rb.getLabel('parameterEval')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elEval = $('<input id="rbro_parameter_eval" type="checkbox">')
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_parameter_eval', 'eval',
                            elEval.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elEval);
            elDiv.append(elFormField);
            panel.append(elDiv);
        }

        elDiv = $('<div class="rbroFormRow" id="rbro_parameter_nullable_row"></div>');
        elDiv.append(`<label for="rbro_parameter_nullable">${this.rb.getLabel('parameterNullable')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elNullable = $('<input id="rbro_parameter_nullable" type="checkbox">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_parameter_nullable', 'nullable',
                        elNullable.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elNullable);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow" id="rbro_parameter_pattern_row"></div>');
        elDiv.append(`<label for="rbro_parameter_pattern">${this.rb.getLabel('parameterPattern')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPattern = $('<input id="rbro_parameter_pattern">')
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_parameter_pattern', 'pattern',
                        elPattern.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elPattern);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    let patterns;
                    let type = selectedObj.getValue('type');
                    let valueType = (type === Parameter.type.simpleArray) ? selectedObj.getValue('arrayItemType') : type;
                    if (valueType === Parameter.type.date) {
                        patterns = this.rb.getProperty('patternDates');
                    } else {
                        patterns = this.rb.getProperty('patternNumbers');
                    }
                    this.rb.getPopupWindow().show(patterns, this.selectedObjId,
                        'rbro_parameter_pattern', 'pattern', PopupWindow.type.pattern);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_parameter_pattern_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow" id="rbro_parameter_expression_row"></div>');
        elDiv.append(`<label for="rbro_parameter_expression">${this.rb.getLabel('parameterExpression')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elExpression = $('<textarea id="rbro_parameter_expression" rows="1"></textarea>')
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_parameter_expression', 'expression',
                        elExpression.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elExpression);
        elFormField.append(elExpression);
        elParameterButton = $(`<div id="rbro_parameter_expression_param_button"
        class="rbroButton rbroRoundButton rbroIcon-select"></div>`)
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    let items;
                    let popupType;
                    if (selectedObj.getValue('type') === Parameter.type.sum ||
                            selectedObj.getValue('type') === Parameter.type.average) {
                        items = this.rb.getArrayFieldParameterItems(Parameter.type.number);
                        popupType = PopupWindow.type.parameterSet;
                    } else {
                        items = this.rb.getParameterItems(selectedObj);
                        popupType = PopupWindow.type.parameterAppend;
                    }
                    this.rb.getPopupWindow().show(items, this.selectedObjId,
                        'rbro_parameter_expression', 'expression', popupType);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_parameter_expression_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow" id="rbro_parameter_test_data_row"></div>');
        elDiv.append(`<label for="rbro_parameter_test_data">${this.rb.getLabel('parameterTestData')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elTestData = $('<input id="rbro_parameter_test_data">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_parameter_test_data', 'testData',
                        elTestData.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elTestData);
        let elEditTestDataButton = $(`<button id="rbro_parameter_edit_test_data"
        class="rbroButton rbroActionButton" style="display: none;">
                    <span>${this.rb.getLabel('parameterEditTestData')}</span>
                    <span class="rbroIcon-edit"></span>
                </button>`)
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    let rows = selectedObj.getTestDataRows(true);
                    if (rows.length > 0) {
                        this.rb.getPopupWindow().show(
                            rows, this.selectedObjId, '', 'testData', PopupWindow.type.testData);
                    } else {
                        alert(this.rb.getLabel('parameterEditTestDataNoFields'));
                    }
                }
            });
        elFormField.append(elEditTestDataButton);
        elFormField.append('<div id="rbro_parameter_test_data_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    updateAutosizeInputs() {
        autosize.update($('#rbro_parameter_expression'));
    }

    show(data) {
        $('#rbro_parameter_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_parameter_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {Parameter} data
     */
    updateData(data) {
        if (data !== null) {
            let editable = data.getValue('editable');
            $('#rbro_parameter_name').prop('disabled', !editable);
            $('#rbro_parameter_type').prop('disabled', !editable);
            $('#rbro_parameter_eval').prop('disabled', !editable);
            $('#rbro_parameter_nullable').prop('disabled', !editable);
            $('#rbro_parameter_pattern').prop('disabled', !editable);
            $('#rbro_parameter_expression').prop('disabled', !editable);
            if (editable) {
                $('#rbro_parameter_name_row label').removeClass('rbroDisabled');
                $('#rbro_parameter_type_row label').removeClass('rbroDisabled');
                $('#rbro_parameter_eval_row label').removeClass('rbroDisabled');
                $('#rbro_parameter_nullable_row label').removeClass('rbroDisabled');
                $('#rbro_parameter_pattern_row label').removeClass('rbroDisabled');
                $('#rbro_parameter_expression_row label').removeClass('rbroDisabled');
            } else {
                $('#rbro_parameter_name_row label').addClass('rbroDisabled');
                $('#rbro_parameter_type_row label').addClass('rbroDisabled');
                $('#rbro_parameter_eval_row label').addClass('rbroDisabled');
                $('#rbro_parameter_nullable_row label').addClass('rbroDisabled');
                $('#rbro_parameter_pattern_row label').addClass('rbroDisabled');
                $('#rbro_parameter_expression_row label').addClass('rbroDisabled');
            }
            $('#rbro_parameter_test_data').prop('disabled', false);

            $('#rbro_parameter_name').val(data.getName());
            $('#rbro_parameter_type').val(data.getValue('type'));
            $('#rbro_parameter_eval').prop('checked', data.getValue('eval'));
            $('#rbro_parameter_nullable').prop('checked', data.getValue('nullable'));
            $('#rbro_parameter_pattern').val(data.getValue('pattern'));
            $('#rbro_parameter_expression').val(data.getValue('expression'));
            $('#rbro_parameter_test_data').val(data.getValue('testData'));
            this.updatePatternPlaceholder(data);
            this.updateVisibility(data);
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_parameter_name').prop('disabled', true);
            $('#rbro_parameter_type').prop('disabled', true);
            $('#rbro_parameter_eval').prop('disabled', true);
            $('#rbro_parameter_nullable').prop('disabled', true);
            $('#rbro_parameter_pattern').prop('disabled', true);
            $('#rbro_parameter_expression').prop('disabled', true);
            $('#rbro_parameter_test_data').prop('disabled', true);
        }
        
        this.updateAutosizeInputs();
        this.updateErrors();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     */
    notifyEvent(obj, operation) {
        if (obj instanceof Parameter && obj === this.rb.getDetailData() && operation === Command.operation.change) {
            this.updateVisibility(obj);
        }
    }

    updatePatternPlaceholder(obj) {
        if (obj !== null && obj.getValue('type') === Parameter.type.date) {
            $('#rbro_parameter_test_data').attr('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
        } else {
            $('#rbro_parameter_test_data').attr('placeholder', '');
        }
    }

    updateVisibility(obj) {
        let type = obj.getValue('type');
        let valueType = (type === Parameter.type.simpleArray) ? obj.getValue('arrayItemType') : type;
        let showOnlyNameType = obj.getValue('showOnlyNameType');
        let parentParameter = null;
        if (obj.getPanelItem() !== null && obj.getPanelItem().getParent().getData() instanceof Parameter) {
            parentParameter = obj.getPanelItem().getParent().getData();
        }

        if (type === Parameter.type.simpleArray) {
            $('#rbro_parameter_array_item_type_row').show();
        } else {
            $('#rbro_parameter_array_item_type_row').hide();
        }
        if (type === Parameter.type.string || type === Parameter.type.number || type === Parameter.type.boolean || type === Parameter.type.date ||
                type === Parameter.type.array || type === Parameter.type.simpleArray || type === Parameter.type.map) {
            $('#rbro_parameter_nullable_row').show();
        } else {
            $('#rbro_parameter_nullable_row').hide();
        }
        if ((valueType === Parameter.type.number || valueType === Parameter.type.date ||
                valueType === Parameter.type.sum || valueType === Parameter.type.average) && !showOnlyNameType) {
            $('#rbro_parameter_pattern_row').show();
        } else {
            $('#rbro_parameter_pattern_row').hide();
        }
        if (type === Parameter.type.image || type === Parameter.type.sum || type === Parameter.type.average ||
                showOnlyNameType) {
            $('#rbro_parameter_eval_row').hide();
            $('#rbro_parameter_test_data_row').hide();
        } else {
            if (type === Parameter.type.image || type === Parameter.type.array || type === Parameter.type.simpleArray || type === Parameter.type.map) {
                $('#rbro_parameter_eval_row').hide();
            } else {
                $('#rbro_parameter_eval_row').show();
            }
            if ((parentParameter !== null && parentParameter.getValue('type') === Parameter.type.array) ||
                    type === Parameter.type.map) {
                $('#rbro_parameter_test_data_row').hide();
            } else {
                if (type === Parameter.type.array || type === Parameter.type.simpleArray || !obj.getValue('eval')) {
                    $('#rbro_parameter_test_data_row').show();
                } else {
                    $('#rbro_parameter_test_data_row').hide();
                }
            }
            if (type === Parameter.type.array || type === Parameter.type.simpleArray) {
                $('#rbro_parameter_test_data').hide();
                $('#rbro_parameter_edit_test_data').show();
            } else {
                $('#rbro_parameter_test_data').show();
                $('#rbro_parameter_edit_test_data').hide();
            }
        }
        if (((obj.getValue('eval') && (type === Parameter.type.string || type === Parameter.type.number ||
              type === Parameter.type.boolean || type === Parameter.type.date)) ||
                (type === Parameter.type.sum || type === Parameter.type.average)) && !showOnlyNameType) {
            $('#rbro_parameter_expression_row').show();
        } else {
            $('#rbro_parameter_expression_row').hide();
        }
        // do not allow nested array/map
        if (obj.getPanelItem() !== null && obj.getPanelItem().getParent() === this.rb.getMainPanel().getParametersItem()) {
            $('#rbro_parameter_type option[value="array"]').removeClass('rbroHidden');
            $('#rbro_parameter_type option[value="map"]').removeClass('rbroHidden');
        } else {
            $('#rbro_parameter_type option[value="array"]').addClass('rbroHidden');
            $('#rbro_parameter_type option[value="map"]').addClass('rbroHidden');
        }
        // do not allow image and sum/average parameter in list
        if (parentParameter !== null && parentParameter.getValue('type') === Parameter.type.array) {
            $('#rbro_parameter_type option[value="image"]').addClass('rbroHidden');
            $('#rbro_parameter_type option[value="sum"]').addClass('rbroHidden');
            $('#rbro_parameter_type option[value="average"]').addClass('rbroHidden');
        } else {
            $('#rbro_parameter_type option[value="image"]').removeClass('rbroHidden');
            $('#rbro_parameter_type option[value="sum"]').removeClass('rbroHidden');
            $('#rbro_parameter_type option[value="average"]').removeClass('rbroHidden');
        }
    }

    /**
     * Updates displayed errors of currently selected data object.
     */
    updateErrors() {
        $('#rbro_parameter_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_parameter_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_parameter_' + error.field + '_row';
                let errorId = 'rbro_parameter_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
