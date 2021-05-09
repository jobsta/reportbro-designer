import PanelBase from './PanelBase';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import PopupWindow from '../PopupWindow';
import autosize from 'autosize';

/**
 * Panel to edit all parameter properties.
 * @class
 */
export default class ParameterPanel extends PanelBase {
    constructor(rootElement, rb) {
        super('rbro_parameter', Parameter, rootElement, rb);

        this.propertyDescriptors = {
            'name': {
                'type': SetValueCmd.type.text,
                'fieldId': 'name'
            },
            'type': {
                'type': SetValueCmd.type.select,
                'fieldId': 'type'
            },
            'arrayItemType': {
                'type': SetValueCmd.type.select,
                'fieldId': 'array_item_type'
            },
            'eval': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'eval'
            },
            'nullable': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'nullable'
            },
            'pattern': {
                'type': SetValueCmd.type.text,
                'fieldId': 'pattern'
            },
            'expression': {
                'type': SetValueCmd.type.text,
                'fieldId': 'expression'
            },
            'testData': {
                'type': SetValueCmd.type.text,
                'fieldId': 'test_data'
            },
        };
        this.parameterTypeOptions = [];
    }

    render(data) {
        let panel = $('<div id="rbro_parameter_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_parameter_name_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_parameter_name">${this.rb.getLabel('parameterName')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elParameterName = $('<input id="rbro_parameter_name">')
            .on('input', event => {
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let newParameterName = elParameterName.val();
                    let cmdGroup = new CommandGroupCmd('Rename parameter');
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'name', newParameterName,
                        SetValueCmd.type.text, this.rb);
                    cmdGroup.addCommand(cmd);
                    let parent = selectedObject.getParent();
                    if (parent !== null) {
                        parent.addUpdateTestDataCmdForChangedParameter(
                            selectedObject.getName(), newParameterName, cmdGroup);
                    }

                    let parentPanelItem = null;
                    if (parent !== null) {
                        parentPanelItem = parent.getPanelItem();
                    } else {
                        parentPanelItem = this.rb.getMainPanel().getParametersItem();
                    }

                    // only update parameter references on name change if the parameter name is unique
                    if (parentPanelItem !== null &&
                            parentPanelItem.getChildByNameExclude(selectedObject.getName(), selectedObject) === null &&
                            parentPanelItem.getChildByNameExclude(newParameterName, selectedObject) === null) {
                        // add commands to convert all values containing the currently changed parameter
                        let docElements = this.rb.getDocElements(true);
                        for (let docElement of docElements) {
                            docElement.addCommandsForChangedParameterName(
                                selectedObject, newParameterName, cmdGroup);
                        }
                        for (let parameter of this.rb.getParameters()) {
                            parameter.addCommandsForChangedParameterName(
                                selectedObject, newParameterName, cmdGroup);
                        }
                    }
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elParameterName);
        elFormField.append('<div id="rbro_parameter_name_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_parameter_type_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_parameter_type">${this.rb.getLabel('parameterType')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elType = $('<select id="rbro_parameter_type"></select>')
            .change(event => {
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmdGroup = new CommandGroupCmd('Set parameter type');
                    let parameterType = elType.val();
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'type', parameterType,
                        SetValueCmd.type.select, this.rb);
                    cmdGroup.addCommand(cmd);
                    selectedObject.addCommandsForChangedParameterType(parameterType, cmdGroup);
                    this.rb.executeCommand(cmdGroup);
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'arrayItemType', elArrayItemType.val(),
                        SetValueCmd.type.select, this.rb);
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
                    let selectedObject = this.rb.getSelectedObject();
                    if (selectedObject !== null) {
                        let cmd = new SetValueCmd(
                            selectedObject.getId(), 'eval', elEval.is(":checked"),
                            SetValueCmd.type.checkbox, this.rb);
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'nullable', elNullable.is(":checked"),
                        SetValueCmd.type.checkbox, this.rb);
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'pattern', elPattern.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elPattern);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let patterns;
                    let type = selectedObject.getValue('type');
                    let valueType = (type === Parameter.type.simpleArray) ?
                        selectedObject.getValue('arrayItemType') : type;
                    if (valueType === Parameter.type.date) {
                        patterns = this.rb.getProperty('patternDates');
                    } else {
                        patterns = this.rb.getProperty('patternNumbers');
                    }
                    this.rb.getPopupWindow().show(patterns, selectedObject.getId(),
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'expression', elExpression.val(),
                        SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elExpression);
        elFormField.append(elExpression);
        elParameterButton = $(`<div id="rbro_parameter_expression_param_button"
        class="rbroButton rbroRoundButton rbroIcon-select"></div>`)
            .click(event => {
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let items, popupType;
                    if (selectedObject.getValue('type') === Parameter.type.sum ||
                            selectedObject.getValue('type') === Parameter.type.average) {
                        items = this.rb.getArrayFieldParameterItems([Parameter.type.number]);
                        popupType = PopupWindow.type.parameterSet;
                    } else {
                        items = this.rb.getParameterItems(selectedObject);
                        popupType = PopupWindow.type.parameterAppend;
                    }
                    this.rb.getPopupWindow().show(
                        items, selectedObject.getId(), 'rbro_parameter_expression', 'expression', popupType);
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'testData', elTestData.val(),
                        SetValueCmd.type.text, this.rb);
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
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let rows = selectedObject.getTestDataRows(true);
                    if (rows.length > 0) {
                        this.rb.getPopupWindow().show(
                            rows, selectedObject.getId(), '', 'testData', PopupWindow.type.testData);
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

    updateVisibileRows(obj, field) {
        let type = obj.getValue('type');
        let valueType = (type === Parameter.type.simpleArray) ? obj.getValue('arrayItemType') : type;
        let showOnlyNameType = obj.getValue('showOnlyNameType');
        let parentParameter = null;
        if (obj.getPanelItem() !== null && obj.getPanelItem().getParent().getData() instanceof Parameter) {
            parentParameter = obj.getPanelItem().getParent().getData();
        }

        if (field === null) {
            let editable = obj.getValue('editable');
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
        }

        if (field === null || field === 'type') {
            if (type === Parameter.type.simpleArray) {
                $('#rbro_parameter_array_item_type_row').show();
            } else {
                $('#rbro_parameter_array_item_type_row').hide();
            }
            if (type === Parameter.type.string || type === Parameter.type.number ||
                    type === Parameter.type.boolean || type === Parameter.type.date ||
                    type === Parameter.type.array || type === Parameter.type.simpleArray || type === Parameter.type.map) {
                $('#rbro_parameter_nullable_row').show();
            } else {
                $('#rbro_parameter_nullable_row').hide();
            }
        }
        if (field === null || field === 'type' || field === 'arrayItemType') {
            if ((valueType === Parameter.type.number || valueType === Parameter.type.date ||
                    valueType === Parameter.type.sum || valueType === Parameter.type.average) && !showOnlyNameType) {
                $('#rbro_parameter_pattern_row').show();
            } else {
                $('#rbro_parameter_pattern_row').hide();
            }
        }
        if (field === null || field === 'type' || field === 'eval') {
            if (type === Parameter.type.image || type === Parameter.type.sum || type === Parameter.type.average ||
                showOnlyNameType) {
                $('#rbro_parameter_eval_row').hide();
                $('#rbro_parameter_test_data_row').hide();
            } else {
                if (type === Parameter.type.image || type === Parameter.type.array ||
                    type === Parameter.type.simpleArray || type === Parameter.type.map) {
                    $('#rbro_parameter_eval_row').hide();
                } else {
                    $('#rbro_parameter_eval_row').show();
                }
                if ((parentParameter !== null && parentParameter.getValue('type') === Parameter.type.array) ||
                    type === Parameter.type.map) {
                    $('#rbro_parameter_test_data_row').hide();
                } else {
                    if (type === Parameter.type.array || type === Parameter.type.simpleArray ||
                            !obj.getValue('eval')) {
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
        }

        if (field === null) {
            let parameterTypeOptions = [];
            // do not allow nested array/map (only for top-level parameters)
            let topLevelParameter = (obj.getPanelItem() !== null &&
                obj.getPanelItem().getParent() === this.rb.getMainPanel().getParametersItem());
            // do not allow sum/average parameter in list
            let listFieldParameter = (parentParameter !== null &&
                parentParameter.getValue('type') === Parameter.type.array);

            parameterTypeOptions.push({value: 'string', label: this.rb.getLabel('parameterTypeString')});
            parameterTypeOptions.push({value: 'number', label: this.rb.getLabel('parameterTypeNumber')});
            parameterTypeOptions.push({value: 'boolean', label: this.rb.getLabel('parameterTypeBoolean')});
            parameterTypeOptions.push({value: 'date', label: this.rb.getLabel('parameterTypeDate')});
            parameterTypeOptions.push({value: 'image', label: this.rb.getLabel('parameterTypeImage')});
            if (topLevelParameter) {
                parameterTypeOptions.push({value: 'array', label: this.rb.getLabel('parameterTypeArray')});
            }
            parameterTypeOptions.push({value: 'simple_array', label: this.rb.getLabel('parameterTypeSimpleArray')});
            if (topLevelParameter) {
                parameterTypeOptions.push({value: 'map', label: this.rb.getLabel('parameterTypeMap')});
            }
            if (!listFieldParameter) {
                parameterTypeOptions.push({value: 'sum', label: this.rb.getLabel('parameterTypeSum')});
                parameterTypeOptions.push({value: 'average', label: this.rb.getLabel('parameterTypeAverage')});
            }

            let parameterTypeOptionsChanged = false;
            if (parameterTypeOptions.length !== this.parameterTypeOptions.length) {
                parameterTypeOptionsChanged = true;
            } else {
                for (let i = 0; i < parameterTypeOptions.length; i++) {
                    if (parameterTypeOptions[i].value !== this.parameterTypeOptions[i].value) {
                        parameterTypeOptionsChanged = true;
                        break;
                    }
                }
            }
            if (parameterTypeOptionsChanged) {
                // add dom elements for changed options
                let elParameterType = $('#rbro_parameter_type');
                elParameterType.empty();
                for (let i = 0; i < parameterTypeOptions.length; i++) {
                    let parameterTypeOption = parameterTypeOptions[i];
                    elParameterType.append(
                        `<option value="${parameterTypeOption.value}">${parameterTypeOption.label}</option>`);
                }
                this.parameterTypeOptions = parameterTypeOptions;
            }
        }
    }

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        let selectedObject = this.rb.getSelectedObject();

        if (selectedObject !== null && selectedObject instanceof Parameter) {
            // must be called before setValue so all parameter type options are available
            this.updateVisibileRows(selectedObject, field);

            for (let property in this.propertyDescriptors) {
                if (this.propertyDescriptors.hasOwnProperty(property) && (field === null || property === field)) {
                    let propertyDescriptor = this.propertyDescriptors[property];
                    let value = selectedObject.getValue(property);
                    super.setValue(propertyDescriptor, value, false);
                }
            }

            if (field === null || field === 'type') {
                if (selectedObject.getValue('type') === Parameter.type.date) {
                    $('#rbro_parameter_test_data').attr('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
                } else {
                    $('#rbro_parameter_test_data').attr('placeholder', '');
                }
            }

            ParameterPanel.updateAutosizeInputs(field);
        }
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {String} [field] - affected field in case of change operation.
     */
    static updateAutosizeInputs(field) {
        if (field === null || field === 'expression') {
            autosize.update($('#rbro_parameter_expression'));
        }
    }
}
