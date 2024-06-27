import PanelBase from './PanelBase';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import PopupWindow from '../PopupWindow';
import autosize from 'autosize';
import * as utils from '../utils';

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
            'testDataBoolean': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'test_data_boolean'
            },
            'testDataImage': {
                'type': SetValueCmd.type.file,
                'fieldId': 'test_data_image',
                'rowId': 'rbro_parameter_test_data_image_row',
                'singleRowProperty': false,
                'rowProperties': ['testDataImage', 'testDataImageFilename']
            },
            'testDataImageFilename': {
                'type': SetValueCmd.type.filename,
                'fieldId': 'test_data_image_filename',
                'rowId': 'rbro_parameter_test_data_image_row',
                'singleRowProperty': false
            },
            'testDataRichText': {
                'type': SetValueCmd.type.text,
                'fieldId': 'test_data_rich_text'
            },
        };
        this.parameterTypeOptions = [];
        super.initVisibleIfFields();
    }

    render(data) {
        let panel = utils.createElement('div', { id: 'rbro_parameter_panel', class: 'rbroHidden' });
        let elDiv = utils.createElement('div', { id: 'rbro_parameter_name_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterName'), 'rbro_parameter_name');
        let elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elParameterName = utils.createElement('input', { id: 'rbro_parameter_name', autocomplete: 'off' });
        elParameterName.addEventListener('input', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let newParameterName = elParameterName.value;
                if (newParameterName !== selectedObject.getName()) {
                    let cmdGroup = new CommandGroupCmd('Rename parameter');
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'name', newParameterName,
                        SetValueCmd.type.text, this.rb);
                    cmdGroup.addCommand(cmd);

                    const parents = [];
                    let parent = null;
                    let nextParent = selectedObject.getParent();
                    while (nextParent !== null) {
                        parent = nextParent;
                        parents.unshift(parent);
                        nextParent = parent.getParent();
                    }

                    selectedObject.addUpdateTestDataCmdForChangedParameterName(newParameterName, parents, cmdGroup);

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
            }
        });
        elFormField.append(elParameterName);
        elFormField.append(utils.createElement('div', { id: 'rbro_parameter_name_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_type_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterType'), 'rbro_parameter_type');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elType = utils.createElement('select', { id: 'rbro_parameter_type' });
        elType.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmdGroup = new CommandGroupCmd('Set parameter type');
                let parameterType = elType.value;
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'type', parameterType,
                    SetValueCmd.type.select, this.rb);
                cmdGroup.addCommand(cmd);
                selectedObject.addCommandsForChangedParameterType(parameterType, cmdGroup);
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elType);
        elFormField.append(utils.createElement('div', { id: 'rbro_parameter_type_error', class: 'rbroErrorMessage' }));
        if (this.rb.getProperty('showPlusFeaturesInfo')) {
            const elInfoText = utils.createElement(
                'div', { id: 'rbro_parameter_type_nested_plus_info', class: 'rbroInfo' });
            elInfoText.innerHTML = this.rb.getLabel('plusFeatureInfoNestedParameter');
            elFormField.append(elInfoText);
        }
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_array_item_type_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterArrayItemType'), 'rbro_parameter_array_item_type_row');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elArrayItemType = utils.createElement('select', { id: 'rbro_parameter_array_item_type' });
        elArrayItemType.append(
            utils.createElement('option', { value: 'string' }, this.rb.getLabel('parameterTypeString')));
        elArrayItemType.append(
            utils.createElement('option', { value: 'number' }, this.rb.getLabel('parameterTypeNumber')));
        elArrayItemType.append(
            utils.createElement('option', { value: 'boolean' }, this.rb.getLabel('parameterTypeBoolean')));
        elArrayItemType.append(
            utils.createElement('option', { value: 'date' }, this.rb.getLabel('parameterTypeDate')));
        if (this.rb.getProperty('showPlusFeatures')) {
            elArrayItemType.append(
                utils.createElement('option', { value: 'rich_text' }, this.rb.getLabel('parameterTypeRichText')));
        }
        elArrayItemType.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'arrayItemType', elArrayItemType.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elArrayItemType);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_parameter_array_item_type_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        panel.append(elDiv);

        const evalContainerProps = {}
        if (!this.rb.getProperty('adminMode')) {
            evalContainerProps.style = 'display: none';
        }
        const elParameterEvalContainer = utils.createElement('div', evalContainerProps);
        elDiv = utils.createElement('div', { id: 'rbro_parameter_eval_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterEval'), 'rbro_parameter_eval');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elEval = utils.createElement('input', { id: 'rbro_parameter_eval', type: 'checkbox' });
        elEval.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'eval', elEval.checked,
                    SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elEval);
        elDiv.append(elFormField);
        elParameterEvalContainer.append(elDiv);
        panel.append(elParameterEvalContainer);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_nullable_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterNullable'), 'rbro_parameter_nullable');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elNullable = utils.createElement('input', { id: 'rbro_parameter_nullable', type: 'checkbox' });
        elNullable.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'nullable', elNullable.checked,
                    SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elNullable);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_pattern_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterPattern'), 'rbro_parameter_pattern');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elPattern = utils.createElement('input', { id: 'rbro_parameter_pattern', autocomplete: 'off' });
        elPattern.addEventListener('input', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'pattern', elPattern.value, SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elSplit.append(elPattern);
        let elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
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
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_parameter_pattern_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_expression_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterExpression'), 'rbro_parameter_expression');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elExpression = utils.createElement('textarea', { id: 'rbro_parameter_expression', rows: '1' });
        elExpression.addEventListener('input', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'expression', elExpression.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        autosize(elExpression);
        elSplit.append(elExpression);
        elParameterButton = utils.createElement(
            'div', {
                id: 'rbro_parameter_expression_param_button',
                class: 'rbroButton rbroRoundButton rbroIcon-select'
            });
        elParameterButton.addEventListener('click', (event) => {
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
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_parameter_expression_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        panel.append(elDiv);

        const elTestDataContainer = utils.createElement('div', { id: 'rbro_parameter_test_data_container' });
        elDiv = utils.createElement('div', { id: 'rbro_parameter_test_data_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterTestData'), 'rbro_parameter_test_data');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elTestData = utils.createElement('input', { id: 'rbro_parameter_test_data', autocomplete: 'off' });
        elTestData.addEventListener('input', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'testData', elTestData.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elTestData);
        let elEditTestDataButton = utils.createElement(
            'button', {
                id: 'rbro_parameter_edit_test_data',
                class: 'rbroButton rbroActionButton'
            });
        elEditTestDataButton.append(utils.createElement('span', {}, this.rb.getLabel('parameterEditTestData')));
        elEditTestDataButton.append(utils.createElement('span', { class: 'rbroIcon-edit' }));
        elEditTestDataButton.addEventListener('click', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                const fields = selectedObject.getParameterFields();
                if (fields.length > 0) {
                    this.rb.getPopupWindow().show(
                        null, selectedObject.getId(), '', 'testData', PopupWindow.type.data, null, selectedObject,
                        null, null, null);
                } else {
                    if (selectedObject.getValue('type') === Parameter.type.map) {
                        alert(this.rb.getLabel('parameterEditTestDataMapNoFields'));
                    } else {
                        alert(this.rb.getLabel('parameterEditTestDataArrayNoFields'));
                    }
                }
            }
        });
        elFormField.append(elEditTestDataButton);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_parameter_test_data_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        elTestDataContainer.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_test_data_boolean_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterTestData'), 'rbro_parameter_test_data_boolean');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        const elTestDataBoolean = utils.createElement(
            'input', { id: 'rbro_parameter_test_data_boolean', type: 'checkbox' });
        elTestDataBoolean.addEventListener('change', (event) => {
            const testDataBooleanChecked = elTestDataBoolean.checked;
            const selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'testDataBoolean', testDataBooleanChecked,
                    SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elTestDataBoolean);
        elDiv.append(elFormField);
        elTestDataContainer.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_test_data_image_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterTestData'), 'rbro_parameter_test_data_image');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        const elTestDataImage = utils.createElement('input', { id: 'rbro_parameter_test_data_image', type: 'file' });
        elTestDataImage.addEventListener('change', (event) => {
            const rb = this.rb;

            function setImage(imageData, imageFileName) {
                const cmdGroup = new CommandGroupCmd('Load image', rb);
                const selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    const obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'testDataImage', imageData, SetValueCmd.type.file, rb));
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'testDataImageFilename', imageFileName, SetValueCmd.type.filename, rb));
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            }

            const files = event.target.files;
            if (files && files[0]) {
                utils.readImageData(files[0], setImage, this.rb);
            }
        });
        elFormField.append(elTestDataImage);
        let elTestDataFilenameDiv = utils.createElement(
            'div', { id: 'rbro_parameter_test_data_image_filename_container', class: 'rbroSplit rbroHidden' });
        elTestDataFilenameDiv.append(utils.createElement('div', { id: 'rbro_parameter_test_data_image_filename' }));
        const elTestDataImageFilenameClear = utils.createElement(
            'div', {
                id: 'rbro_parameter_test_data_image_filename_clear',
                class: 'rbroIcon-cancel rbroButton rbroDeleteButton rbroRoundButton'
            });
        elTestDataImageFilenameClear.addEventListener('click', (event) => {
            elTestDataImage.value = '';
            let cmdGroup = new CommandGroupCmd('Clear image', this.rb);
            const selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                cmdGroup.addSelection(selectedObject.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    selectedObject.getId(), 'testDataImage', '', SetValueCmd.type.file, this.rb));
                cmdGroup.addCommand(new SetValueCmd(
                    selectedObject.getId(), 'testDataImageFilename', '', SetValueCmd.type.filename, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elTestDataFilenameDiv.append(elTestDataImageFilenameClear);
        elFormField.append(elTestDataFilenameDiv);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_parameter_test_data_image_error', class: 'rbroErrorMessage' }));
        elFormField.append(
            utils.createElement('div', { class: 'rbroInfo' }, this.rb.getLabel('parameterTestDataImageInfo')));
        elDiv.append(elFormField);
        elTestDataContainer.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_parameter_test_data_rich_text_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('parameterTestData'), 'rbro_parameter_test_data_rich_text');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        const elTestDataRichText = utils.createElement(
          'textarea', { id: 'rbro_parameter_test_data_rich_text', rows: 1, autocomplete: 'off' });
        elTestDataRichText.addEventListener('input', (event) => {
            const selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'testDataRichText', elTestDataRichText.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        autosize(elTestDataRichText);
        elFormField.append(elTestDataRichText);
        const elInfoText = utils.createElement(
            'div', { id: 'rbro_parameter_test_data_rich_text_plus_info', class: 'rbroInfo' });
        elInfoText.innerHTML = this.rb.getLabel('parameterTestDataRichTextInfo');
        elFormField.append(elInfoText);
        elDiv.append(elFormField);
        elTestDataContainer.append(elDiv);

        panel.append(elTestDataContainer);

        document.getElementById('rbro_detail_panel').append(panel);
    }

    /**
     * Update visibility of all property rows.
     * @param {Parameter} obj - selected parameter.
     * @param {?String} field - affected field in case of change operation.
     */
    updateVisibileRows(obj, field) {
        const type = obj.getValue('type');
        const valueType = (type === Parameter.type.simpleArray) ? obj.getValue('arrayItemType') : type;
        const showOnlyNameType = obj.getValue('showOnlyNameType');
        let parentParameter = null;
        if (obj.getPanelItem() !== null && obj.getPanelItem().getParent().getData() instanceof Parameter) {
            parentParameter = obj.getPanelItem().getParent().getData();
        }

        if (field === null) {
            const editable = obj.getValue('editable');
            document.getElementById('rbro_parameter_name').disabled = !editable;
            document.getElementById('rbro_parameter_type').disabled = !editable;
            document.getElementById('rbro_parameter_eval').disabled = !editable;
            document.getElementById('rbro_parameter_nullable').disabled = !editable;
            document.getElementById('rbro_parameter_pattern').disabled = !editable;
            document.getElementById('rbro_parameter_expression').disabled = !editable;
            if (editable) {
                document.querySelector('#rbro_parameter_name_row label').classList.remove('rbroDisabled');
                document.querySelector('#rbro_parameter_type_row label').classList.remove('rbroDisabled');
                document.querySelector('#rbro_parameter_eval_row label').classList.remove('rbroDisabled');
                document.querySelector('#rbro_parameter_nullable_row label').classList.remove('rbroDisabled');
                document.querySelector('#rbro_parameter_pattern_row label').classList.remove('rbroDisabled');
                document.querySelector('#rbro_parameter_expression_row label').classList.remove('rbroDisabled');
            } else {
                document.querySelector('#rbro_parameter_name_row label').classList.add('rbroDisabled');
                document.querySelector('#rbro_parameter_type_row label').classList.add('rbroDisabled');
                document.querySelector('#rbro_parameter_eval_row label').classList.add('rbroDisabled');
                document.querySelector('#rbro_parameter_nullable_row label').classList.add('rbroDisabled');
                document.querySelector('#rbro_parameter_pattern_row label').classList.add('rbroDisabled');
                document.querySelector('#rbro_parameter_expression_row label').classList.add('rbroDisabled');
            }
        }

        if (field === null || field === 'type') {
            if (type === Parameter.type.simpleArray) {
                document.getElementById('rbro_parameter_array_item_type_row').removeAttribute('style');
            } else {
                document.getElementById('rbro_parameter_array_item_type_row').style.display = 'none';
            }
            if (type === Parameter.type.string || type === Parameter.type.number ||
                    type === Parameter.type.boolean || type === Parameter.type.date || type === Parameter.type.image ||
                    type === Parameter.type.array || type === Parameter.type.simpleArray ||
                    type === Parameter.type.map) {
                document.getElementById('rbro_parameter_nullable_row').removeAttribute('style');
            } else {
                document.getElementById('rbro_parameter_nullable_row').style.display = 'none';
            }
        }
        if (field === null || field === 'type' || field === 'arrayItemType') {
            if ((valueType === Parameter.type.number || valueType === Parameter.type.date ||
                    valueType === Parameter.type.sum || valueType === Parameter.type.average) && !showOnlyNameType) {
                document.getElementById('rbro_parameter_pattern_row').removeAttribute('style');
            } else {
                document.getElementById('rbro_parameter_pattern_row').style.display = 'none';
            }
        }
        if (field === null || field === 'type' || field === 'eval') {
            if (type === Parameter.type.sum || type === Parameter.type.average || showOnlyNameType) {
                document.getElementById('rbro_parameter_eval_row').style.display = 'none';
                document.getElementById('rbro_parameter_test_data_container').style.display = 'none';
            } else {
                if (type === Parameter.type.image || type === Parameter.type.richText ||
                        type === Parameter.type.array || type === Parameter.type.simpleArray ||
                        type === Parameter.type.map) {
                    document.getElementById('rbro_parameter_eval_row').style.display = 'none';
                } else {
                    document.getElementById('rbro_parameter_eval_row').removeAttribute('style');
                }
                if (parentParameter !== null ||
                        (obj.getValue('eval') && (type === Parameter.type.string || type === Parameter.type.number ||
                            type === Parameter.type.boolean || type === Parameter.type.date))) {
                    document.getElementById('rbro_parameter_test_data_container').style.display = 'none';
                } else {
                    document.getElementById('rbro_parameter_test_data_container').removeAttribute('style');
                }
                if (type === Parameter.type.array || type === Parameter.type.simpleArray ||
                        type === Parameter.type.map || type === Parameter.type.string ||
                        type === Parameter.type.number || type === Parameter.type.date) {
                    document.getElementById('rbro_parameter_test_data_row').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_test_data_row').style.display = 'none';
                }
                if (type === Parameter.type.array || type === Parameter.type.simpleArray ||
                        type === Parameter.type.map) {
                    document.getElementById('rbro_parameter_edit_test_data').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_edit_test_data').style.display = 'none';
                }
                if (type === Parameter.type.string || type === Parameter.type.number ||
                        type === Parameter.type.date) {
                    document.getElementById('rbro_parameter_test_data').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_test_data').style.display = 'none';
                }
                if (type === Parameter.type.boolean) {
                    document.getElementById('rbro_parameter_test_data_boolean_row').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_test_data_boolean_row').style.display = 'none';
                }
                if (type === Parameter.type.image) {
                    document.getElementById('rbro_parameter_test_data_image_row').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_test_data_image_row').style.display = 'none';
                }
                if (type === Parameter.type.richText) {
                    document.getElementById('rbro_parameter_test_data_rich_text_row').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_test_data_rich_text_row').style.display = 'none';
                }
            }

            if (this.rb.getProperty('showPlusFeaturesInfo')) {
                // show/hide info about nested parameters only available in PLUS version
                if (parentParameter !== null && (type === Parameter.type.map || type === Parameter.type.array)) {
                    document.getElementById('rbro_parameter_type_nested_plus_info').removeAttribute('style');
                } else {
                    document.getElementById('rbro_parameter_type_nested_plus_info').style.display = 'none';
                }
            }

            if (((obj.getValue('eval') && (type === Parameter.type.string || type === Parameter.type.number ||
                  type === Parameter.type.boolean || type === Parameter.type.date)) ||
                    (type === Parameter.type.sum || type === Parameter.type.average)) && !showOnlyNameType) {
                document.getElementById('rbro_parameter_expression_row').removeAttribute('style');
            } else {
                document.getElementById('rbro_parameter_expression_row').style.display = 'none';
            }
        }

        if (field === null) {
            const parameterTypeOptions = [];
            // do not allow sum/average parameter in list
            const listFieldParameter = (parentParameter !== null &&
                parentParameter.getValue('type') === Parameter.type.array);

            parameterTypeOptions.push({value: 'string', label: this.rb.getLabel('parameterTypeString')});
            parameterTypeOptions.push({value: 'number', label: this.rb.getLabel('parameterTypeNumber')});
            parameterTypeOptions.push({value: 'boolean', label: this.rb.getLabel('parameterTypeBoolean')});
            parameterTypeOptions.push({value: 'date', label: this.rb.getLabel('parameterTypeDate')});
            parameterTypeOptions.push({value: 'image', label: this.rb.getLabel('parameterTypeImage')});
            if (this.rb.getProperty('showPlusFeatures')) {
                parameterTypeOptions.push({value: 'rich_text', label: this.rb.getLabel('parameterTypeRichText')});
            }
            if (parentParameter === null || this.rb.getProperty('showPlusFeatures')) {
                parameterTypeOptions.push({value: 'array', label: this.rb.getLabel('parameterTypeArray')});
            }
            parameterTypeOptions.push({value: 'simple_array', label: this.rb.getLabel('parameterTypeSimpleArray')});
            if (parentParameter === null || this.rb.getProperty('showPlusFeatures')) {
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
                let elParameterType = document.getElementById('rbro_parameter_type');
                utils.emptyElement(elParameterType);
                for (let i = 0; i < parameterTypeOptions.length; i++) {
                    let parameterTypeOption = parameterTypeOptions[i];
                    elParameterType.append(
                        utils.createElement('option', { value: parameterTypeOption.value }, parameterTypeOption.label));
                }
                this.parameterTypeOptions = parameterTypeOptions;
            }
        }
    }

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data objects.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        const selectedObject = this.rb.getSelectedObject();
        if (selectedObject !== null && selectedObject instanceof Parameter) {
            // must be called before setValue so all parameter type options are available
            this.updateVisibileRows(selectedObject, field);

            if (field === null || field === 'type') {
                if (selectedObject.getValue('type') === Parameter.type.date) {
                    document.getElementById('rbro_parameter_test_data').setAttribute(
                        'placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
                } else {
                    document.getElementById('rbro_parameter_test_data').setAttribute('placeholder', '');
                }
            }
        }
        super.updateDisplay(field);
    }

    /**
     * Update size of all autosize textareas in panel.
     * @param {?String} field - affected field in case of change operation.
     */
    updateAutosizeInputs(field) {
        if (field === null || field === 'expression') {
            autosize.update(document.getElementById('rbro_parameter_expression'));
        }
        if (field === null || field === 'type') {
            autosize.update(document.getElementById('rbro_parameter_test_data_rich_text'));
        }
    }
}
